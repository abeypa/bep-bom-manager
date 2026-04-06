import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      purchase_order_items (
        id,
        project_parts (
          project_sections (
            projects (
              project_number
            )
          )
        )
      )
    `)
    .limit(1);

  console.log(JSON.stringify(data, null, 2));
  if (error) console.error(error);
}

run();
