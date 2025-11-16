import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
      'Please check your .env file and ensure all Supabase credentials are set.'
  );
}

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client for general use (with anon key)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Backend doesn't need to persist sessions
  },
});

// Create Supabase admin client (with service role key) for operations that bypass RLS
export const supabaseAdmin: SupabaseClient | null = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper function to get authenticated Supabase client with user's JWT
export const getAuthenticatedClient = (accessToken: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('transactions').select('id').limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
    
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Export configuration for use in other modules
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
};
