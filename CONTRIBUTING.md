# Contributing to DRAWL

First off, thanks for taking the time to contribute! 🎉

This is a learning project built to explore Supabase, so **all contributions are welcome** — whether you're fixing bugs, improving UX, or adding features.

## 🚀 How to Contribute

### Reporting Bugs

Found a bug? Please [open an issue](https://github.com/your-username/drawl/issues/new) with:
- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your browser/OS info

### Suggesting Features

Have an idea? [Open an issue](https://github.com/your-username/drawl/issues/new) with:
- A clear description of the feature
- Why it would be useful
- Any implementation ideas (optional)

### Pull Requests

1. **Fork the repo** and create your branch from `main`
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Test your changes locally
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git commit -m "Add some feature"
   ```
   Use descriptive commit messages (e.g., "Add AI opponent mode", "Fix tile drag on mobile")

4. **Push and create a PR**
   ```bash
   git push origin feature/my-new-feature
   ```
   Then open a Pull Request on GitHub

## 🛠️ Development Setup

See the [Quick Start](README.md#-quick-start) section in the README for setup instructions.

### Project Structure

```
drawl/
├── src/
│   ├── components/      # React components (Board, Rack, Modals, etc.)
│   ├── hooks/          # Custom React hooks (useGameState, useAuth, etc.)
│   ├── lib/            # Utilities (gameLogic, constants, supabase client)
│   └── App.jsx         # Main app component
├── public/             # Static assets
└── supabase-schema.sql # Database schema
```

### Tech Stack

- **React 19** with hooks (no classes)
- **Vite** for dev server and build
- **Supabase** for backend (Postgres + Realtime + Auth)
- **Vanilla CSS** (no CSS-in-JS or Tailwind)

### Code Style

- Use **functional components** and hooks
- Prefer **`useCallback`** for event handlers to prevent re-renders
- Use **`const`** over `let` where possible
- Keep components focused (single responsibility)
- Add **comments** for complex logic

## 🎯 Good First Issues

Looking for something to work on? Try these beginner-friendly tasks:

- [ ] Improve mobile touch gestures
- [ ] Add more keyboard shortcuts
- [ ] Fix CSS styling edge cases
- [ ] Add unit tests for game logic
- [ ] Improve accessibility (ARIA labels, focus management)
- [ ] Add more error messages for common issues
- [ ] Optimize bundle size

## 💡 Feature Ideas

Want to add a bigger feature? Here are some ideas:

### Game Features
- **AI Opponent**: Add a bot player with difficulty levels
- **3-4 Player Support**: Extend to more than 2 players
- **Custom Boards**: Different board sizes (10x10, 20x20)
- **Word Definitions**: Show definitions from a dictionary API
- **Game Replays**: Save and replay completed games
- **Undo Move**: Let players take back their last word

### UX Improvements
- **Dark Mode**: Add a theme toggle
- **Leaderboard**: Global or friend-based rankings
- **Game Stats**: Track wins, best words, average scores
- **Chat**: Add a chat sidebar for players
- **Tournaments**: Multi-game tournament brackets

### Technical Improvements
- **Unit Tests**: Add tests for game logic
- **E2E Tests**: Playwright or Cypress tests
- **PWA**: Make it installable as a Progressive Web App
- **Offline Mode**: Play against AI when offline
- **Performance**: Optimize re-renders and bundle size

## 📝 Code of Conduct

- Be respectful and constructive
- Help others learn (this is a learning project!)
- Follow GitHub's [Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines)

## 🧪 Testing

Before submitting a PR:

1. **Test locally**
   ```bash
   npm run dev
   ```

2. **Build successfully**
   ```bash
   npm run build
   ```

3. **Test in both browsers** (Chrome and Safari/Firefox)

4. **Test multiplayer** (open in two different browsers/incognito windows)

## 📦 Dependencies

Try to **avoid adding new dependencies** unless necessary. This keeps the bundle small and the project easy to understand.

If you must add a dependency:
- Explain why in your PR
- Keep it lightweight
- Check its bundle size with [bundlephobia](https://bundlephobia.com)

## 🙋 Questions?

Not sure about something? Feel free to:
- [Open an issue](https://github.com/your-username/drawl/issues/new) with the `question` label
- Ask in your PR description
- Reach out to the maintainer

---

**Thanks for contributing!** 🚀

Every contribution helps make DRAWL better for everyone learning Supabase and building real-time apps.
