import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://diajzedjuewjmmmjlsms.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYWp6ZWRqdWV3am1tbWpsc21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTEwNzgsImV4cCI6MjA5NTU2NzA3OH0.zrh102StP08md6-s9rtfirrwZvPs2fREzB0EnzvSf88";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

