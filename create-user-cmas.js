const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://klhynsvihaulheyaohbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaHluc3ZpaGF1bGhleWFvaGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjEwNDUsImV4cCI6MjA1NTYzNzA0NX0.6rlbOgTL7zXvR8nklQAOIemN6GLFOsRLnbfgdb3UJdA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  try {
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'supervisor_personel@gmail.com')
      .single();

    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('SupervisorStaff@2024', salt);

    // Create the user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: 'supervisor_personel@gmail.com',
        password: hashedPassword,
        role: 'supervisor',
        name: 'Supervisor',
        system_role: 'cmas'
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('User created successfully:', data);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
