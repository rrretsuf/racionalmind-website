import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // Check if environment variables are set
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error('Server configuration error: Supabase credentials missing.');
    return new Response(JSON.stringify({ message: 'Server configuration error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize Supabase client
  let supabase;
  try {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return new Response(JSON.stringify({ message: 'Server setup error with Supabase client.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let email;
    try {
      // Get data from request body
      const body = await request.json();
      email = body.email;
    } catch (e) {
      return new Response(JSON.stringify({ message: 'Invalid JSON payload.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic server-side validation
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) { // Improved regex
      return new Response(JSON.stringify({ message: 'Invalid email address provided.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('waitlist_entries') // Ensure 'waitlist_entries' is the correct table name!
      .insert([{ email: email.trim() }]);

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') { // PostgreSQL unique violation code
        console.warn(`Duplicate email attempt: ${email}`);
        // Return a success-like response or specific duplicate message
        // Depending on desired UX, you might want 200 OK + message or 409 Conflict
         return new Response(JSON.stringify({ message: 'This email is already on the waitlist.' , duplicate: true }), {
           status: 200, // Or 409 if you prefer strict error codes
           headers: { 'Content-Type': 'application/json' },
         });
      }
      // Log other Supabase errors for debugging
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ message: error.message || 'Failed to add email to waitlist.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Success
    console.log(`Successfully added email: ${email}`);
    return new Response(JSON.stringify({ message: 'Success! You are on the waitlist.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    // Log unexpected errors
    console.error('Handler error:', e);
    return new Response(JSON.stringify({ message: e.message || 'An unexpected server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}