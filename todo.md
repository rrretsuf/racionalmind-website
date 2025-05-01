✅ HIGH-IMPACT TODO PLAN (1-hour launch target)  
(check a task when you finish it – keep moving!)

1. ☑ Supabase (10 min)  
   • create project → region close to users  
   • table `waitlist_entries` → columns: id (PK), email (unique, text, not null), created_at (now())  
   • enable RLS → INSERT-only policy for role `anon` (`WITH CHECK true`)  
   • grab PROJECT_URL + anon key

2. ☑ Local repo scaffold (3 min)  
   • `npm create vite@latest rationalmind-landing --template react-ts`  
   • `cd` + `npm i`  
   • `npm i -D tailwindcss postcss autoprefixer` → `npx tailwindcss init -p`  
   • add Tailwind directives to `src/index.css`  
   • install client: `npm i @supabase/supabase-js`

3. ☑ Env vars (1 min)  
   • `.env` →  
     ```
     VITE_SUPABASE_URL=...
     VITE_SUPABASE_ANON_KEY=...
     ```  
   • gitignore `.env`

4. ☑ Minimal code hook-up (15 min) ← ONLY IMPLEMENT THIS STEP NOW  
   • create `src/supabaseClient.ts` (createClient with env vars)  
   • in `App.tsx` add: state `email`, submit handler  
     – on submit: `supabase.from('waitlist_entries').insert([{ email }])`  
     – set `loading / success / error` UI states  
   • no fancy validation beyond HTML `type="email"` + `required`

5. ☑ Styling pass (10 min) – Tailwind utility classes only  
   • centre hero section vertically & horizontally  
   • responsive max-width 640px, generous padding, dark gradient bg  
   • input + button stacked on mobile, inline on ≥640 px  
   • subtle success/error toast

6. ☑ Local smoke test (2 min)  
   • `npm run dev` → verify insert succeeds in Supabase table

7. ☐ Git + Vercel (10 min)  
   • `git init`, commit, push to GitHub  
   • import repo in Vercel → set env vars → Deploy  
   • test `*.vercel.app`

8. ☐ Domain (Namecheap → Vercel) (5-20 min DNS)  
   • Vercel » Settings » Domains → add `rationalmind.app`  
   • copy Vercel NS → paste into Namecheap Custom DNS → save  
   • wait; when green lock appears, visit https://rationalmind.app

9. ☐ Post-launch checks (ongoing)  
   • verify HTTPS, mobile view, duplicate-email error message  
   • add simple analytics later (Plausible) 