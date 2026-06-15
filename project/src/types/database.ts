export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          membership_tier: 'free' | 'silver' | 'gold';
          membership_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          membership_tier?: 'free' | 'silver' | 'gold';
          membership_expires_at?: string | null;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          membership_tier?: 'free' | 'silver' | 'gold';
          membership_expires_at?: string | null;
        };
      };
      games: {
        Row: {
          id: string;
          title: string;
          description: string;
          developer: string;
          cover_image_url: string | null;
          trailer_url: string | null;
          genre: string;
          release_date: string | null;
          is_hidden_gem: boolean;
          is_upcoming: boolean;
          steam_url: string | null;
          website_url: string | null;
          created_at: string;
        };
        Insert: {
          title: string;
          description: string;
          developer: string;
          genre: string;
          cover_image_url?: string | null;
          trailer_url?: string | null;
          release_date?: string | null;
          is_hidden_gem?: boolean;
          is_upcoming?: boolean;
          steam_url?: string | null;
          website_url?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          developer?: string;
          genre?: string;
          cover_image_url?: string | null;
          trailer_url?: string | null;
          release_date?: string | null;
          is_hidden_gem?: boolean;
          is_upcoming?: boolean;
          steam_url?: string | null;
          website_url?: string | null;
        };
      };
      reels: {
        Row: {
          id: string;
          user_id: string;
          game_id: string | null;
          video_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          likes_count: number;
          views_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          video_url: string;
          game_id?: string | null;
          thumbnail_url?: string | null;
          caption?: string | null;
        };
        Update: {
          caption?: string | null;
        };
      };
      reel_likes: {
        Row: {
          id: string;
          user_id: string;
          reel_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          reel_id: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: 'general' | 'hidden_gems' | 'upcoming' | 'dev_logs' | 'content_creators';
          likes_count: number;
          replies_count: number;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          category?: 'general' | 'hidden_gems' | 'upcoming' | 'dev_logs' | 'content_creators';
          is_pinned?: boolean;
        };
        Update: {
          title?: string;
          content?: string;
          category?: 'general' | 'hidden_gems' | 'upcoming' | 'dev_logs' | 'content_creators';
          is_pinned?: boolean;
        };
      };
      forum_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: string;
        };
      };
      forum_replies: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          parent_reply_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: string;
          content: string;
          parent_reply_id?: string | null;
        };
        Update: {
          content?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];
export type Reel = Database['public']['Tables']['reels']['Row'];
export type ReelLike = Database['public']['Tables']['reel_likes']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type ForumLike = Database['public']['Tables']['forum_likes']['Row'];
export type ForumReply = Database['public']['Tables']['forum_replies']['Row'];

export type MembershipTier = 'free' | 'silver' | 'gold';

export interface ReelWithDetails extends Reel {
  profiles: Pick<Profile, 'username' | 'avatar_url' | 'display_name'>;
  games: Pick<Game, 'title' | 'cover_image_url'> | null;
  isLiked?: boolean;
}

export interface ForumPostWithDetails extends ForumPost {
  profiles: Pick<Profile, 'username' | 'avatar_url' | 'display_name'>;
  isLiked?: boolean;
}
