// functions/api/submit-waitlist.js
import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  // context vsebuje:
  // - request: Objekt Request (standardni Fetch API)
  // - env: Objekt z okoljskimi spremenljivkami (SUPABASE_URL, SUPABASE_ANON_KEY)
  // - next: Funkcija za klic naslednjega middleware-a
  // - params: Parametri iz poti URL-ja
  // - waitUntil: Za podaljšanje življenjske dobe funkcije

  const { request, env } = context;

  // Preverite, ali so okoljske spremenljivke nastavljene
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error('Server configuration error: Supabase credentials missing.');
    return new Response(JSON.stringify({ message: 'Server configuration error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Inicializacija Supabase klienta
  // Preverite, ali je ta način inicializacije skladen z vašo verzijo @supabase/supabase-js in Cloudflare okoljem.
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
      // Pridobivanje podatkov iz telesa zahteve (request body)
      const body = await request.json();
      email = body.email;
    } catch (e) {
      return new Response(JSON.stringify({ message: 'Invalid JSON payload.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Osnovna validacija na strežniški strani
    if (!email || typeof email !== 'string' || !/^[\s\S]*@[\s\S]*\.[\s\S]*$/.test(email)) {
      return new Response(JSON.stringify({ message: 'Invalid email address provided.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Vnos v Supabase
    const { data, error } = await supabase
      .from('waitlist_entries') // PREVERITE, da je ime tabele 'waitlist_entries' pravilno!
      .insert([{ email: email.trim() }]);

    if (error) {
      // Obravnava napake zaradi podvojenega emaila
      if (error.code === '23505') { // PostgreSQL koda za kršitev unikatnosti
        console.warn(`Duplicate email attempt: ${email}`);
        return new Response(JSON.stringify({ message: 'This email is already on the waitlist.' }), {
          status: 409, // Conflict
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Logiranje ostalih Supabase napak za razhroščevanje
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ message: error.message || 'Failed to add email to waitlist.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Uspeh
    console.log(`Successfully added email: ${email}`);
    return new Response(JSON.stringify({ message: 'Success! You are on the waitlist.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    // Logiranje nepredvidenih napak
    console.error('Handler error:', e);
    return new Response(JSON.stringify({ message: e.message || 'An unexpected server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Če želite obravnavati tudi druge metode ali vse metode z eno funkcijo:
// export async function onRequest(context) {
//   if (context.request.method === 'POST') {
//     return onRequestPost(context);
//   }
//   // Obravnava drugih metod ali vrnitev 405
//   return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
//     status: 405,
//     headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
//   });
// }
