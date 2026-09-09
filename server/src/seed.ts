import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { generateDemoData } from './seedData';

async function seed() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    console.error('Cannot seed: Supabase URL and Service Key are required in .env');
    return;
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  
  const data = generateDemoData();

  console.log('Seeding regional indices...');
  for (const region of data.regionalIndices) {
    await supabase.from('airfare_indices').insert({
      region: region.region,
      index_value: region.value,
      previous_value: region.value - (region.value * (region.change / 100)),
    });
  }

  console.log('Seeding AI insights...');
  for (const insight of data.aiInsights) {
    await supabase.from('ai_insights').insert({
      type: insight.type,
      title: insight.title,
      content: insight.content,
      data_snapshot: data.metrics,
    });
  }

  console.log('Seeding complete! Note: Airports/Routes require real geographical data to be fully populated.');
}

seed().catch(console.error);
