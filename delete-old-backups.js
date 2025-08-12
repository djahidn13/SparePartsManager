import 'dotenv/config';
import pkg from '@supabase/supabase-js';

const { createClient } = pkg;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deleteOldBackups() {
  // Keep only the latest 24 backups (1 day if run hourly)
  const { data, error } = await supabase
    .from('app_backups')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching backups:', error);
    return;
  }

  const toDelete = data.slice(24); // delete everything after latest 24
  for (const backup of toDelete) {
    const { error: deleteError } = await supabase
      .from('app_backups')
      .delete()
      .eq('id', backup.id);

    if (deleteError) {
      console.error('Error deleting backup:', backup.id, deleteError);
    } else {
      console.log(`Deleted old backup: ${backup.id}`);
    }
  }
}

deleteOldBackups();
