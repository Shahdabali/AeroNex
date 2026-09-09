import { createClient } from '@supabase/supabase-js';
import { config } from './config';

async function sync() {
  console.log('=== AeroNex Supabase Sync & Verification ===');
  console.log('Supabase URL:', config.supabaseUrl);
  console.log('Key Status:', config.supabaseServiceKey ? 'Configured' : 'Missing');

  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in server/.env');
    process.exit(1);
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  console.log('\nChecking table status...');
  const tables = ['airports', 'airlines', 'routes', 'fare_prices', 'airfare_indices', 'ai_insights', 'todos'];
  
  let missingTables = 0;
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      if (error.code === 'PGRST205') {
        console.log(`[Missing] Table '${table}' does not exist in schema cache.`);
        missingTables++;
      } else {
        console.log(`[Error] Table '${table}' query error:`, error.message);
      }
    } else {
      console.log(`[OK] Table '${table}' is accessible and active.`);
    }
  }

  if (missingTables > 0) {
    console.log('\n--------------------------------------------------------------');
    console.log('NOTICE: Database tables need to be created in Supabase.');
    console.log('Please copy and execute the SQL file:');
    console.log('server/supabase/migrations/000_complete_aeronex_schema.sql');
    console.log('in your Supabase Dashboard -> SQL Editor -> Run');
    console.log('--------------------------------------------------------------\n');
  } else {
    console.log('\n?? All tables verified successfully in Supabase!');
  }
}

sync().catch(console.error);
