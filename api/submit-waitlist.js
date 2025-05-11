// api/submit-waitlist.js
const { createClient } = require('@supabase/supabase-js');

// Load Supabase credentials securely from environment variables
// These MUST be set in your Vercel project settings for deployment
// For local testing, they are read from the .env file (if you use `vercel dev`)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Export the handler function for Vercel
module.exports = async (req, res) => {

  // Ensure environment variables are set (important check for deployed function)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Server configuration error: Supabase credentials missing.');
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  // Initialize Supabase client server-side for this request
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    // Basic validation server-side
    if (!email || typeof email !== 'string' || !/^[\s\S]*@[\s\S]*\.[\s\S]*$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address provided.' });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('waitlist_entries') // MAKE SURE this table name is correct!
      .insert([{ email: email.trim() }]);

    if (error) {
      // Handle potential duplicate email error specifically
      if (error.code === '23505') { // PostgreSQL unique violation code
        console.warn(`Duplicate email attempt: ${email}`);
        return res.status(409).json({ message: 'This email is already on the waitlist.' }); // 409 Conflict
      }
      // Log other Supabase errors for debugging
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Failed to add email to waitlist.');
    }

    // Success
    console.log(`Successfully added email: ${email}`);
    return res.status(200).json({ message: 'Success! You are on the waitlist.' });

  } catch (error) {
    // Log any other unexpected errors
    console.error('Handler error:', error);
    return res.status(500).json({ message: error.message || 'An unexpected server error occurred.' });
  }
}; 
