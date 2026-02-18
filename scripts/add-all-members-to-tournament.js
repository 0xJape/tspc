require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function addAllMembersToTournament() {
  try {
    // Get all tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (tournamentsError) throw tournamentsError
    
    if (!tournaments || tournaments.length === 0) {
      console.log('No tournaments found. Please create a tournament first.')
      return
    }
    
    // Use the first tournament
    const tournament = tournaments[0]
    console.log(`\nAdding members to tournament: "${tournament.name}"`)
    console.log(`Tournament ID: ${tournament.id}\n`)
    
    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
    
    if (membersError) throw membersError
    
    if (!members || members.length === 0) {
      console.log('No members found.')
      return
    }
    
    console.log(`Found ${members.length} members\n`)
    
    // Check existing registrations
    const { data: existingRegistrations } = await supabase
      .from('tournament_participants')
      .select('member_id')
      .eq('tournament_id', tournament.id)
    
    const existingMemberIds = new Set(
      (existingRegistrations || []).map(r => r.member_id)
    )
    
    // Add each member to the tournament
    let addedCount = 0
    let skippedCount = 0
    
    for (const member of members) {
      if (existingMemberIds.has(member.id)) {
        console.log(`⏭️  Skipped: ${member.name} (already registered)`)
        skippedCount++
        continue
      }
      
      const { error: insertError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournament.id,
          member_id: member.id,
          status: 'approved' // Auto-approve all for testing
        })
      
      if (insertError) {
        console.log(`❌ Failed to add ${member.name}: ${insertError.message}`)
      } else {
        console.log(`✅ Added: ${member.name}`)
        addedCount++
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   - Added: ${addedCount}`)
    console.log(`   - Skipped: ${skippedCount}`)
    console.log(`   - Total members: ${members.length}`)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

addAllMembersToTournament()
