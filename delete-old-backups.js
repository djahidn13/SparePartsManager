// delete-old-backups.js
import pkg from '@supabase/supabase-js';
import 'dotenv/config'; // to load env variables from .env file
const { createClient } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role needed for delete
);

async function main() {
  const { error } = await supabase.rpc('delete_old_backups');
  if (error) {
    console.error('Error deleting old backups:', error);
    process.exit(1);
  } else {
    console.log('Old backups deleted successfully.');
  }
}

main();
