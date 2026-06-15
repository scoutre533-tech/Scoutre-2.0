-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'silver', 'gold')),
  membership_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  developer TEXT NOT NULL,
  cover_image_url TEXT,
  trailer_url TEXT,
  genre TEXT NOT NULL,
  release_date DATE,
  is_hidden_gem BOOLEAN DEFAULT false,
  is_upcoming BOOLEAN DEFAULT false,
  steam_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reels (video content)
CREATE TABLE reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reel likes
CREATE TABLE reel_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reel_id)
);

-- Forum posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'hidden_gems', 'upcoming', 'dev_logs', 'content_creators')),
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum post likes
CREATE TABLE forum_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Forum replies
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "select_profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS Policies for games (publicly readable)
CREATE POLICY "select_games" ON games FOR SELECT USING (true);
CREATE POLICY "insert_games_admin" ON games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_games_admin" ON games FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for reels
CREATE POLICY "select_reels" ON reels FOR SELECT USING (true);
CREATE POLICY "insert_own_reels" ON reels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_reels" ON reels FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_reels" ON reels FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for reel_likes
CREATE POLICY "select_reel_likes" ON reel_likes FOR SELECT USING (true);
CREATE POLICY "insert_own_reel_like" ON reel_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_reel_like" ON reel_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for forum_posts
CREATE POLICY "select_forum_posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "insert_own_forum_post" ON forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_forum_post" ON forum_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_forum_post" ON forum_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for forum_likes
CREATE POLICY "select_forum_likes" ON forum_likes FOR SELECT USING (true);
CREATE POLICY "insert_own_forum_like" ON forum_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_forum_like" ON forum_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for forum_replies
CREATE POLICY "select_forum_replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "insert_own_forum_reply" ON forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_forum_reply" ON forum_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_forum_reply" ON forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insert sample games
INSERT INTO games (title, description, developer, genre, is_hidden_gem, is_upcoming, cover_image_url) VALUES
('Echoes of the Void', 'A hauntingly beautiful space exploration game where silence tells stories. Navigate through abandoned stations and uncover mysteries.', 'Stellar Dreams Studio', 'Adventure', true, false, 'https://images.pexels.com/photos/73871/rocket-launch-vehicle-device-technology-73871.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Neon Drift', 'High-speed racing through procedurally generated cyberpunk cities. Customize your vehicle and climb the leaderboards.', 'Velocity Games', 'Racing', true, false, 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Whispers in the Wind', 'An emotional narrative adventure about loss and hope, set in a beautifully hand-painted world.', 'Dawn Interactive', 'Adventure', true, false, 'https://images.pexels.com/photos/176931/pexels-photo-176931.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Protocol: Genesis', 'A tactical roguelike where every run tells a different story. Build your deck of abilities and fight through procedurally generated dungeons.', 'Binary Forge', 'Roguelike', true, false, 'https://images.pexels.com/photos/7915165/pexels-photo-7915165.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Fragments of Tomorrow', 'A civilization builder where your choices echo through generations. Shape the destiny of your people.', 'Temporal Works', 'Strategy', false, true, 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Starfall Odyssey', 'Explore infinite procedurally generated planets, each with unique ecosystems and mysteries to uncover.', 'Cosmos Interactive', 'Exploration', false, true, 'https://images.pexels.com/photos/2830056/pexels-photo-2830056.jpeg?auto=compress&cs=tinysrgb&w=800'),
('The Last Signal', 'A sci-fi horror experience aboard a derelict ship. Uncover what happened to the crew before it finds you.', 'Deep Space Devs', 'Horror', false, true, 'https://images.pexels.com/photos/585701/pexels-photo-585701.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Chronicles of the Edge', 'An action RPG set in a world where physics bend to your will. Master impossible abilities.', 'Breakpoint Studios', 'Action RPG', false, true, 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert sample reels
INSERT INTO reels (user_id, game_id, video_url, thumbnail_url, caption, likes_count, views_count)
SELECT 
  profiles.id,
  games.id,
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  games.cover_image_url,
  'Check out this amazing indie game: ' || games.title || '! A must-play hidden gem 🔥',
  (RANDOM() * 5000 + 100)::INT,
  (RANDOM() * 50000 + 1000)::INT
FROM profiles, games LIMIT 1;

-- Insert sample forum posts
INSERT INTO forum_posts (user_id, title, content, category, likes_count, replies_count)
SELECT 
  profiles.id,
  'Welcome to Scoutre - Discover Your Next Favorite Game!',
  'Hey everyone! This community is all about finding those amazing games that fly under the radar. Share your discoveries, connect with indie developers, and help content creators find their next adventure!',
  'general',
  50,
  10
FROM profiles LIMIT 1;