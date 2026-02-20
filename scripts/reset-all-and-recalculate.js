const path = require('path')
// Use api/node_modules since scripts/ has no separate node_modules
const apiDir = path.join(__dirname, '../api')
require(path.join(apiDir, 'node_modules/dotenv')).config({ path: path.join(apiDir, '.env') })
const { createClient } = require(path.join(apiDir, 'node_modules/@supabase/supabase-js'))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const TOURNAMENT_TABLES = [
  'tspc_mens_singles_results',
  'tspc_womens_singles_results',
  'tspc_mens_doubles_results',
  'tspc_womens_doubles_results',
  'tspc_mixed_doubles_results'
]

// Same ID map used in rankings.js and tournaments.js
const TOURNAMENT_TABLE_MAP = {
  'd9af477a-a257-499b-bf34-61015dcc90b6': 'tspc_mens_doubles_results',
  'bad83357-7ca8-4527-9cfb-885ff0f9abc0': 'tspc_womens_doubles_results',
  'd4fc8133-1c30-4133-b6ed-ba4545e1f08e': 'tspc_mens_singles_results',
  'debf25dc-b1bb-4ecf-a194-9f1ddf063bb0': 'tspc_womens_singles_results',
  'aa176926-38a3-4f1e-9a51-d269195a4220': 'tspc_mixed_doubles_results'
}

async function getTableForTournament(tournamentId) {
  // 1. Check hardcoded map
  if (TOURNAMENT_TABLE_MAP[tournamentId]) return TOURNAMENT_TABLE_MAP[tournamentId]

  // 2. Check tournament_tables registry
  const { data } = await supabase
    .from('tournament_tables')
    .select('table_name')
    .eq('tournament_id', tournamentId)
    .maybeSingle()
  if (data?.table_name) return data.table_name

  // 3. Fallback to name/category
  const { data: t } = await supabase
    .from('tournaments')
    .select('name, category')
    .eq('id', tournamentId)
    .single()
  if (!t) return null

  const name = (t.name || '').toLowerCase()
  const cat = t.category || ''
  if (cat === 'Singles' && name.includes('men') && !name.includes('women')) return 'tspc_mens_singles_results'
  if (cat === 'Singles' && name.includes('women')) return 'tspc_womens_singles_results'
  if (cat === 'Doubles' && name.includes('men') && !name.includes('women') && !name.includes('mixed')) return 'tspc_mens_doubles_results'
  if (cat === 'Doubles' && name.includes('women')) return 'tspc_womens_doubles_results'
  if (cat === 'Mixed Doubles' || name.includes('mixed')) return 'tspc_mixed_doubles_results'
  return null
}

async function main() {
  console.log('🧹 FULL RESET - Clearing all points and recalculating from match history\n')

  // ── Step 1: Clear all tournament leaderboard tables ───────────────────────
  console.log('Step 1: Clearing all tournament leaderboard tables...')
  for (const table of TOURNAMENT_TABLES) {
    const { error } = await supabase.from(table).delete().neq('member_id', '00000000-0000-0000-0000-000000000000')
    if (error) console.error(`  ❌ Failed to clear ${table}:`, error.message)
    else console.log(`  ✅ Cleared ${table}`)
  }

  // ── Step 2: Reset members table ───────────────────────────────────────────
  console.log('\nStep 2: Resetting all member stats to 0...')
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, full_name')
  if (membersError) throw membersError

  for (const member of members) {
    const { error } = await supabase
      .from('members')
      .update({ wins: 0, losses: 0, points: 0 })
      .eq('id', member.id)
    if (error) console.error(`  ❌ ${member.full_name}:`, error.message)
    else console.log(`  ✅ Reset: ${member.full_name}`)
  }

  // ── Step 3: Load all finished matches ─────────────────────────────────────
  console.log('\nStep 3: Loading all finished matches...')
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'Finished')
    .not('tournament_id', 'is', null)
  if (matchesError) throw matchesError
  console.log(`  Found ${matches.length} finished matches`)

  // ── Step 4: Recalculate from matches ──────────────────────────────────────
  console.log('\nStep 4: Recalculating points from matches...')

  // In-memory accumulators to avoid fetching DB per update
  const memberStats = {}   // memberId → { full_name, wins, losses, points }
  const leaderboard = {}   // tableName → { memberId → { full_name, wins, losses, points } }

  // Initialize members
  for (const m of members) {
    memberStats[m.id] = { full_name: m.full_name, wins: 0, losses: 0, points: 0 }
  }

  for (const match of matches) {
    let t1 = 0, t2 = 0
    if (match.set1_team1_score !== null && match.set1_team2_score !== null) {
      if (match.set1_team1_score > match.set1_team2_score) t1++
      else if (match.set1_team2_score > match.set1_team1_score) t2++
    }
    if (match.set2_team1_score !== null && match.set2_team2_score !== null) {
      if (match.set2_team1_score > match.set2_team2_score) t1++
      else if (match.set2_team2_score > match.set2_team1_score) t2++
    }
    if (match.set3_team1_score !== null && match.set3_team2_score !== null) {
      if (match.set3_team1_score > match.set3_team2_score) t1++
      else if (match.set3_team2_score > match.set3_team1_score) t2++
    }

    if (t1 === t2) continue // Skip ties

    const team1Won = t1 > t2
    const winningTeam = team1Won
      ? [match.player1_id, match.team1_partner_id].filter(Boolean)
      : [match.player2_id, match.team2_partner_id].filter(Boolean)
    const losingTeam = team1Won
      ? [match.player2_id, match.team2_partner_id].filter(Boolean)
      : [match.player1_id, match.team1_partner_id].filter(Boolean)

    const tableName = await getTableForTournament(match.tournament_id)

    if (!leaderboard[tableName]) leaderboard[tableName] = {}
    if (!tableName) {
      console.log(`  ⚠️  No table found for tournament ${match.tournament_id} — skipping leaderboard update`)
    }

    const applyPoints = (memberId, pts, isWin) => {
      if (memberStats[memberId]) {
        memberStats[memberId].wins += isWin ? 1 : 0
        memberStats[memberId].losses += isWin ? 0 : 1
        memberStats[memberId].points += pts
      }
      if (tableName) {
        if (!leaderboard[tableName][memberId]) {
          const name = memberStats[memberId]?.full_name || ''
          leaderboard[tableName][memberId] = { full_name: name, wins: 0, losses: 0, points: 0, games_played: 0 }
        }
        leaderboard[tableName][memberId].wins += isWin ? 1 : 0
        leaderboard[tableName][memberId].losses += isWin ? 0 : 1
        leaderboard[tableName][memberId].points += pts
        leaderboard[tableName][memberId].games_played += 1
      }
    }

    winningTeam.forEach(id => applyPoints(id, 6, true))
    losingTeam.forEach(id => applyPoints(id, 3, false))
  }

  // ── Step 5: Write members table ───────────────────────────────────────────
  console.log('\nStep 5: Writing updated member stats...')
  for (const [memberId, stats] of Object.entries(memberStats)) {
    const { error } = await supabase
      .from('members')
      .update({ wins: stats.wins, losses: stats.losses, points: stats.points })
      .eq('id', memberId)
    if (error) console.error(`  ❌ ${stats.full_name}:`, error.message)
    else if (stats.points > 0) console.log(`  ✅ ${stats.full_name}: ${stats.points}pts ${stats.wins}W-${stats.losses}L`)
  }

  // ── Step 6: Write tournament leaderboard tables ───────────────────────────
  console.log('\nStep 6: Writing tournament leaderboard tables...')
  for (const [tableName, players] of Object.entries(leaderboard)) {
    const rows = Object.entries(players).map(([memberId, stats], index) => ({
      member_id: memberId,
      full_name: stats.full_name,
      points: stats.points,
      wins: stats.wins,
      losses: stats.losses,
      games_played: stats.games_played,
      rank_position: index + 1
    }))

    if (rows.length === 0) continue

    const { error } = await supabase.from(tableName).insert(rows)
    if (error) console.error(`  ❌ Failed to insert into ${tableName}:`, error.message)
    else console.log(`  ✅ ${tableName}: inserted ${rows.length} player(s)`)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ DONE! All points reset and recalculated from match history.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
