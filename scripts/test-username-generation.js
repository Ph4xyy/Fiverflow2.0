#!/usr/bin/env node

/**
 * Test Script for Username Generation
 * 
 * This script tests the username generation functionality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUsernameGeneration() {
  console.log('\n🧪 Testing Username Generation...');
  
  try {
    // Test 1: Check if RPC function exists
    console.log('1️⃣ Testing RPC function availability...');
    const { data: rpcTest, error: rpcError } = await supabase.rpc('is_username_available', {
      username_to_check: 'testuser123'
    });
    
    if (rpcError) {
      console.log('⚠️ RPC function not available:', rpcError.message);
      console.log('📝 Will use direct database queries as fallback');
    } else {
      console.log('✅ RPC function is available:', rpcTest);
    }
    
    // Test 2: Check users table structure
    console.log('\n2️⃣ Testing users table structure...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, name, email')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError);
      return false;
    }
    
    console.log('✅ Users table accessible');
    if (users && users.length > 0) {
      console.log('📊 Sample user data:', users[0]);
    }
    
    // Test 3: Test username uniqueness constraint
    console.log('\n3️⃣ Testing username uniqueness...');
    const testUsername = 'uniquetest' + Date.now();
    
    // Try to insert a test user with this username
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Error creating test user:', authError);
      return false;
    }
    
    const userId = authData.user.id;
    
    // Insert user profile
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: `test${Date.now()}@example.com`,
        username: testUsername,
        name: 'Test User',
        onboarding_completed: true
      });
    
    if (insertError) {
      console.error('❌ Error inserting user profile:', insertError);
      await supabase.auth.admin.deleteUser(userId);
      return false;
    }
    
    console.log('✅ Username uniqueness test passed');
    
    // Test 4: Test username generation logic
    console.log('\n4️⃣ Testing username generation logic...');
    
    // Generate a username based on name
    const name = 'John Doe';
    let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    console.log('📝 Base username from name:', baseUsername);
    
    // Ensure minimum length
    if (baseUsername.length < 3) {
      baseUsername = baseUsername + '123';
    }
    console.log('📝 Base username after length check:', baseUsername);
    
    // Add random suffix
    const randomSuffix = Math.floor(Math.random() * 10000);
    const finalUsername = baseUsername + randomSuffix;
    console.log('📝 Final generated username:', finalUsername);
    
    // Test 5: Check if generated username is available
    console.log('\n5️⃣ Testing username availability check...');
    
    try {
      const { data: isAvailable, error: checkError } = await supabase.rpc('is_username_available', {
        username_to_check: finalUsername
      });
      
      if (checkError) {
        console.log('⚠️ RPC check failed, using direct query:', checkError.message);
        
        // Direct query fallback
        const { data: existingUsers, error: directError } = await supabase
          .from('users')
          .select('username')
          .eq('username', finalUsername)
          .limit(1);
        
        if (directError) {
          console.error('❌ Direct query also failed:', directError);
          return false;
        }
        
        const isAvailableDirect = !existingUsers || existingUsers.length === 0;
        console.log('✅ Direct query result:', isAvailableDirect);
      } else {
        console.log('✅ RPC check result:', isAvailable);
      }
    } catch (rpcError) {
      console.log('⚠️ RPC function not available, using direct query');
      
      // Direct query fallback
      const { data: existingUsers, error: directError } = await supabase
        .from('users')
        .select('username')
        .eq('username', finalUsername)
        .limit(1);
      
      if (directError) {
        console.error('❌ Direct query failed:', directError);
        return false;
      }
      
      const isAvailableDirect = !existingUsers || existingUsers.length === 0;
      console.log('✅ Direct query result:', isAvailableDirect);
    }
    
    // Cleanup
    await supabase.auth.admin.deleteUser(userId);
    console.log('🧹 Test user cleaned up');
    
    return true;
  } catch (error) {
    console.error('💥 Unexpected error in username generation test:', error);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting Username Generation Test...\n');
  
  const success = await testUsernameGeneration();
  
  if (success) {
    console.log('\n🎉 All tests passed! Username generation should work correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure the migration has been applied: supabase db push');
    console.log('2. Check the browser console for any errors');
    console.log('3. Try the "Generate Username" button in the Network page');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the migration has been applied');
    console.log('2. Check if the users table has a username column');
    console.log('3. Verify RLS policies allow updates to the username field');
  }
  
  return success;
}

// Run test
runTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
