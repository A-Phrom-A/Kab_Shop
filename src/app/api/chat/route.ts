import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Setup Supabase admin client to insert AI replies safely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, roomType, roomId, userId } = await req.json();

    let systemPrompt = "You are a helpful assistant.";
    
    if (roomType === 'ai_recommender') {
      systemPrompt = `You are a product recommendation expert for KabShop (premium stationery). Respond in Thai.

KABSHOP CATALOG:
- Categories: Pencils, Pens, Erasers, Various Tools, Correction, Notebooks, Pocket Notebooks, Math Books, Science Books, Social Books, History Books.
- Tags: Value for Money, Cheap & Good, Mechanical, New, Education, Creative, Premium.

SEARCH LOGIC:
1. If user asks for a category (e.g., "สมุด" -> "Notebooks"), use 'category'.
2. If user asks for a style (e.g., "ราคาประหยัด" -> "Value for Money", "มาใหม่" -> "New"), use 'tag'.
3. If user asks for a brand or specific item (e.g., "Tombow"), use 'keyword'.

At the END of your response, you MUST output: $$PRODUCT_IDS: id1,id2,id3$$`;
    } else if (roomType === 'ai_support') {
      systemPrompt = `You are a customer support agent for KabShop. Answer questions in Thai. If checking an order, use \`checkOrderStatus\`.`;
    }

    const streamOptions: any = {
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
      maxSteps: 3, 
      maxToolRoundtrips: 3, // For older ai sdk compatibility
      tools: {
        searchProducts: {
          description: 'Filter products by category, tag, or keyword.',
          parameters: z.object({
            category: z.string().optional().describe('Category name (e.g., "Pens", "Notebooks").'),
            tag: z.string().optional().describe('Specific tag (e.g., "Value for Money").'),
            keyword: z.string().optional().describe('Brand or name (e.g., "Tombow").'),
          }),
          execute: async ({ category, tag, keyword }: { category?: string, tag?: string, keyword?: string }) => {
            console.log(`[FILTER] Cat=${category}, Tag=${tag}, Key=${keyword}`);
            try {
              let query = supabaseAdmin
                .from('products')
                .select('id, name, price, stock, image_urls, tags, categories!inner(name)');
              
              if (category) query = query.ilike('categories.name', `%${category}%`);
              if (tag) query = query.contains('tags', [tag]);
              if (keyword) query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);

              const { data, error } = await query.limit(8);
              if (error) return { error: error.message };
              if (!data || data.length === 0) return { message: "No items found." };
              return data;
            } catch (err: any) {
              return { error: err.message };
            }
          },
        },
        checkOrderStatus: {
          description: 'Check the shipping status of a specific order ID or tracking number.',
          parameters: z.object({
            orderId: z.string().describe('The UUID or partial ID of the order.'),
          }),
          execute: async ({ orderId }: { orderId: string }) => {
            const { data, error } = await supabaseAdmin
              .from('orders')
              .select('id, status, total, tracking_number')
              .ilike('id', `${orderId}%`)
              .single();
            
            if (error || !data) return { status: 'Not found', message: `Order ${orderId} does not exist.` };
            return data;
          },
        },
      },
      async onFinish({ text, toolCalls, toolResults }: any) {
        let finalContent = text || '';

        // Safely extract product tool results if text generation stopped early
        if (toolResults && toolResults.length > 0) {
           const searchResult = toolResults.find((t: any) => t.toolName === 'searchProducts');
           const orderResult = toolResults.find((t: any) => t.toolName === 'checkOrderStatus');
           
           if (searchResult && Array.isArray(searchResult.result) && searchResult.result.length > 0) {
              const ids = searchResult.result.map((p: any) => p.id).join(',');
              finalContent = `เจอสินค้าที่น่าจะถูกใจแล้วครับ ✨ $$PRODUCT_IDS: ${ids}$$`;
           } else if (orderResult && orderResult.result.status) {
              finalContent = `ข้อมูลสถานะออเดอร์:\nสถานะ: ${orderResult.result.status}\nยอดรวม: $${orderResult.result.total}`;
           } else if (searchResult && !finalContent) {
              finalContent = "ขออภัยครับ ค้นหาแล้วยังไม่พบสินค้าที่ใกล้เคียงครับ";
           }
        }

        // When AI finishes generating, save it to the database
        if (roomId && finalContent.trim().length > 0) {
          const { error: dbError } = await supabaseAdmin.from('chat_messages').insert({
            room_id: roomId,
            sender_id: null,
            sender_role: 'ai',
            message_type: 'text',
            content: finalContent
          });
          if (dbError) console.error("Database Insert Error inside AI limit:", dbError);
        }
      }
    };
    
    // Pass as any to bypass strict type checking for maxSteps in older @ai-sdk/core versions
    const result = streamText(streamOptions as any);

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500, headers: { 'Content-Type': 'application/json'} });
  }
}
