import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, ChevronDown, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { ReelWithDetails } from '../types/database';
import { supabase } from '../lib/supabase';

interface FeedProps {
  user: User | null;
}

const mockReels: ReelWithDetails[] = [
  {
    id: '1',
    user_id: 'demo1',
    video_url: '',
    thumbnail_url: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Neon Drift gameplay - This hidden gem is INSANE! The physics are perfect and the cyberpunk aesthetic is breathtaking.',
    likes_count: 4523,
    views_count: 89234,
    created_at: new Date().toISOString(),
    game_id: 'game1',
    profiles: { username: 'cybergamer', avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'CyberGamer' },
    games: { title: 'Neon Drift', cover_image_url: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800' },
  },
  {
    id: '2',
    user_id: 'demo2',
    video_url: '',
    thumbnail_url: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Day 47 exploring Echoes of the Void - The atmosphere is hauntingly beautiful. No other game does space horror this well.',
    likes_count: 8234,
    views_count: 156789,
    created_at: new Date().toISOString(),
    game_id: 'game2',
    profiles: { username: 'spacedust', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'SpaceDust' },
    games: { title: 'Echoes of the Void', cover_image_url: 'https://images.pexels.com/photos/73871/rocket-launch-vehicle-technology-73871.jpeg?auto=compress&cs=tinysrgb&w=800' },
  },
  {
    id: '3',
    user_id: 'demo3',
    video_url: '',
    thumbnail_url: 'https://images.pexels.com/photos/585701/pexels-photo-585701.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'The Last Signal just dropped a new trailer and I cannot wait! Sci-fi horror done RIGHT.',
    likes_count: 12341,
    views_count: 234567,
    created_at: new Date().toISOString(),
    game_id: 'game3',
    profiles: { username: 'horrorhive', avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'HorrorHive' },
    games: { title: 'The Last Signal', cover_image_url: 'https://images.pexels.com/photos/585701/pexels-photo-585701.jpeg?auto=compress&cs=tinysrgb&w=800' },
  },
  {
    id: '4',
    user_id: 'demo4',
    video_url: '',
    thumbnail_url: 'https://images.pexels.com/photos/7915165/pexels-photo-7915165.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Protocol: Genesis is the roguelike you have been sleeping on! 50+ hours and every run feels fresh. MUST PLAY!',
    likes_count: 6789,
    views_count: 98765,
    created_at: new Date().toISOString(),
    game_id: 'game4',
    profiles: { username: 'roguelegend', avatar_url: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'RogueLegend' },
    games: { title: 'Protocol: Genesis', cover_image_url: 'https://images.pexels.com/photos/7915165/pexels-photo-7915165.jpeg?auto=compress&cs=tinysrgb&w=800' },
  },
  {
    id: '5',
    user_id: 'demo5',
    video_url: '',
    thumbnail_url: 'https://images.pexels.com/photos/176931/pexels-photo-176931.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Whispers in the Wind made me cry. This is storytelling in games at its finest. indie magic.',
    likes_count: 15678,
    views_count: 345678,
    created_at: new Date().toISOString(),
    game_id: 'game5',
    profiles: { username: 'storyweaver', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'StoryWeaver' },
    games: { title: 'Whispers in the Wind', cover_image_url: 'https://images.pexels.com/photos/176931/pexels-photo-176931.jpeg?auto=compress&cs=tinysrgb&w=800' },
  },
];

export function Feed({ user }: FeedProps) {
  const [reels, setReels] = useState<ReelWithDetails[]>(mockReels);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLike = useCallback((reelId: string) => {
    setLikedReels((prev) => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
        setReels((r) => r.map((reel) => reel.id === reelId ? { ...reel, likes_count: reel.likes_count - 1 } : reel));
      } else {
        next.add(reelId);
        setReels((r) => r.map((reel) => reel.id === reelId ? { ...reel, likes_count: reel.likes_count + 1 } : reel));
      }
      return next;
    });
  }, []);

  const handleSave = useCallback((reelId: string) => {
    setSavedReels((prev) => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
      } else {
        next.add(reelId);
      }
      return next;
    });
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, reels.length]);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * containerRef.current.clientHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-dark-900 sm:pt-16">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth"
      >
        {reels.map((reel, index) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            isActive={index === currentIndex}
            isPlaying={index === currentIndex && isPlaying}
            isMuted={isMuted}
            isLiked={likedReels.has(reel.id)}
            isSaved={savedReels.has(reel.id)}
            onLike={() => handleLike(reel.id)}
            onSave={() => handleSave(reel.id)}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onMuteToggle={() => setIsMuted(!isMuted)}
            user={user}
          />
        ))}
      </div>

      {reels.length > 1 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2 z-40">
          {reels.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-8 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-neon-cyan shadow-neon-cyan'
                  : 'bg-dark-500 hover:bg-dark-400'
              }`}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => scrollToIndex(Math.min(currentIndex + 1, reels.length - 1))}
        className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-bounce"
      >
        <ChevronDown className="w-8 h-8 text-neon-cyan/60" />
      </button>
    </div>
  );
}

interface ReelCardProps {
  reel: ReelWithDetails;
  isActive: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  user: User | null;
}

function ReelCard({
  reel,
  isActive,
  isPlaying,
  isMuted,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onPlayPause,
  onMuteToggle,
}: ReelCardProps) {
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        onLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          onPlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="h-full w-full snap-start relative flex items-center justify-center bg-dark-900">
      <div className="absolute inset-0">
        <img
          src={reel.thumbnail_url || reel.games?.cover_image_url || ''}
          alt={reel.games?.title || 'Game reel'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/20 via-transparent to-dark-900/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/60 via-transparent to-transparent" />
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer touch-manipulation"
        onClick={handleTap}
      >
        {isActive && !isPlaying && (
          <div className="p-4 sm:p-6 rounded-full glass-effect">
            <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1" />
          </div>
        )}
      </div>

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart className="w-32 h-32 text-neon-pink fill-neon-pink animate-ping" />
        </div>
      )}

      <div className="absolute right-2 sm:right-4 bottom-36 sm:bottom-28 flex flex-col gap-3 sm:gap-4 z-30">
        <button
          onClick={onLike}
          className="flex flex-col items-center gap-0.5 sm:gap-1 group touch-manipulation"
        >
          <div className={`p-2.5 sm:p-3 rounded-full glass-effect transition-all duration-300 ${
            isLiked ? 'text-neon-pink' : 'text-white group-hover:text-neon-pink'
          }`}>
            <Heart className={`w-6 h-6 sm:w-7 sm:h-7 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-white text-xs font-medium">{formatNumber(reel.likes_count)}</span>
        </button>

        <button className="flex flex-col items-center gap-0.5 sm:gap-1 group touch-manipulation">
          <div className="p-2.5 sm:p-3 rounded-full glass-effect text-white group-hover:text-neon-cyan transition-colors">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-white text-xs font-medium">{formatNumber(reel.views_count)}</span>
        </button>

        <button
          onClick={onSave}
          className="flex flex-col items-center gap-0.5 sm:gap-1 group touch-manipulation"
        >
          <div className={`p-2.5 sm:p-3 rounded-full glass-effect transition-all duration-300 ${
            isSaved ? 'text-neon-cyan' : 'text-white group-hover:text-neon-cyan'
          }`}>
            <Bookmark className={`w-6 h-6 sm:w-7 sm:h-7 ${isSaved ? 'fill-current' : ''}`} />
          </div>
          <span className="text-white text-xs font-medium hidden sm:block">Save</span>
        </button>

        <button className="flex flex-col items-center gap-0.5 sm:gap-1 group touch-manipulation">
          <div className="p-2.5 sm:p-3 rounded-full glass-effect text-white group-hover:text-neon-blue transition-colors">
            <Share2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-white text-xs font-medium hidden sm:block">Share</span>
        </button>
      </div>

      <div className="absolute left-3 sm:left-4 right-16 sm:right-20 bottom-6 sm:bottom-8 z-30">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="relative flex-shrink-0">
            <img
              src={reel.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.profiles.username}`}
              alt={reel.profiles.display_name || reel.profiles.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-neon-cyan/50"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-neon-cyan rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-dark-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-xs sm:text-sm truncate">@{reel.profiles.username}</p>
            {reel.profiles.display_name && (
              <p className="text-gray-400 text-xs truncate">{reel.profiles.display_name}</p>
            )}
          </div>
          <button className="flex-shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan text-xs font-semibold hover:bg-neon-cyan/30 transition-all touch-manipulation">
            Follow
          </button>
        </div>

        {reel.games && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className="px-2 py-0.5 sm:py-1 rounded-md bg-neon-purple/20 text-neon-purple text-xs font-medium">
              {reel.games.title}
            </span>
            <span className="px-2 py-0.5 sm:py-1 rounded-md bg-dark-600/50 text-gray-400 text-xs">
              Hidden Gem
            </span>
          </div>
        )}

        <p className="text-white text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
          {reel.caption}
        </p>
      </div>

      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={onMuteToggle}
          className="p-2 rounded-full glass-effect text-white hover:text-neon-cyan transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
