// scripts/create-admin.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
// For server-side operations that require elevated privileges, you should use the SERVICE_ROLE_KEY.
// IMPORTANT: Never expose the service role key on the client-side. This script is for server-side use only.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; 

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Supabase URL, Anon Key, and Service Key are required.');
  console.error('Please ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY are set in your .env file.');
  process.exit(1);
}

// It's important to use the SERVICE_ROLE_KEY for admin operations 
// as it bypasses Row Level Security (RLS).
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ---===[ EDIT THIS USER ]===---
const adminUser = {
  email: 'james2525337017@gmail.com',
  password: 'secure-password-12345',
  // You can add more profile details here if needed
  username: 'Admin123',
  title: 'Site Administrator',

};
// -----------------------------


async function createAdmin() {
  console.log(`Checking for existing user: ${adminUser.email}`);

  // 1. Check if user exists and delete them to ensure a clean slate.
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const existingUser = users.find(u => u.email === adminUser.email);

  if (existingUser) {
    console.log(`Found existing user with ID: ${existingUser.id}. Deleting...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
    if (deleteError) {
      console.error('Error deleting existing user:', deleteError.message);
      return;
    }
    console.log('Existing user deleted successfully.');
  } else {
    console.log('No existing user found with that email. Proceeding to create.');
  }

  // 2. Create the new user in auth.users
  console.log(`Attempting to create admin user: ${adminUser.email}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminUser.email,
    password: adminUser.password,
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    return;
  }
  
  if (!authData.user) {
    console.error("User was not created. Aborting.");
    return;
  }

  const userId = authData.user.id;
  console.log(`User created successfully. User ID: ${userId}`);

  // 3. Upsert the profile to make them an admin.
  console.log('Attempting to upsert profile with admin role...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({ 
      id: userId,
      role: 1, // 1 for admin
      status: 1, // 1 for active
      username: adminUser.username,
      title: adminUser.title,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (profileError) {
    console.error('Error upserting profile:', profileError.message);
    return;
  }

  console.log('✅ Admin user created and configured successfully!');
  console.log('Profile details:', profileData);
}

createAdmin();
