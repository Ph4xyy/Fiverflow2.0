#!/usr/bin/env node

/**
 * Test Script for Username & Referral System
 * 
 * This script tests:
 * 1. Username validation and availability
 * 2. Referral creation by username
 * 3. User profile retrieval
 * 4. Database constraints
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

// Test data
const testUsers = [
  {
    email: 'testuser1@example.com',
    username: 'testuser1',
    name: 'Test User 1',
    country: 'France',
    services: 'Web Development'
  },
  {
    email: 'testuser2@example.com',
    username: 'testuser2',
    name: 'Test User 2',
    country: 'United States',
    services: 'Graphic Design'
  }
];

async function testUsernameValidation() {
  console.log('\n🧪 Testing Username Validation...');
  
  try {
    // Test valid username
    const { data: validResult, error: validError } = await supabase.rpc('is_username_available', {
      username_to_check: 'validusername123'
    });
    
    if (validError) {
      console.error('❌ Error testing valid username:', validError);
      return false;
    }
    
    console.log('✅ Valid username test passed:', validResult);
    
    // Test invalid username (too short)
    const { data: shortResult, error: shortError } = await supabase.rpc('is_username_available', {
      username_to_check: 'ab'
    });
    
    if (shortError) {
      console.error('❌ Error testing short username:', shortError);
      return false;
    }
    
    console.log('✅ Short username test passed:', shortResult);
    
    // Test reserved username
    const { data: reservedResult, error: reservedError } = await supabase.rpc('is_username_available', {
      username_to_check: 'admin'
    });
    
    if (reservedError) {
      console.error('❌ Error testing reserved username:', reservedError);
      return false;
    }
    
    console.log('✅ Reserved username test passed:', reservedResult);
    
    return true;
  } catch (error) {
    console.error('💥 Unexpected error in username validation test:', error);
    return false;
  }
}

async function testUserProfileRetrieval() {
  console.log('\n🧪 Testing User Profile Retrieval...');
  
  try {
    // First, create a test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUsers[0].email,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Error creating test user:', authError);
      return false;
    }
    
    const userId = authData.user.id;
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: testUsers[0].email,
        username: testUsers[0].username,
        name: testUsers[0].name,
        country: testUsers[0].country,
        services: testUsers[0].services,
        onboarding_completed: true
      });
    
    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      return false;
    }
    
    // Test retrieval by username
    const { data: userData, error: userError } = await supabase.rpc('get_user_by_username', {
      username_to_find: testUsers[0].username
    });
    
    if (userError) {
      console.error('❌ Error retrieving user by username:', userError);
      return false;
    }
    
    if (!userData || userData.length === 0) {
      console.error('❌ No user data returned');
      return false;
    }
    
    console.log('✅ User profile retrieval test passed:', userData[0]);
    
    // Cleanup
    await supabase.auth.admin.deleteUser(userId);
    
    return true;
  } catch (error) {
    console.error('💥 Unexpected error in user profile retrieval test:', error);
    return false;
  }
}

async function testReferralCreation() {
  console.log('\n🧪 Testing Referral Creation by Username...');
  
  try {
    // Create referrer user
    const { data: referrerAuth, error: referrerAuthError } = await supabase.auth.admin.createUser({
      email: testUsers[0].email,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (referrerAuthError) {
      console.error('❌ Error creating referrer user:', referrerAuthError);
      return false;
    }
    
    const referrerId = referrerAuth.user.id;
    
    // Create referrer profile
    const { error: referrerProfileError } = await supabase
      .from('users')
      .insert({
        id: referrerId,
        email: testUsers[0].email,
        username: testUsers[0].username,
        name: testUsers[0].name,
        country: testUsers[0].country,
        services: testUsers[0].services,
        onboarding_completed: true
      });
    
    if (referrerProfileError) {
      console.error('❌ Error creating referrer profile:', referrerProfileError);
      return false;
    }
    
    // Create referred user
    const { data: referredAuth, error: referredAuthError } = await supabase.auth.admin.createUser({
      email: testUsers[1].email,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (referredAuthError) {
      console.error('❌ Error creating referred user:', referredAuthError);
      return false;
    }
    
    const referredId = referredAuth.user.id;
    
    // Create referred user profile
    const { error: referredProfileError } = await supabase
      .from('users')
      .insert({
        id: referredId,
        email: testUsers[1].email,
        username: testUsers[1].username,
        name: testUsers[1].name,
        country: testUsers[1].country,
        services: testUsers[1].services,
        onboarding_completed: true
      });
    
    if (referredProfileError) {
      console.error('❌ Error creating referred user profile:', referredProfileError);
      return false;
    }
    
    // Test referral creation
    const { data: referralData, error: referralError } = await supabase.rpc('create_referral_by_username', {
      referrer_username: testUsers[0].username,
      referred_user_id: referredId
    });
    
    if (referralError) {
      console.error('❌ Error creating referral:', referralError);
      return false;
    }
    
    if (!referralData.success) {
      console.error('❌ Referral creation failed:', referralData.error);
      return false;
    }
    
    console.log('✅ Referral creation test passed:', referralData);
    
    // Verify referral was created
    const { data: referralCheck, error: referralCheckError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', referrerId)
      .eq('referred_id', referredId);
    
    if (referralCheckError) {
      console.error('❌ Error checking referral:', referralCheckError);
      return false;
    }
    
    if (!referralCheck || referralCheck.length === 0) {
      console.error('❌ Referral not found in database');
      return false;
    }
    
    console.log('✅ Referral verification test passed:', referralCheck[0]);
    
    // Cleanup
    await supabase.auth.admin.deleteUser(referrerId);
    await supabase.auth.admin.deleteUser(referredId);
    
    return true;
  } catch (error) {
    console.error('💥 Unexpected error in referral creation test:', error);
    return false;
  }
}

async function testDatabaseConstraints() {
  console.log('\n🧪 Testing Database Constraints...');
  
  try {
    // Test username uniqueness constraint
    const { data: authData1, error: authError1 } = await supabase.auth.admin.createUser({
      email: 'test1@example.com',
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError1) {
      console.error('❌ Error creating first test user:', authError1);
      return false;
    }
    
    const userId1 = authData1.user.id;
    
    // Create first user with username
    const { error: profileError1 } = await supabase
      .from('users')
      .insert({
        id: userId1,
        email: 'test1@example.com',
        username: 'uniquetest',
        name: 'Test User 1',
        onboarding_completed: true
      });
    
    if (profileError1) {
      console.error('❌ Error creating first user profile:', profileError1);
      return false;
    }
    
    // Try to create second user with same username
    const { data: authData2, error: authError2 } = await supabase.auth.admin.createUser({
      email: 'test2@example.com',
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError2) {
      console.error('❌ Error creating second test user:', authError2);
      return false;
    }
    
    const userId2 = authData2.user.id;
    
    const { error: profileError2 } = await supabase
      .from('users')
      .insert({
        id: userId2,
        email: 'test2@example.com',
        username: 'uniquetest', // Same username
        name: 'Test User 2',
        onboarding_completed: true
      });
    
    if (!profileError2) {
      console.error('❌ Username uniqueness constraint not working');
      return false;
    }
    
    console.log('✅ Username uniqueness constraint test passed');
    
    // Cleanup
    await supabase.auth.admin.deleteUser(userId1);
    await supabase.auth.admin.deleteUser(userId2);
    
    return true;
  } catch (error) {
    console.error('💥 Unexpected error in database constraints test:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Username & Referral System Tests...\n');
  
  const tests = [
    { name: 'Username Validation', fn: testUsernameValidation },
    { name: 'User Profile Retrieval', fn: testUserProfileRetrieval },
    { name: 'Referral Creation', fn: testReferralCreation },
    { name: 'Database Constraints', fn: testDatabaseConstraints }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`💥 ${test.name} - ERROR:`, error);
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The username & referral system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  return failed === 0;
}

// Run tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
