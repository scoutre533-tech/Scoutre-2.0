import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Pin, Search, Plus, Clock, User, ChevronRight, Filter, TrendingUp, Flame, Sparkles, Gamepad2, Video } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { ForumPostWithDetails } from '../types/database';

type Category = 'all' | 'general' | 'hidden_gems' | 'upcoming' | 'dev_logs' | 'content_creators';
type SortBy = 'recent' | 'popular' | 'trending';

interface CommunityProps {
  user: SupabaseUser | null;
}

const categoryConfig: Record<Category, { label: string; icon: typeof MessageCircle; color: string }> = {
  all: { label: 'All Discussions', icon: MessageCircle, color: 'text-gray-400' },
  general: { label: 'General', icon: MessageCircle, color: 'text-neon-cyan' },
  hidden_gems: { label: 'Hidden Gems', icon: Sparkles, color: 'text-neon-purple' },
  upcoming: { label: 'Upcoming Games', icon: Flame, color: 'text-neon-pink' },
  dev_logs: { label: 'Dev Logs', icon: Gamepad2, color: 'text-neon-green' },
  content_creators: { label: 'Content Creators', icon: Video, color: 'text-neon-blue' },
};

const mockPosts: ForumPostWithDetails[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Welcome to Scoutre - Discover Your Next Favorite Game!',
    content: 'Hey everyone! This community is all about finding those amazing games that fly under the radar. Share your discoveries, connect with indie developers, and help content creators find their next adventure!',
    category: 'general',
    likes_count: 154,
    replies_count: 23,
    is_pinned: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    profiles: { username: 'scoutre', avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'Scoutre Team' },
  },
  {
    id: '2',
    user_id: 'user2',
    title: 'Just finished Echoes of the Void - Wow. Just wow.',
    content: 'Just finished Echoes of the Void and I am blown away. The atmosphere, the story, the sense of isolation... This is what space exploration games should be. No hand holding, just pure discovery. Anyone else played it? Would love to discuss the ending!',
    category: 'hidden_gems',
    likes_count: 234,
    replies_count: 45,
    is_pinned: false,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    profiles: { username: 'spacerunner', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'SpaceRunner' },
  },
  {
    id: '3',
    user_id: 'user3',
    title: 'Fragments of Tomorrow - Dev Log #5: Procedural Generation Deep Dive',
    content: 'Hey everyone! I am the solo dev behind Fragments of Tomorrow. Today I want to share how our procedural generation system works. We are using a mix of noise-based terrain and hand-crafted biomes to create worlds that feel both alien and intentional...',
    category: 'dev_logs',
    likes_count: 412,
    replies_count: 67,
    is_pinned: false,
    created_at: '2024-01-22T09:15:00Z',
    updated_at: '2024-01-22T09:15:00Z',
    profiles: { username: 'temporaldev', avatar_url: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'Temporal Works' },
  },
  {
    id: '4',
    user_id: 'user4',
    title: 'Looking for indie horror games to stream - any recommendations?',
    content: 'Hey content creators! I am looking for some genuinely terrifying indie horror games to stream for Halloween. Not just jumpscares, but psychological horror. Bonus points for lesser-known titles that could use some exposure. Drop your recommendations below!',
    category: 'content_creators',
    likes_count: 89,
    replies_count: 34,
    is_pinned: false,
    created_at: '2024-01-23T16:45:00Z',
    updated_at: '2024-01-23T16:45:00Z',
    profiles: { username: 'horrorqueen', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'HorrorQueen' },
  },
  {
    id: '5',
    user_id: 'user5',
    title: 'Starfall Odyssey Early Access impressions - This game is special',
    content: 'Got into the early access for Starfall Odyssey and guys, this is IT. The planet generation is insane, every world feels unique. Found a moon with floating crystals and bioluminescent oceans. The exploration loop is just perfect. Cannot wait to see how this develops...',
    category: 'upcoming',
    likes_count: 567,
    replies_count: 89,
    is_pinned: false,
    created_at: '2024-01-24T11:20:00Z',
    updated_at: '2024-01-24T11:20:00Z',
    profiles: { username: 'cosmicwanderer', avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'CosmicWanderer' },
  },
  {
    id: '6',
    user_id: 'user6',
    title: 'Protocol: Genesis tips for new players - Building your first deck',
    content: 'After 100+ hours in Protocol: Genesis, here are my tips for new players: 1. Don not try to unlock everything at once. Focus on 2-3 synergies. 2. Movement abilities are king. 3. Learn to read the enemy patterns before your build...',
    category: 'hidden_gems',
    likes_count: 345,
    replies_count: 56,
    is_pinned: false,
    created_at: '2024-01-25T08:00:00Z',
    updated_at: '2024-01-25T08:00:00Z',
    profiles: { username: 'roguelikeking', avatar_url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150', display_name: 'RogueLikeKing' },
  },
];

export function Community({ user }: CommunityProps) {
  const [posts, setPosts] = useState<ForumPostWithDetails[]>(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState<ForumPostWithDetails[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPostWithDetails | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let result = [...posts];

    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      switch (sortBy) {
        case 'popular':
          return b.likes_count - a.likes_count;
        case 'trending':
          return (b.likes_count + b.replies_count * 2) - (a.likes_count + a.replies_count * 2);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredPosts(result);
  }, [posts, category, sortBy, searchQuery]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*, profiles(username, avatar_url, display_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setPosts(data.map((p) => ({ ...p, profiles: p.profiles as ForumPostWithDetails['profiles'] })));
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts((p) => p.map((post) => post.id === postId ? { ...post, likes_count: post.likes_count - 1 } : post));
      } else {
        next.add(postId);
        setPosts((p) => p.map((post) => post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post));
      }
      return next;
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 30) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
            Community <span className="text-gradient-cyan">Hub</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Connect with fellow scouts, share discoveries, and discuss games.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold text-sm hover:shadow-neon-cyan transition-all whitespace-nowrap">
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="glass-effect rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-dark-600/50 border border-dark-500/50 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-dark-600/50 border border-dark-500/50 rounded-lg text-white focus:border-neon-cyan/50 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Liked</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setCategory(key as Category)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex-shrink-0 touch-manipulation ${
              category === key
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'bg-dark-600/50 text-gray-400 hover:text-white hover:bg-dark-500/50 border border-dark-500/50'
            }`}
          >
            <config.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {config.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-neon-cyan/30 rounded-full animate-spin border-t-neon-cyan" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPosts.has(post.id)}
              onLike={() => handleLike(post.id)}
              onSelect={() => setSelectedPost(post)}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isLiked={likedPosts.has(selectedPost.id)}
          onLike={() => handleLike(selectedPost.id)}
          onClose={() => setSelectedPost(null)}
          formatTimeAgo={formatTimeAgo}
        />
      )}
    </div>
  );
}

interface PostCardProps {
  post: ForumPostWithDetails;
  isLiked: boolean;
  onLike: () => void;
  onSelect: () => void;
  formatTimeAgo: (date: string) => string;
}

function PostCard({ post, isLiked, onLike, onSelect, formatTimeAgo }: PostCardProps) {
  const config = categoryConfig[post.category];
  const Icon = config.icon;

  return (
    <article
      className={`glass-effect rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-neon-cyan/30 cursor-pointer ${
        post.is_pinned ? 'border-neon-purple/30' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <img
          src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`}
          alt={post.profiles.display_name || post.profiles.username}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-dark-500/50 hidden sm:block"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neon-purple/20 text-neon-purple text-xs font-medium">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-dark-600/50 ${config.color} text-xs font-medium`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            <span className="text-gray-500 text-xs inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(post.created_at)}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-white mb-2 hover:text-neon-cyan transition-colors line-clamp-1">
            {post.title}
          </h2>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">@{post.profiles.username}</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isLiked ? 'text-neon-pink' : 'text-gray-500 hover:text-neon-pink'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {post.likes_count}
              </button>
              <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MessageCircle className="w-4 h-4" />
                {post.replies_count}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 hidden sm:block" />
      </div>
    </article>
  );
}

interface PostModalProps {
  post: ForumPostWithDetails;
  isLiked: boolean;
  onLike: () => void;
  onClose: () => void;
  formatTimeAgo: (date: string) => string;
}

function PostModal({ post, isLiked, onLike, onClose, formatTimeAgo }: PostModalProps) {
  const config = categoryConfig[post.category];
  const Icon = config.icon;
  const [replyContent, setReplyContent] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-effect rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-dark-500/50">
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-dark-600/50 ${config.color} text-sm font-medium`}>
              <Icon className="w-4 h-4" />
              {config.label}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full glass-effect text-white hover:text-neon-pink transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-4">{post.title}</h2>

          <div className="flex items-center gap-3">
            <img
              src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`}
              alt={post.profiles.display_name || post.profiles.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-cyan/30"
            />
            <div>
              <p className="text-white font-medium">{post.profiles.display_name || post.profiles.username}</p>
              <p className="text-gray-500 text-sm">@{post.profiles.username} · {formatTimeAgo(post.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-dark-500/50">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-neon-pink/20 text-neon-pink'
                  : 'bg-dark-600/50 text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes_count}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-600/50 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.replies_count}</span>
            </button>
          </div>
        </div>

        <div className="p-6 pt-0">
          <div className="relative">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-4 py-3 bg-dark-600/50 border border-dark-500/50 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none transition-colors resize-none"
            />
            <button
              disabled={!replyContent.trim()}
              className="absolute right-3 bottom-3 px-4 py-1.5 rounded-lg bg-neon-cyan text-dark-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon-cyan transition-all"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
