import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qtebaphxuuosspzjmjeu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZWJhcGh4dXVvc3NwemptamV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDczMDcsImV4cCI6MjA3NTcyMzMwN30.gLOnP7IsXS3uo-i__xAuWThaRzF6G0G0NFGP8-XKzQk';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Assessment {
  id: string;
  created_at: string;
  answers: boolean[];
  yes_count: number;
  total_questions: number;
  risk_level: "Low" | "Medium" | "High";
}
