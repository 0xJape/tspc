require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function resetAndRecalculateRankings() {
  console.log('🔄 Starting rankings reset and recalculation...')

  try {
    // Step 1: Reset all member stats to 0
    console.log('\n📊 Step 1: Resetting all member stats to 0...')
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, full_name')

    if (membersError) throw membersError

    for (const member of members) {
      const { error: updateError } = await supabase
        .from('members')
        .update({
          wins: 0,
          losses: 0,
          points: 0
        })
        .eq('id', member.id)

      if (updateError) {
        console.error(`❌ Error resetting stats for ${member.full_name}:`, updateError)
      } else {
        console.log(`✅ Reset: ${member.full_name}`)
      }
    }

    // Step 2: Get all tournament matches
    console.log('\n📊 Step 2: Fetching all tournament matches...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .not('tournament_id', 'is', null)
      .eq('status', 'Finished')

    if (matchesError) throw matchesError

    console.log(`Found ${matches.length} finished tournament matches`)

    // Step 3: Recalculate stats from tournament matches
    console.log('\n📊 Step 3: Recalculating stats from tournament matches...')
    
    for (const match of matches) {
      // Calculate winner based on sets
      let team1SetsWon = 0
      let team2SetsWon = 0
      
      // Set 1
      if (match.set1_team1_score !== null && match.set1_team2_score !== null) {
        if (match.set1_team1_score > match.set1_team2_score) team1SetsWon++
        else if (match.set1_team2_score > match.set1_team1_score) team2SetsWon++
      }
      
      // Set 2
      if (match.set2_team1_score !== null && match.set2_team2_score !== null) {
        if (match.set2_team1_score > match.set2_team2_score) team1SetsWon++
        else if (match.set2_team2_score > match.set2_team1_score) team2SetsWon++
      }
      
      // Set 3
      if (match.set3_team1_score !== null && match.set3_team2_score !== null) {
        if (match.set3_team1_score > match.set3_team2_score) team1SetsWon++
        else if (match.set3_team2_score > match.set3_team1_score) team2SetsWon++
      }

      const team1Won = team1SetsWon > team2SetsWon
      
      // Determine teams
      const winningTeam = team1Won 
        ? [match.player1_id, match.team1_partner_id].filter(Boolean)
        : [match.player2_id, match.team2_partner_id].filter(Boolean)
      
      const losingTeam = team1Won
        ? [match.player2_id, match.team2_partner_id].filter(Boolean)
        : [match.player1_id, match.team1_partner_id].filter(Boolean)

      // Award points to winners
      for (const memberId of winningTeam) {
        const { data: member } = await supabase
          .from('members')
          .select('wins, points, full_name')
          .eq('id', memberId)
          .single()

        if (member) {
          await supabase
            .from('members')
            .update({
              wins: member.wins + 1,
              points: member.points + 6
            })
            .eq('id', memberId)
          console.log(`  🏆 +6 points to ${member.full_name} (Win)`)
        }
      }

      // Award points to losers
      for (const memberId of losingTeam) {
        const { data: member } = await supabase
          .from('members')
          .select('losses, points, full_name')
          .eq('id', memberId)
          .single()

        if (member) {
          await supabase
            .from('members')
            .update({
              losses: member.losses + 1,
              points: member.points + 3
            })
            .eq('id', memberId)
          console.log(`  📊 +3 points to ${member.full_name} (Loss)`)
        }
      }
    }

    // Step 4: Display final results
    console.log('\n📊 Step 4: Final Rankings...')
    const { data: finalRankings, error: rankingsError } = await supabase
      .from('members')
      .select('full_name, wins, losses, points')
      .order('points', { ascending: false })

    if (rankingsError) throw rankingsError

    console.log('\n🏆 Updated Rankings:')
    finalRankings.forEach((member, index) => {
      console.log(`${index + 1}. ${member.full_name} - ${member.points} points (${member.wins}W / ${member.losses}L)`)
    })

    console.log('\n✅ Rankings reset and recalculation complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

resetAndRecalculateRankings()
