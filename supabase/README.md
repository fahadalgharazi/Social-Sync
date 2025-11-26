# Social-Sync Database Schema

This directory contains all database migrations and schema documentation for the Social-Sync application.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Migration Files](#migration-files)
- [Database Structure](#database-structure)
- [Security (RLS)](#security-rls)
- [Local Development](#local-development)
- [Production Setup](#production-setup)

## 🚀 Quick Start

### Prerequisites
- A Supabase project (free tier works fine)
- Supabase CLI (optional but recommended)

### Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Note your project URL and keys

2. **Run Migrations in Order**

   Open the Supabase SQL Editor and run these files in order:

   ```
   001_initial_schema.sql       ← Core tables (REQUIRED)
   002_rls_policies.sql        ← Security policies (REQUIRED)
   003_social_features_schema.sql  ← Friends/Groups (Phase 2)
   004_social_features_rls.sql     ← Social RLS (Phase 2)
   ```

3. **Verify Setup**
   - Check that all tables appear in the Table Editor
   - Verify RLS is enabled on each table
   - Test creating a user via the auth signup endpoint

## 📁 Migration Files

### 001_initial_schema.sql (REQUIRED)
**Status**: ✅ Production Ready
**Purpose**: Creates core application tables

Tables created:
- `users` - Core authentication table
- `user_data` - Extended user profiles
- `user_personality_data` - Big Five personality test results

Features:
- UUID primary keys
- Foreign key constraints
- Automatic timestamp triggers
- Proper indexes for performance

### 002_rls_policies.sql (REQUIRED)
**Status**: ✅ Production Ready
**Purpose**: Implements Row Level Security

Policies:
- Users can only view/edit their own data
- Public profiles are viewable by all (for friends feature)
- Service role has full access for backend operations

### 003_social_features_schema.sql (OPTIONAL - Phase 2)
**Status**: 🚧 Ready for Phase 2
**Purpose**: Adds social features (friends, groups, events)

Tables created:
- `friendships` - Friend relationships
- `user_events` - Events users are attending
- `groups` - User-created groups
- `group_members` - Group membership
- `group_events` - Group event coordination

Helper Functions:
- `are_friends(user1_id, user2_id)` - Check friendship status
- `get_mutual_friends(user1_id, user2_id)` - Find common friends

### 004_social_features_rls.sql (OPTIONAL - Phase 2)
**Status**: 🚧 Ready for Phase 2
**Purpose**: Security policies for social features

Policies:
- Friend requests and acceptance
- Event privacy (friends can see each other's events)
- Group visibility (public vs private)
- Group admin permissions

## 🗄️ Database Structure

### Core Tables (Phase 1)

#### users
Primary authentication table linked to Supabase Auth.

```sql
id          UUID      -- References auth.users
email       VARCHAR   -- Unique email address
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### user_data
Extended user profile information.

```sql
id              UUID      -- References users.id
first_name      VARCHAR(50)
last_name       VARCHAR(50)
username        VARCHAR(20)  -- UNIQUE
gender          VARCHAR(20)  -- Optional
bio             TEXT         -- Optional
interests       TEXT         -- Optional

-- Location
city            VARCHAR(255)
state           VARCHAR(2)
zipcode         VARCHAR(10)
latitude        DECIMAL(10,8)
longitude       DECIMAL(11,8)
geohash         VARCHAR(12)  -- For location-based queries

created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Indexes:**
- `username` - Fast username lookups
- `geohash` - Efficient location queries
- `zipcode` - ZIP-based searches

#### user_personality_data
Stores Big Five personality assessment results.

```sql
id          UUID      -- References users.id

-- Raw Scores (1-5 scale)
extraversion           DECIMAL(3,2)
emotional_stability    DECIMAL(3,2)
agreeableness          DECIMAL(3,2)
conscientiousness      DECIMAL(3,2)
openness               DECIMAL(3,2)

-- Normalized Z-Scores
z_score_extraversion      DECIMAL(6,3)
z_score_neuroticism       DECIMAL(6,3)
z_score_agreeableness     DECIMAL(6,3)
z_score_conscientiousness DECIMAL(6,3)
z_score_openness          DECIMAL(6,3)

-- Computed Type
personality_type   VARCHAR(50)  -- 'Reactive Idealist', etc.
cluster_distance   DECIMAL(10,6)

open_ended        TEXT
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

**Valid Personality Types:**
- Reactive Idealist
- Balanced Realist
- Sensitive Companion
- Secure Optimist

### Social Tables (Phase 2)

#### friendships
Friend relationships with status tracking.

```sql
id             UUID
user_id        UUID      -- User who sent request
friend_id      UUID      -- User who received request
status         VARCHAR   -- 'pending', 'accepted', 'blocked'
requested_at   TIMESTAMP
accepted_at    TIMESTAMP
```

**Constraints:**
- No self-friending
- Unique friendships
- Valid status values

#### user_events
Events users are interested in or attending.

```sql
id          UUID
user_id     UUID
event_id    VARCHAR(255)  -- Ticketmaster ID
event_name  VARCHAR(500)
event_date  TIMESTAMP
venue_name  VARCHAR(500)
venue_city  VARCHAR(255)
status      VARCHAR       -- 'interested', 'going', 'went'
added_at    TIMESTAMP
```

#### groups
User-created groups for event coordination.

```sql
id          UUID
name        VARCHAR(100)
description TEXT
created_by  UUID
is_private  BOOLEAN
image_url   TEXT
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### group_members
Group membership with roles.

```sql
id        UUID
group_id  UUID
user_id   UUID
role      VARCHAR  -- 'admin', 'member'
joined_at TIMESTAMP
```

#### group_events
Events groups plan to attend together.

```sql
id          UUID
group_id    UUID
event_id    VARCHAR(255)
event_name  VARCHAR(500)
event_date  TIMESTAMP
venue_name  VARCHAR(500)
added_by    UUID
added_at    TIMESTAMP
```

## 🔒 Security (RLS)

All tables have Row Level Security enabled.

### Core Principles

1. **User Data**: Users can only modify their own data
2. **Public Profiles**: Basic profile info is publicly viewable
3. **Friends Only**: Event attendance is visible to friends
4. **Group Permissions**: Admins can manage groups, members can view

### Important Notes

- **Service Role**: The backend uses the service role key to bypass RLS
- **Anon Key**: Frontend uses anon key with RLS enforced
- **Production**: Consider adding more restrictive policies

## 🛠️ Local Development

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local Supabase
supabase init

# Start local Supabase
supabase start

# Run migrations
supabase db reset
```

### Option 2: Manual Setup

1. Create a Supabase project
2. Copy migration files to SQL Editor
3. Run in order (001 → 002 → 003 → 004)
4. Update your `.env` files with credentials

## 🚀 Production Setup

### Supabase Dashboard

1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Paste contents of `001_initial_schema.sql`
4. Click "Run"
5. Repeat for `002_rls_policies.sql`

### Verify Setup

Run this query to check tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
- users
- user_data
- user_personality_data

### Enable RLS Verification

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────┐
│ auth.users  │ (Supabase managed)
└──────┬──────┘
       │
       │ 1:1
       ├─────────► ┌─────────────────────┐
       │           │ users               │
       │           ├─────────────────────┤
       │           │ id (PK)             │
       │           │ email               │
       │           └─────────────────────┘
       │
       │ 1:1
       ├─────────► ┌─────────────────────┐
       │           │ user_data           │
       │           ├─────────────────────┤
       │           │ id (PK, FK)         │
       │           │ username (UNIQUE)   │
       │           │ first_name          │
       │           │ bio, interests      │
       │           │ geohash             │
       │           └─────────────────────┘
       │
       │ 1:1
       └─────────► ┌─────────────────────┐
                   │ user_personality_data│
                   ├─────────────────────┤
                   │ id (PK, FK)         │
                   │ personality_type    │
                   │ z_scores...         │
                   └─────────────────────┘
```

## 🔧 Common Queries

### Get user with profile

```sql
SELECT u.email, ud.username, ud.first_name, ud.last_name, up.personality_type
FROM users u
JOIN user_data ud ON u.id = ud.id
LEFT JOIN user_personality_data up ON u.id = up.id
WHERE u.email = 'user@example.com';
```

### Find users by personality type

```sql
SELECT ud.username, ud.first_name, up.personality_type
FROM user_data ud
JOIN user_personality_data up ON ud.id = up.id
WHERE up.personality_type = 'Reactive Idealist';
```

### Get users near a location (within geohash prefix)

```sql
SELECT username, city, state, geohash
FROM user_data
WHERE geohash LIKE '9q5%'  -- San Francisco area
LIMIT 10;
```

## 📝 Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | Phase 1 | Initial schema (users, profiles, personality) |
| 002 | Phase 1 | RLS policies for core tables |
| 003 | Phase 2 | Social features (friends, groups, events) |
| 004 | Phase 2 | RLS policies for social features |

## 🆘 Troubleshooting

### "relation does not exist"
- You haven't run the migration yet
- Run migrations in order (001 → 002 → ...)

### "permission denied for table"
- RLS is blocking access
- Make sure you're using the correct API key
- Backend should use service role key
- Frontend should use anon key

### "duplicate key value violates unique constraint"
- You're trying to insert duplicate data
- Check username uniqueness
- Check email uniqueness

### "insert or update on table violates foreign key constraint"
- Referenced user doesn't exist
- Ensure user exists in `users` table first
- Check cascade delete settings

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Questions?** Check the main README or open an issue on GitHub.
