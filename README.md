# ✍️ DRAWL

> A real-time multiplayer word game built with React and Supabase — created to learn Supabase's real-time features!

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**DRAWL** is a multiplayer word game that improves upon Scrabble by letting you choose your letter distribution — inspired by the UK game show *Countdown*.

## 📖 Why This Project?

I built DRAWL to:
- **Learn Supabase**: Explore real-time subscriptions, auth, and postgres triggers
- **Solve a Scrabble problem**: Eliminate the frustration of getting stuck with all vowels or all consonants
- **Practice modern React**: Hooks, custom state management, and optimistic UI updates

**Contributions welcome!** See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## ✨ Features

### Core Gameplay
- **Choose Your Letters**: Select consonants and vowels (4-9 tiles total) — inspired by *Countdown*
- **Real-time Multiplayer**: Powered by Supabase Realtime for instant board updates
- **Turn-based Play**: Asynchronous gameplay with email notifications when it's your turn
- **Word Validation**: 279k+ word dictionary with automatic scoring
- **Premium Squares**: Triple/Double word and letter bonuses (just like Scrabble)

### UX Enhancements
- 🎵 **Sound Effects**: Audio feedback for tile placement, word validation, and turn changes
- 📳 **Haptic Feedback**: Vibration support for mobile devices
- 🔔 **Browser Notifications**: Get notified when it's your turn (even when tab is inactive)
- ♿ **Accessibility**: Full keyboard navigation and ARIA labels
- 🎨 **Animations**: Smooth tile placements, turn indicators, and loading states
- 📱 **Mobile-Optimized**: Touch-friendly with drag & drop support
- 🌐 **Connection Status**: Live connection monitoring with auto-reconnect

### Auth & Data
- **Google OAuth**: One-click sign-in with Google
- **Email Auth**: Traditional email/password with password reset
- **User Profiles**: Customizable avatars and display names
- **Game History**: Track active games and resume from the profile dropdown

## 🛠 Tech Stack

- **Frontend**: React 19, Vite
- **Backend**: Supabase (Postgres, Realtime, Auth)
- **Styling**: Standard CSS (Flexbox/Grid)
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))

### 1. Clone & Install
```bash
git clone https://github.com/your-username/drawl.git
cd drawl
npm install
```

### 2. Supabase Setup

#### Create a new project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Save your project URL and anon key

#### Run the database schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of [`supabase-schema.sql`](supabase-schema.sql)
4. Click **Run**

#### Verify Realtime is enabled
1. Go to **Database** → **Replication**
2. Ensure the `games` table appears in the publication
3. If not, run: `alter publication supabase_realtime add table games;`

### 3. Environment Variables
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) and start playing! 🎉

## 🌍 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/drawl)

1. Click the button above or push to GitHub and import in Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Deploy! Vercel will auto-detect Vite configuration

### Other Platforms
Works on any static hosting platform (Netlify, Cloudflare Pages, etc.)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🏗️ Architecture & Learning Notes

### Why Supabase?
This project was built specifically to learn Supabase's features:
- **Realtime subscriptions** for live board updates
- **Postgres RLS** for secure multiplayer game state
- **Auth** with Google OAuth and magic links
- **Edge Functions** for email notifications (optional)

### State Management Philosophy
No Redux! The entire game state is stored as a JSONB blob in Postgres:
```typescript
{
  phase: 'play',
  board: [...],
  players: [...],
  currentPlayerIndex: 0,
  turnNum: 1,
  history: [...]
}
```

When a player makes a move:
1. Client optimistically updates local state
2. State is upserted to Supabase
3. Other clients receive updates via Realtime subscription
4. `isRemoteUpdate` flag prevents echo loops

### Turn-Based Architecture
Each player is tied to their `auth.users.id`:
- Only the current player can place words (validated server-side via RLS)
- Each player sees their own rack, regardless of whose turn it is
- Turn changes trigger browser notifications for offline players

### Email Notifications
To handle email notifications when users join or play, I've implemented a "Notification Trigger" pattern:
1. When a significant event happens (join/move), the client inserts a row into the `game_notifications` table.
2. A Supabase Edge Function (or Database Webhook) is triggered by this insert.
3. The function uses the [Resend](https://resend.com) API to send an email to the other player(s).

**Edge Function Example (`supabase/functions/send-game-email/index.ts`):**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { record } = await req.json()
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'DRAWL <notifications@yourdomain.com>',
      to: [record.recipient_email],
      subject: 'New Move in DRAWL!',
      html: `<p>${record.message}</p>`
    })
  })
  return new Response(JSON.stringify(await res.json()), { status: 200 })
})
```

### Optional: Email Notifications
To enable email notifications when players join/move, set up a Supabase Edge Function:

1. Install Supabase CLI: `npm install -g supabase`
2. Create function: `supabase functions new send-game-email`
3. Use [Resend](https://resend.com) or any SMTP service
4. Deploy: `supabase functions deploy send-game-email`

See [`supabase/functions/send-game-email/index.ts`](supabase/functions/send-game-email/index.ts) example in the README's "Dev Notes" section.

## 🤝 Contributing

Contributions are welcome! This is a learning project, so feel free to:
- 🐛 Report bugs or UX issues
- 💡 Suggest features or improvements
- 🎨 Improve the UI/UX
- 📝 Fix typos or improve documentation
- ⚡ Optimize performance

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ideas for Contributors
- [ ] Add an AI opponent mode
- [ ] Implement a global leaderboard
- [ ] Add more premium square patterns
- [ ] Support for 3-4 player games
- [ ] Word definition lookup (API integration)
- [ ] Game replays and analysis
- [ ] Custom board sizes
- [ ] Tournament mode

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Dictionary: [dwyl/english-words](https://github.com/dwyl/english-words)
- Inspired by Scrabble and the UK game show *Countdown*
- Built with React, Vite, and Supabase

---

**Made with ❤️ to learn Supabase** • [Report Bug](https://github.com/your-username/drawl/issues) • [Request Feature](https://github.com/your-username/drawl/issues)
