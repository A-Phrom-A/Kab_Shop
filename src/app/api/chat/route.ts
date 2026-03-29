import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Setup Supabase admin client to insert AI replies safely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Allow longer responses up to 30 seconds
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

CRITICAL INSTRUCTION:
When a user asks for product recommendations or mentions ANY product type (e.g., pens, pencils, notebooks, tools), you MUST call the "searchProducts" tool first to find real products in the catalog. DO NOT make up products. Use 'category', 'tag', or 'keyword' to filter. 
Translating user intents: "ปากกาพรีเมียม" -> category="Pens" AND tag="Premium". "ปากกาถูกๆ" -> category="Pens", tag="Cheap & Good". "สีไม้" -> keyword="สีไม้".

After receiving tool results, naturally integrate the product names into your Thai response. To display them as UI cards, simply output the IDs at the very end formatted as: $$PRODUCT_IDS: id1,id2$$`;
    }

    const genResult = await generateText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages,
      tools: {
        searchProducts: tool({
          description: 'ALWAYS use this tool to search for products when the user inquires about buying, viewing, or finding products.',
          inputSchema: z.object({
            category: z.string().optional().describe('Exact category name (e.g., "Pens", "Notebooks").'),
            tag: z.string().optional().describe('Specific exact tag (e.g., "Value for Money", "Premium").'),
            keyword: z.string().optional().describe('Brand or general item name (e.g., "Tombow", "สี").'),
          }),
          execute: async ({ category, tag, keyword }) => {
            console.log(`[FILTER] Cat=${category}, Tag=${tag}, Key=${keyword}`);
            try {
              // Helper to run query
              const runQuery = async (c?: string, t?: string, k?: string) => {
                let query = supabaseAdmin
                  .from('products')
                  .select('id, name, price, stock, image_urls, tags, categories!inner(name)');
                
                if (c) query = query.ilike('categories.name', `%${c}%`);
                if (t) query = query.contains('tags', [t]);
                if (k) query = query.or(`name.ilike.%${k}%,description.ilike.%${k}%`);
                
                return await query.limit(8);
              };

              // 1. Strict Search
              let { data, error } = await runQuery(category, tag, keyword);
              
              // 2. Fallback: Drop Tag
              if ((!data || data.length === 0) && tag) {
                 console.log(`[FALLBACK 1] Dropping tag: ${tag}`);
                 const res = await runQuery(category, undefined, keyword);
                 data = res.data; error = res.error;
              }

              // 3. Fallback: Drop Keyword (keep only Category)
              if ((!data || data.length === 0) && keyword && category) {
                 console.log(`[FALLBACK 2] Dropping keyword: ${keyword}`);
                 const res = await runQuery(category, undefined, undefined);
                 data = res.data; error = res.error;
              }
              
              // 4. Fallback: Global Keyword Search
              if ((!data || data.length === 0) && keyword) {
                 console.log(`[FALLBACK 3] Global keyword search: ${keyword}`);
                 const res = await runQuery(undefined, undefined, keyword);
                 data = res.data; error = res.error;
              }

              if (error) return { error: error.message };
              if (!data || data.length === 0) return { message: "No items found in catalog. Tell the user you don't have this specifically." };
              
              return data;
            } catch (err: any) {
              return { error: err.message };
            }
          },
        }),
        checkOrderStatus: tool({
          description: 'Check the shipping status of a specific order ID or tracking number.',
          inputSchema: z.object({
            orderId: z.string().describe('The UUID or partial ID of the order.'),
          }),
          execute: async ({ orderId }) => {
            const { data, error } = await supabaseAdmin
              .from('orders')
              .select('id, status, total, tracking_number')
              .ilike('id', `${orderId}%`)
              .single();
            
            if (error || !data) return { status: 'Not found', message: `Order ${orderId} does not exist.` };
            return data;
          },
        }),
      }
    });

    const text = genResult.text || '';
    // IMPORTANT: with multi-step generateText, toolResults only has LAST step results.
    // We must collect results from ALL steps to find searchProducts from step 1.
    const allToolResults = genResult.steps?.flatMap((s: any) => s.toolResults ?? []) ?? [];

    let finalContent = text.trim();

    // Safely extract product tool results if model forgot to output the tag
    if (!finalContent.includes('$$PRODUCT_IDS:')) {
       const searchResult = allToolResults.find((t: any) => t.toolName === 'searchProducts');
       const orderResult = allToolResults.find((t: any) => t.toolName === 'checkOrderStatus');
       
       if (searchResult && Array.isArray(searchResult.result) && searchResult.result.length > 0) {
          const ids = searchResult.result.map((p: any) => p.id).join(',');
          finalContent = finalContent ? `${finalContent}\n\n$$PRODUCT_IDS: ${ids}$$` : `เจอสินค้าที่น่าจะถูกใจตามนี้ครับ ✨\n$$PRODUCT_IDS: ${ids}$$`;
       } else if (orderResult && orderResult.result.status) {
          finalContent = finalContent ? `${finalContent}\n\nสถานะ: ${orderResult.result.status}` : `ข้อมูลออเดอร์:\nสถานะ: ${orderResult.result.status}\nยอดรวม: $${orderResult.result.total}`;
       }
    }

    if (!finalContent.trim()) {
       finalContent = "ขออภัยครับ ข้อมูลไม่เพียงพอ หรือมีการตอบสนองขัดข้อง";
    }

    // Save to the database, which will trigger Supabase realtime in the frontend
    if (roomId && finalContent.trim().length > 0) {
      const { error: dbError } = await supabaseAdmin.from('chat_messages').insert({
        room_id: roomId,
        sender_id: null,
        sender_role: 'ai',
        message_type: 'text',
        content: finalContent
      });
      if (dbError) console.error("Database Insert Error:", dbError);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json'} });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500, headers: { 'Content-Type': 'application/json'} });
  }
}
