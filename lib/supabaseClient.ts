// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// This client uses your public anon key (safe for client-side like mobile & desktop UI)
// Never put your service_role key here — keep that for server/desktop-only scripts
const supabaseUrl = 'https://aqqnyxauuzxexmvjmvkq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcW55eGF1dXp4ZXhtdmptdmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTU0NzAsImV4cCI6MjA3MDM5MTQ3MH0.1SHowu2q4H2ElWCm9rtxKxl_oZgyHilzI7ugmYgULm4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
