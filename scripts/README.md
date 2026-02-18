# Utility Scripts

Collection of utility scripts for database management and setup.

## Prerequisites

Create a `.env` file in this directory with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

Or run from root directory where `.env` already exists.

## Scripts

### generate-admin-hash.js
Generates bcrypt password hashes and SQL commands for creating admin users.

```bash
node scripts/generate-admin-hash.js
```

Outputs:
- Admin credentials (admin@pickleclub.com / admin123)
- SQL commands to insert admin user into Supabase

### add-all-members-to-tournament.js
Bulk adds all members as approved participants to a tournament.

```bash
node scripts/add-all-members-to-tournament.js
```

Interactive: Prompts you to select a tournament from the list.

### reset-and-recalculate-rankings.js
Resets all member statistics and recalculates from match history.

```bash
node scripts/reset-and-recalculate-rankings.js
```

⚠️ Warning: This will reset wins, losses, and points for all members then recalculate from matches.

## Installation

If running scripts standalone, install dependencies:
```bash
npm install dotenv @supabase/supabase-js bcryptjs
```
