const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ MISSING SUPABASE CREDENTIALS')
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? 'SET' : 'MISSING')
  throw new Error('Supabase credentials not configured. Add SUPABASE_URL and SUPABASE_SERVICE_KEY to Vercel environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Supabase client initialized successfully')

module.exports = supabase
