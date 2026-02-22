const path = require('path')
const apiDir = path.join(__dirname, '../api')
require(path.join(apiDir, 'node_modules/dotenv')).config({ path: path.join(apiDir, '.env') })
const { createClient } = require(path.join(apiDir, 'node_modules/@supabase/supabase-js'))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function updateMemberEmails() {
  console.log('Fetching all members...')

  const { data: members, error: fetchError } = await supabase
    .from('members')
    .select('id, full_name, email')

  if (fetchError) {
    console.error('Error fetching members:', fetchError.message)
    process.exit(1)
  }

  console.log(`Found ${members.length} members.`)

  let updated = 0
  let skipped = 0

  for (const member of members) {
    if (!member.email) {
      console.log(`  Skipping ${member.full_name} (no email)`)
      skipped++
      continue
    }

    const localPart = member.email.split('@')[0]
    const newEmail = `${localPart}@tspc.com`

    if (member.email === newEmail) {
      console.log(`  Skipping ${member.full_name} (already @tspc.com)`)
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('members')
      .update({ email: newEmail })
      .eq('id', member.id)

    if (updateError) {
      console.error(`  Error updating ${member.full_name}:`, updateError.message)
    } else {
      console.log(`  Updated ${member.full_name}: ${member.email} -> ${newEmail}`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

updateMemberEmails()
