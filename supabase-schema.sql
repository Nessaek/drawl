-- =====================================================
-- DRAWL Database Schema for Supabase
-- =====================================================
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)

-- 1. Create the games table
CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  state jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  player1_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  player2_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Create the game_notifications table
CREATE TABLE IF NOT EXISTS game_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text REFERENCES games(id) ON DELETE CASCADE,
  message text NOT NULL,
  recipient_email text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_games_updated_at ON games(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_game_id ON game_notifications(game_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON game_notifications(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for games table
-- Allow anyone to read games (they need the ID to join)
CREATE POLICY "Anyone can read games" ON games
  FOR SELECT
  USING (true);

-- Allow anyone to insert games (for creating new games)
CREATE POLICY "Anyone can create games" ON games
  FOR INSERT
  WITH CHECK (true);

-- Allow players to update their games
CREATE POLICY "Players can update their games" ON games
  FOR UPDATE
  USING (
    auth.uid() = player1_id OR
    auth.uid() = player2_id OR
    player2_id IS NULL  -- Allow updates if player 2 hasn't joined yet
  );

-- 6. Create RLS policies for game_notifications table
-- Allow anyone to insert notifications
CREATE POLICY "Anyone can create notifications" ON game_notifications
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own notifications
CREATE POLICY "Users can read their notifications" ON game_notifications
  FOR SELECT
  USING (recipient_email = auth.email());

-- 7. Enable Realtime for the games table (CRITICAL for live updates!)
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- 8. Optional: Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Schema creation complete!
-- =====================================================
-- Next steps:
-- 1. Go to Supabase Dashboard → Database → Replication
-- 2. Verify that 'games' table appears in the publication
-- 3. Test your app - it should now sync in real-time!
