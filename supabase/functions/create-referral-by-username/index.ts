import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface ReferralRequest {
  referrer_username: string;
  user_id: string;
}

interface ReferralResponse {
  success: boolean;
  error?: string;
  referrer_id?: string;
  referrer_username?: string;
  message?: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Missing authorization header', { status: 401 });
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Invalid token', { status: 401 });
    }

    // Parse the request body
    const { referrer_username, user_id }: ReferralRequest = await req.json();

    // Validate input
    if (!referrer_username || !user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing referrer_username or user_id'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the user_id matches the authenticated user
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User ID mismatch'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🔗 Processing referral for user ${user_id} with username ${referrer_username}`);

    // Call the database function to create referral relationship
    const { data, error } = await supabase.rpc('create_referral_by_username', {
      referrer_username,
      referred_user_id: user_id
    });

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database error: ' + error.message
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const result = data as ReferralResponse;

    if (!result.success) {
      console.log('❌ Referral creation failed:', result.error);
      return new Response(
        JSON.stringify(result),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Referral relationship created successfully:', result.message);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error: ' + (error as Error).message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
