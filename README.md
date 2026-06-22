# Threadly

A Reddit-style community discussion platform where users can create posts, join communities, vote, and have threaded conversations — all powered by a real-time Supabase backend.
<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>



<p align="center">
  <a href="https://threadlyforum.vercel.app">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Click%20Here-blue?style=for-the-badge" alt="Live Demo" />
  </a>
</p>


---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth — GitHub OAuth |
| Server State | TanStack Query (React Query) |
| Deployment | Vercel |

---

## Features

- **GitHub OAuth Authentication** — Sign in with GitHub; avatar and username are stored and displayed across the app
- **Post Creation with Image Uploads** — Create posts with a title, body, and an optional image stored in Supabase Storage
- **Voting System** — Upvote or downvote posts with per-user vote enforcement via Row Level Security policies
- **Threaded Comments** — Nested reply chains with author usernames and timestamps
- **Communities** — Posts are scoped to communities in a Reddit-style feed layout
- **Real-Time Updates** — TanStack Query keeps votes, comments, and post feeds in sync without full page reloads

---

## Database Architecture

### Key Tables

```
posts        — id, title, content, image_url, user_id, user_avatar_url, community_id, created_at
comments     — id, content, post_id, user_id, parent_comment_id, created_at
votes        — id, post_id, user_id, vote_type
communities  — id, name, description, created_at
```

### Row Level Security

RLS is enabled on all tables. Example: only the vote's owner can delete their own vote.

```sql
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delete own vote" ON votes
FOR DELETE
USING (auth.uid()::text = user_id);
```

### RPC Function

A custom Postgres function aggregates post metadata server-side to avoid N+1 client-side queries:

```sql
CREATE OR REPLACE FUNCTION get_posts_with_counts()
RETURNS TABLE (
  id            integer,
  title         text,
  content       text,
  created_at    timestamptz,
  image_url     text,
  like_count    integer,
  comment_count integer,
  user_avatar_url text
)
LANGUAGE sql AS $$
  SELECT
    p.id, p.title, p.content, p.created_at, p.image_url,
    (SELECT COUNT(*) FROM votes    v WHERE v.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
    p.user_avatar_url
  FROM posts p
  ORDER BY p.created_at DESC;
$$;
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with GitHub OAuth configured

### Installation

```bash
git clone https://github.com/akashrandhawa00/threadly.git
cd threadly
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## Deployment

Deployed on **Vercel**. To deploy your own instance:

1. Push your fork to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
4. Deploy — Vercel handles the rest on every push to `main`

---

## Project Structure

```
src/
├── components/         # Reusable UI (Navbar, PostCard, CommentList, VoteButtons, etc.)
├── pages/              # Route-level views (Home, PostDetail, CreatePost, Community, etc.)
├── context/            # Global auth state, useAuth() hook, AuthProvider
├── supabase-client.ts  # Supabase client initialisation
└── main.tsx            # App entry point + React Router setup
```

