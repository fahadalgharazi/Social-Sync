 # Social-Sync

  Event discovery platform with personality-based recommendations and friend coordination.

  ## Features
  - Personality quiz based on Big Five traits
  - Personalized event recommendations from Ticketmaster
  - Find events your friends are attending
  - Create event squads to coordinate with friends

  ## Tech Stack
  - Frontend: React + Vite + TailwindCSS + shadcn/ui
  - Backend: Node.js + Express
  - Database: Supabase (PostgreSQL)
  - APIs: Ticketmaster Discovery API

  ## Setup Instructions

  ### 1. Prerequisites
  - Node.js 18 or higher
  - A Supabase account (free tier)
  - A Ticketmaster API key (free)

  ### 2. Database Setup

  **⚠️ Important: Complete this step first!**

  1. Create a new Supabase project at [supabase.com](https://supabase.com)
  2. Go to the SQL Editor in your Supabase dashboard
  3. Run the migration files in `supabase/migrations/` in order:
     - `001_initial_schema.sql` (required)
     - `002_rls_policies.sql` (required)
  4. Verify tables appear in the Table Editor

  📖 See `supabase/README.md` for detailed database documentation.

  ### 3. Backend Setup
  ```bash
  cd Backend
  npm install
  cp .env.example .env
  # Edit .env and add your API keys
  npm run dev
  ```

  ### 4. Frontend Setup
  ```bash
  cd Frontend
  npm install
  cp .env.example .env
  # Edit .env with your backend URL
  npm run dev
  ```

  ### 5. Environment Variables

  See .env.example files in Backend/ and Frontend/ folders for required variables.

## Testing

Social-Sync includes comprehensive automated tests for both backend and frontend.

### Running Backend Tests

```bash
cd Backend
npm test                  # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage report
```

### Running Frontend Tests

```bash
cd Frontend
npm test                  # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage report
npm run test:ui           # Run with interactive UI
```

📖 For detailed testing documentation, see [TESTING.md](./TESTING.md)
