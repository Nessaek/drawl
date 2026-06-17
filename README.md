# ✍️ DRAWL

A real-time, multiplayer word game built with React and Supabase.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

**DRAWL** is a simple multiplayer word game. I built it to experiment with real-time state syncing using Supabase and to see how far I could push a "serverless" game architecture. It's inspired by Scrabble and Countdown.

## 🚀 Features

- **Real-time Sync**: Uses Supabase Realtime to sync game state across players.
- **Auth**: Supports Google OAuth and traditional email login.
- **Board Logic**: Automatic word validation and scoring (including premium squares).
- **Responsive**: Works on desktop (drag & drop) and mobile.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite
- **Backend**: Supabase (Postgres, Realtime, Auth)
- **Styling**: Standard CSS (Flexbox/Grid)
- **Deployment**: Vercel

## 📖 Local Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-username/drawl.git
   cd drawl
   npm install
   ```

2. **Supabase Config**:
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. **Database Schema**:
   Run this in your Supabase SQL editor:
   ```sql
   create table games (
     id text primary key,
     state jsonb not null,
     updated_at timestamptz default now()
   );
   alter publication supabase_realtime add table games;
   ```

4. **Run**:
   ```bash
   npm run dev
   ```

## 🌍 Deployment (Vercel)

This project is designed to be hosted on Vercel.

1. **Push to GitHub**: Connect your repo to Vercel.
2. **Environment Variables**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project settings.
3. **Build Settings**: Vercel should auto-detect Vite, but if not:
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 🧠 Dev Notes

### State Management
I chose not to use Redux or any heavy state management. Instead, the entire game state lives in a `jsonb` blob in Supabase. When a player moves, the client pushes the new state, and everyone else gets the update via a Realtime subscription. It’s snappy enough for a turn-based game and keeps the code simple.

### Mobile
I started exploring Capacitor for a native build but decided to keep it as a clean web app for now. It uses safe-area variables and touch events to feel "native-ish" in a mobile browser.

## 📄 License

MIT
# drawl
