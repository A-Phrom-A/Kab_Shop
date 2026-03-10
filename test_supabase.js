const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, total_price, status, created_at,
      order_items (id, order_id, price_at_purchase, cost_at_purchase, quantity)
    `)
    .limit(1);
    
  if (error) {
    console.error("FULL ERROR:");
    console.dir(error, { depth: null });
  } else {
    console.log("SUCCESS");
  }
}

test();
