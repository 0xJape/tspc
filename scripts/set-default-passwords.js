const path = require('path')
const apiDir = path.join(__dirname, '../api')
require(path.join(apiDir, 'node_modules/dotenv')).config({ path: path.join(apiDir, '.env') })
const { createClient } = require(path.join(apiDir, 'node_modules/@supabase/supabase-js'))
const bcrypt = require(path.join(apiDir, 'node_modules/bcryptjs'))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function setDefaultPasswords() {
  const DEFAULT_PASSWORD = 'password123'
  const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  console.log('Fetching non-admin members...')

  const { data: members, error: fetchError } = await supabase
    .from('members')
    .select('id, full_name, email, is_admin')
    .eq('is_admin', false)

  if (fetchError) {
    console.error('Error fetching members:', fetchError.message)
    process.exit(1)
  }

  console.log(`Found ${members.length} non-admin members.\n`)

  let updated = 0

  for (const member of members) {
    const { error } = await supabase
      .from('members')
      .update({ password_hash })
      .eq('id', member.id)

    if (error) {
      console.error(`  Error updating ${member.full_name}:`, error.message)
    } else {
      console.log(`  Set password for ${member.full_name} (${member.email})`)
      updated++
    }
  }

  console.log(`\nDone. Updated ${updated} members with password: ${DEFAULT_PASSWORD}`)
}

setDefaultPasswords()
