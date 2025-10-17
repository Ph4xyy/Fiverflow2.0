import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface CreateReferralRequest {
  referrer_username: string;
  referred_email: string;
  referred_name?: string;
  source?: string; // 'landing_page', 'social_media', etc.
}

interface CreateReferralResponse {
  success: boolean;
  error?: string;
  referral_id?: string;
  referrer_id?: string;
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

    // Parse the request body
    const { referrer_username, referred_email, referred_name, source }: CreateReferralRequest = await req.json();

    // Validate input
    if (!referrer_username || !referred_email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing referrer_username or referred_email'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🔗 Creating referral from landing page: ${referrer_username} -> ${referred_email}`);

    // Get referrer by username
    const { data: referrerData, error: referrerError } = await supabase
      .from('users')
      .select('id, username, name')
      .eq('username', referrer_username)
      .single();

    if (referrerError || !referrerData) {
      console.error('❌ Referrer not found:', referrerError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Referrer not found'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const referrerId = referrerData.id;

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', referred_email)
      .single();

    let referredUserId: string;

    if (existingUser) {
      // User already exists, check if they already have a referrer
      referredUserId = existingUser.id;
      
      const { data: existingReferral, error: referralError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', referredUserId)
        .single();

      if (existingReferral) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'User already has a referrer'
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // User doesn't exist yet, create a pending referral
      // We'll create the referral when they actually sign up
      const { data: pendingReferral, error: pendingError } = await supabase
        .from('pending_referrals')
        .insert({
          referrer_id: referrerId,
          referred_email: referred_email,
          referred_name: referred_name,
          source: source || 'landing_page',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (pendingError) {
        console.error('❌ Error creating pending referral:', pendingError);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to create pending referral'
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          referral_id: pendingReferral.id,
          referrer_id: referrerId,
          message: 'Pending referral created. Will be activated when user signs up.'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create the referral relationship
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredUserId,
        subscription_status: 'trial',
        source: source || 'landing_page'
      })
      .select('id')
      .single();

    if (referralError) {
      console.error('❌ Error creating referral:', referralError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create referral relationship'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Referral created successfully:', referralData.id);

    return new Response(
      JSON.stringify({
        success: true,
        referral_id: referralData.id,
        referrer_id: referrerId,
        message: 'Referral relationship created successfully'
      }),
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
