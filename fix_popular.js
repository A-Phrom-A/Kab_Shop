require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('Fetching Popular category...');
  const { data: popularCategory } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Popular')
    .single();

  if (!popularCategory) {
    console.log('Popular category not found. Nothing to update.');
    return;
  }

  console.log('Fetching Pencils category as fallback...');
  const { data: pencilsCategory } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Pencils')
    .single();

  if (!pencilsCategory) {
    console.log('Pencils category not found. Aborting.');
    return;
  }

  console.log('Fetching products in Popular category...');
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', popularCategory.id);

  if (products && products.length > 0) {
    console.log(`Found ${products.length} products to reassign.`);
    for (const p of products) {
      const tags = p.tags || [];
      if (!tags.includes('Popular')) {
        tags.push('Popular');
      }
      // Reassign to Pencils and add Popular tag
      await supabase
        .from('products')
        .update({ category_id: pencilsCategory.id, tags })
        .eq('id', p.id);
      
      console.log(`Updated product: ${p.name}`);
    }
  }

  console.log('Deleting Popular category...');
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', popularCategory.id);
    
  if (error) {
    console.error('Error deleting Popular category:', error.message);
  } else {
    console.log('Popular category deleted successfully.');
  }

  console.log('Done.');
}

run();
