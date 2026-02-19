require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function populateTournamentTables() {
  try {
    console.log('🏗️  Populating tournament-specific tables...\n');

    // Check if tournament tables exist
    console.log('🔍 Checking if tournament tables exist...');
    
    const { data: mensCheck, error: mensError } = await supabase
      .from('tspc_mens_doubles_results')
      .select('count')
      .limit(1);

    const { data: womensCheck, error: womensError } = await supabase
      .from('tspc_womens_doubles_results')
      .select('count')
      .limit(1);

    if (mensError || womensError) {
      console.log('❌ Tournament tables not found. Please run the SQL schema first:');
      console.log('   1. Copy tournament-schema.sql contents');
      console.log('   2. Run in Supabase SQL Editor');
      console.log('   3. Then run this script again');
      return;
    }

    console.log('✅ Tournament tables found!\n');

    // Get tournament IDs and register them
    console.log('📋 Registering tournaments...');
    
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name');

    const mensTournament = tournaments.find(t => t.name.includes("Men's Doubles"));
    const womensTournament = tournaments.find(t => t.name.includes("Women's Doubles"));

    if (!mensTournament || !womensTournament) {
      console.log('❌ Tournaments not found. Please create tournaments first.');
      return;
    }

    console.log(`🏆 Men's Tournament ID: ${mensTournament.id}`);
    console.log(`🏆 Women's Tournament ID: ${womensTournament.id}`);

    // Register tournaments in tournament_tables
    const { error: regError } = await supabase
      .from('tournament_tables')
      .upsert([
        {
          tournament_id: mensTournament.id,
          table_name: 'tspc_mens_doubles_results',
          tournament_name: mensTournament.name,
          tournament_category: 'Doubles'
        },
        {
          tournament_id: womensTournament.id,
          table_name: 'tspc_womens_doubles_results',
          tournament_name: womensTournament.name,
          tournament_category: 'Doubles'
        }
      ]);

    if (regError) {
      console.log('⚠️ Tournament registration error (may already exist):', regError.message);
    } else {
      console.log('✅ Tournaments registered in tournament_tables');
    }

    // Check if data already exists
    const { data: existingMens } = await supabase
      .from('tspc_mens_doubles_results')
      .select('count(*)')
      .single();

    const { data: existingWomens } = await supabase
      .from('tspc_womens_doubles_results')
      .select('count(*)')
      .single();

    if (existingMens?.count > 0 || existingWomens?.count > 0) {
      console.log('\n⚠️ Tournament data already exists. Clearing old data...');
      
      await supabase.from('tspc_mens_doubles_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tspc_womens_doubles_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('✅ Old data cleared');
    }

    // Update overall member points to 0 before recalculating
    console.log('\n🔄 Resetting member points before tournament population...');
    await supabase
      .from('members')
      .update({ points: 0, wins: 0, losses: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Member points reset');

    // The data population will be handled by the SQL script
    // Since we can't use the complex SQL INSERT statements with subqueries via the API,
    // we need to direct the user to run the SQL manually

    console.log('\n📊 NEXT STEPS:');
    console.log('   1. Copy the data population section from tournament-schema.sql');
    console.log('   2. Run sections 5-8 in the Supabase SQL Editor:');
    console.log('      - Section 5: Men\'s Doubles Results Data');
    console.log('      - Section 6: Women\'s Doubles Results Data');  
    console.log('      - Section 7: Update Overall Member Rankings');
    console.log('      - Section 8: Verification Queries (optional)');
    console.log('\n💡 This will populate both tournament tables with ranking data');
    console.log('   and update overall member scores by aggregating all tournaments.');

    console.log('\n🎯 After running the SQL:');
    console.log('   - Tournament leaderboards will show tournament-specific rankings');
    console.log('   - Overall rankings will aggregate from all tournament tables');
    console.log('   - Each tournament maintains its own separate leaderboard data');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

populateTournamentTables();