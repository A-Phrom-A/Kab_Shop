import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
});

// Setup Supabase (Use SERVICE_ROLE_KEY to bypass RLS for updating products)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfrpetebgpcyigqzdbjp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_T7lFFJp_Gq1OXkgrbLnm7g_Wypkr_Pq';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Setup Gemini
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'AIzaSyA3pw4Fl7PqU_wHp6p9jk3-zJxXu0bi76g';

async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] }
    })
  });
  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    console.error("Failed to generate embedding for text:", text, data);
    return null;
  }
  return data.embedding.values;
}

async function run() {
  console.log('Fetching products missing embeddings from Supabase...');
  const { data: products, error } = await supabase.from('products').select('*').is('embedding', null);
  
  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }
  
  if (products.length === 0) {
    console.log('🎉 All products already have embeddings! Nothing to do.');
    return;
  }
  
  console.log(`Found ${products.length} products to process. Starting embedding...`);
  
  let successCount = 0;
  
  for (const product of products) {
    // Create a rich text representation of the product for semantic matching
    const contentToEmbed = `
Product Name: ${product.name}
Category/Type: ${product.tags ? product.tags.join(', ') : 'Stationery'}
Description: ${product.description || ''}
Attributes: ${JSON.stringify(product.specs || {})}
    `.trim();
    
    try {
      console.log(`\nGenerating 3072-d vector for: ${product.name}`);
      const embedding = await generateEmbedding(contentToEmbed);
      
      if (embedding) {
        // Update the product with its new 3072-d embedding
        const { error: updateError } = await supabase
          .from('products')
          .update({ embedding })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`Failed to save embedding for ${product.id}:`, updateError);
        } else {
          successCount++;
          console.log(`✅ Indexed: ${product.name}`);
        }
      }
    } catch (err) {
      console.error(`🛑 Error processing ${product.name}:`, err);
    }
    
    // Rate limit safeguard: wait 1 second between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Process Complete! Embedded ${successCount}/${products.length} products.`);
}

run();
