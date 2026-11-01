export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isConfigured = process.env.FORMA_DEMO_MODE !== "1" && Boolean(supabaseUrl && supabaseKey);
