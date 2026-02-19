require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// New members to add
const newMembers = [
  // Female members
  { name: 'Nice Lomboy', gender: 'Female' },
  { name: 'Jo-an Sumagaysay', gender: 'Female' },
  { name: 'Marivic Cariňo', gender: 'Female' },
  { name: 'Divine Dumalag', gender: 'Female' },
  { name: 'Gly Mariano-Trabado', gender: 'Female' },
  { name: 'PPJ Cepeda', gender: 'Female' },
  { name: 'Ammi Saldivia', gender: 'Female' },
  { name: 'Dolly Bantawig', gender: 'Female' },
  { name: 'Khyla Cariňo', gender: 'Female' },
  { name: 'Joy Serra', gender: 'Female' },
  { name: 'Ella Aguilar', gender: 'Female' },
  { name: 'Gigi Bagares', gender: 'Female' },
  { name: 'Shaine Belaza', gender: 'Female' },
  { name: 'Jing Eborde', gender: 'Female' },
  { name: 'Aya Reyes', gender: 'Female' },
  { name: 'Lucky Nicole', gender: 'Female' },
  { name: 'Jenica Leoncio', gender: 'Female' },
  
  // Male members
  { name: 'Kurt Asuncion', gender: 'Male' },
  { name: 'Tibot Balleza', gender: 'Male' },
  { name: 'James Villareal', gender: 'Male' },
  { name: 'Billy Sumande', gender: 'Male' },
  { name: 'Daniel Avergonzado', gender: 'Male' },
  { name: 'Molly Gulfan', gender: 'Male' },
  { name: 'Arnold John', gender: 'Male' },
  { name: 'Rd Trabado', gender: 'Male' },
  { name: 'Sanry Hatulan', gender: 'Male' },
  { name: 'Jayson Pacres', gender: 'Male' },
  { name: 'Clint Harry Halasan', gender: 'Male' },
  { name: 'Ruel Tomayao', gender: 'Male' },
  { name: 'Christian Entredicho', gender: 'Male' },
  { name: 'Ahron Villa', gender: 'Male' },
  { name: 'Jasper Solilapsi', gender: 'Male' },
  { name: 'Percival Lasaca', gender: 'Male' },
  { name: 'Kit Sales', gender: 'Male' },
  { name: 'Spencer Magbanua', gender: 'Male' },
  { name: 'Jojo Serra', gender: 'Male' },
  { name: 'Dhyn Hurter Balanon', gender: 'Male' },
  { name: 'Leo Watin', gender: 'Male' },
  { name: 'Rynor Bonjoc', gender: 'Male' },
  { name: 'Alfred Bolasa', gender: 'Male' },
  { name: 'Jalel Gayo', gender: 'Male' },
  { name: 'Norman Sarao', gender: 'Male' },
  { name: 'Suysuy Suyom', gender: 'Male' },
  { name: 'Jamin Gayo', gender: 'Male' },
  { name: 'Rex Bazar', gender: 'Male' }
]

async function addNewMembers() {
  try {
    console.log('🔍 Checking existing members...')
    
    // Get all existing members
    const { data: existingMembers, error: fetchError } = await supabase
      .from('members')
      .select('full_name, id')
    
    if (fetchError) throw fetchError
    
    // Create a set of existing member names for quick lookup
    const existingNames = new Set(
      existingMembers.map(member => member.full_name.toLowerCase().trim())
    )
    
    console.log(`📊 Found ${existingMembers.length} existing members in database`)
    
    // Filter out members that already exist
    const membersToAdd = newMembers.filter(member => 
      !existingNames.has(member.name.toLowerCase().trim())
    )
    
    if (membersToAdd.length === 0) {
      console.log('✅ All members from the list are already in the database!')
      return
    }
    
    console.log(`\n📝 Found ${membersToAdd.length} new members to add:`)
    membersToAdd.forEach(member => {
      console.log(`   - ${member.name} (${member.gender})`)
    })
    
    // Prepare member data with default values
    const memberInserts = membersToAdd.map(member => ({
      full_name: member.name,
      email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Placeholder email
      age: 30, // Default age
      gender: member.gender,
      skill_level: 'Intermediate', // Default skill level
      profile_photo: '',
      wins: 0,
      losses: 0,
      points: 1000, // Default starting points
      ranking_position: null // Will be set by ranking system
    }))
    
    console.log('\n💾 Adding new members to database...')
    
    // Insert all new members
    const { data: insertedMembers, error: insertError } = await supabase
      .from('members')
      .insert(memberInserts)
      .select()
    
    if (insertError) throw insertError
    
    console.log(`\n✅ Successfully added ${insertedMembers.length} new members!`)
    
    // Display the newly added members
    console.log('\n📋 Newly added members:')
    insertedMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.full_name} (${member.gender}) - ID: ${member.id}`)
    })
    
    console.log('\n🎯 Note: Default values were used for:')
    console.log('   - Email: Generated placeholder emails')
    console.log('   - Age: 30 years old')
    console.log('   - Skill Level: Intermediate')
    console.log('   - Starting Points: 1000')
    console.log('   - Wins/Losses: 0')
    console.log('\n💡 You can update these details later through the member management interface.')
    
  } catch (error) {
    console.error('❌ Error adding members:', error.message)
  }
}

// Run the script
if (require.main === module) {
  addNewMembers()
}

module.exports = { addNewMembers }