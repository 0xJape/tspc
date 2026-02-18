const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ MISSING SUPABASE CREDENTIALS')
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? 'SET' : 'MISSING')
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

if (supabase) {
  console.log('✅ Supabase client initialized successfully')
} else {
  console.error('⚠️ Supabase client is NULL - API calls will fail')
}

module.exports = supabase
