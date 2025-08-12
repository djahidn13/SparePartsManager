import fs from "fs";
import path from "path";
import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

// Supabase credentials
const supabase = createClient(
  "https://aqqnyxauuzxexmvjmvkq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcW55eGF1dXp4ZXhtdmptdmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgxNTQ3MCwiZXhwIjoyMDcwMzkxNDcwfQ.Ngt71blYhXknA7KnXw_yPpYxDVHNZ7uAGFzGSt2JBIE"
);

// Folder where backups are stored
const backupDir = "D:/autoparts-backup";

// Function to get the latest backup file
function getLatestBackupFile() {
  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith(".json"))
    .map(file => ({
      name: file,
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? files[0].name : null;
}

// Function to upload the latest backup
async function uploadLatestBackup() {
  const latestFile = getLatestBackupFile();
  if (!latestFile) {
    console.log("⚠ No backup file found.");
    return;
  }

  const filePath = path.join(backupDir, latestFile);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const { error } = await supabase
    .from("app_backups")
    .insert([
      {
        data: JSON.parse(fileContent),
        filename: latestFile
      }
    ]);

  if (error) {
    console.error("❌ Error uploading backup:", error);
  } else {
    console.log(`✅ Uploaded latest backup: ${latestFile}`);
  }
}

// Schedule the task to run every hour
cron.schedule("0 * * * *", () => {
  console.log("⏳ Running hourly backup upload...");
  uploadLatestBackup();
});

// Run immediately on script start
uploadLatestBackup();
