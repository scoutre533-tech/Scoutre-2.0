import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Gamepad2, User, Bot, Loader2, RefreshCw, Heart, Star, Lock, Crown, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Game } from '../types/database';

interface ScoutProps {
  user: SupabaseUser | null;
  onNavigateToMembership: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayContent?: string;
  timestamp: Date;
  games?: RecommendedGame[];
}

interface RecommendedGame {
  title: string;
  developer: string;
  genre: string;
  tag: string;
  description: string;
  coverUrl: string;
}

interface UserProfile {
  membership_tier: 'free' | 'silver' | 'gold';
  is_founder: boolean;
  daily_message_count: number;
  last_message_date: string | null;
}

interface ChatSuggestion {
  text: string;
  icon: typeof Sparkles;
}

const suggestions: ChatSuggestion[] = [
  { text: "Find me a hidden gem indie game", icon: Sparkles },
  { text: "Recommend roguelikes with deep progression", icon: Gamepad2 },
  { text: "What upcoming indie games should I watch?", icon: Star },
  { text: "I want something relaxing and beautiful", icon: Heart },
];

const DAILY_CAPS: Record<string, number> = {
  silver: 20,
  gold: 50,
  founder: 50,
};

const SYSTEM_PROMPT = `You are Scout, the AI assistant for Scoutre — a gaming community platform with a mission to flip the script on the algorithm. While every other platform buries indie games under AAA titles, Scoutre exists specifically to amplify small indie developers, up-and-coming content creators, and help gamers find experiences they never knew they needed.

Your personality: Think JARVIS meets a hardcore gamer who's deeply "in the know." You're sharp, confident, occasionally witty with dry humor, and genuinely passionate about indie games and the devs behind them. You champion the underdog. You're not here for AAA hype — you're here to surface the gems everyone else is sleeping on. You have opinions. You're not a generic assistant.

Tone rules:
- Confident, not arrogant
- Witty and dry, never try-hard
- Passionate about indie games and small devs
- Drop the occasional dry observation or joke, but never at expense of being helpful
- Never refer to yourself as "Claude" or "AI" — you are Scout
- Keep responses punchy and conversational, not essay-length

Your capabilities:
- Recommend indie and hidden gem games based on what users describe
- Point users toward indie developers and their Scoutre profiles (mention Developer's Corner)
- Mention content creators who cover these types of games
- Actively promote the Scoutre mission of amplifying small devs and creators
- Give honest takes on games, genres, and the gaming industry

When recommending games, ALWAYS format your response like this:
1. A short punchy intro (1-2 sentences with personality)
2. Your recommendations with brief explanations
3. At the very end, append a JSON block in EXACTLY this format:
GAMES_JSON:[{"title":"Game Title","developer":"Dev Name","genre":"Genre","tag":"Hidden Gem","description":"One sentence that makes this game sound unmissable.","coverUrl":""}]

Tag options: "Hidden Gem", "Upcoming", "Indie Pick", "Staff Pick"

When someone asks about developers or wants to find indie devs:
- Tell them to check out the Developer's Corner section on Scoutre
- Mention that Scoutre's feed prioritizes lower-viewed content creators and devs over established names
- That's literally the whole point of the platform

Always end with either a follow-up question to refine recommendations, or a teaser about another game/dev worth checking out. Keep the conversation going.`;

const mockGames: RecommendedGame[] = [
  { title: "Echoes of the Void", developer: "Stellar Dreams Studio", genre: "Adventure", tag: "Hidden Gem", description: "Hauntingly beautiful space exploration with zero hand-holding and maximum atmosphere.", coverUrl: "https://images.pexels.com/photos/73871/rocket-launch-vehicle-technology-73871.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { title: "Protocol: Genesis", developer: "Binary Forge", genre: "Roguelike", tag: "Hidden Gem", description: "A tactical roguelike where every run tells a completely different story.", coverUrl: "https://images.pexels.com/photos/7915165/pexels-photo-7915165.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { title: "Whispers in the Wind", developer: "Dawn Interactive", genre: "Adventure", tag: "Indie Pick", description: "An emotional narrative adventure set in a breathtaking hand-painted world.", coverUrl: "https://images.pexels.com/photos/176931/pexels-photo-176931.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

export function Scout({ user, onNavigateToMembership }: ScoutProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    addWelcomeMessage();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_tier, is_founder, daily_message_count, last_message_date')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      if (data) {
        setUserProfile(data);
        const today = new Date().toISOString().split('T')[0];
        if (data.last_message_date === today) {
          setMessagesUsedToday(data.daily_message_count);
        } else {
          setMessagesUsedToday(0);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const updateMessageCount = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newCount = messagesUsedToday + 1;
    setMessagesUsedToday(newCount);
    try {
      await supabase
        .from('profiles')
        .update({
          daily_message_count: newCount,
          last_message_date: today,
        })
        .eq('id', user.id);
    } catch (err) {
      console.error('Error updating message count:', err);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'assistant',
      content: "Scout online. I've got eyes on every hidden gem, sleeper hit, and underdog dev that the algorithm forgot about. What kind of game are we hunting today?",
      displayContent: "Scout online. I've got eyes on every hidden gem, sleeper hit, and underdog dev that the algorithm forgot about. What kind of game are we hunting today?",
      timestamp: new Date(),
      games: [],
    };
    setMessages([welcomeMsg]);
  };

  const getTier = (): 'free' | 'silver' | 'gold' => {
    if (!user || !userProfile) return 'free';
    return userProfile.membership_tier || 'free';
  };

  const getDailyCap = (): number => {
    if (!userProfile) return 0;
    if (userProfile.is_founder) return DAILY_CAPS.founder;
    return DAILY_CAPS[userProfile.membership_tier] || 0;
  };

  const isAtCap = (): boolean => {
    const cap = getDailyCap();
    return messagesUsedToday >= cap;
  };

  const parseGames = (text: string): RecommendedGame[] | null => {
    const match = text.match(/GAMES_JSON:(\[.*?\])/s);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  };

  const stripGamesJson = (text: string): string => {
    return text.replace(/GAMES_JSON:\[.*?\]/s, '').trim();
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isTyping) return;

    const tier = getTier();

    if (tier === 'free') return;

    if (isAtCap()) return;

    setShowSuggestions(false);
    setInput('');
    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await updateMessageCount();

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      if (!apiKey) {
        throw new Error('No API key');
      }

      const apiMessages = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMessage)
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const rawContent = data.content?.[0]?.text || "My radar's glitching. Try again?";
      const games = parseGames(rawContent);
      const displayContent = stripGamesJson(rawContent);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: rawContent,
        displayContent,
        timestamp: new Date(),
        games: games || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const lowerText = text.toLowerCase();
      let fallbackGames = mockGames;
      if (lowerText.includes('rogue') || lowerText.includes('deck')) {
        fallbackGames = [mockGames[1]];
      } else if (lowerText.includes('story') || lowerText.includes('narrative')) {
        fallbackGames = [mockGames[2]];
      }

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "My uplink to the mothership is down — running on offline intel for now. Add your API key to unlock full AI mode. Here's what I've got cached:",
        displayContent: "My uplink to the mothership is down — running on offline intel for now. Add your API key to unlock full AI mode. Here's what I've got cached:",
        timestamp: new Date(),
        games: fallbackGames,
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    addWelcomeMessage();
  };

  const tier = getTier();
  const cap = getDailyCap();
  const remaining = Math.max(0, cap - messagesUsedToday);

  // Free tier locked screen
  if (tier === 'free') {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 pb-4 sm:pb-8 flex flex-col items-center justify-center max-w-4xl mx-auto px-4">
        <div className="w-full max-w-lg glass-effect rounded-2xl overflow-hidden">
          {/* Top gradient banner */}
          <div className="relative p-8 bg-gradient-to-br from-neon-cyan/10 via-neon-blue/10 to-neon-purple/10 border-b border-dark-500/50 text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue">
                <Bot className="w-10 h-10 text-dark-900" />
              </div>
            </div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-dark-600/50">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Meet Scout AI</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Talk to our advanced artificial intelligence model for gaming suggestions tailored specifically to your interests — powered by the same AI behind the most sophisticated assistants on the planet.
            </p>
          </div>

          {/* Features list */}
          <div className="p-6 space-y-3">
            {[
              { icon: Sparkles, text: 'Personalized game recommendations based on your taste', color: 'text-neon-cyan' },
              { icon: Gamepad2, text: 'Discover indie devs and their profiles on Scoutre', color: 'text-neon-purple' },
              { icon: Star, text: 'Find hidden gems the algorithm buried', color: 'text-neon-gold' },
              { icon: Heart, text: 'Curated picks from the Scoutre community', color: 'text-neon-pink' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`${item.color} flex-shrink-0`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Tier cards */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            <button
              onClick={onNavigateToMembership}
              className="p-4 rounded-xl bg-dark-600/50 border border-gray-400/30 hover:border-gray-400/60 transition-all group text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300 font-display font-bold text-sm">Silver</span>
              </div>
              <p className="text-gray-500 text-xs">20 messages/day</p>
              <p className="text-gray-300 font-semibold text-sm mt-1">$4.99/mo</p>
            </button>

            <button
              onClick={onNavigateToMembership}
              className="p-4 rounded-xl bg-dark-600/50 border border-neon-gold/30 hover:border-neon-gold/60 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neon-gold/20 text-neon-gold">BEST</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-neon-gold" />
                <span className="text-neon-gold font-display font-bold text-sm">Gold</span>
              </div>
              <p className="text-gray-500 text-xs">50 messages/day</p>
              <p className="text-neon-gold font-semibold text-sm mt-1">$9.99/mo</p>
            </button>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onNavigateToMembership}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold text-sm hover:shadow-neon-cyan transition-all duration-300"
            >
              Unlock Scout AI →
            </button>
            <div className="mt-3 p-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30">
              <p className="text-neon-gold text-xs text-center font-medium">
                ⚡ Founder spots available — Gold access at $4.99/month forever!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cap reached screen
  if (isAtCap()) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 pb-4 sm:pb-8 flex flex-col items-center justify-center max-w-4xl mx-auto px-4">
        <div className="w-full max-w-md glass-effect rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-neon-cyan" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">Daily Limit Reached</h2>
          <p className="text-gray-400 text-sm mb-4">
            {userProfile?.membership_tier === 'silver'
              ? "You've used all 20 of your daily Scout messages. Upgrade to Gold for 50 messages a day!"
              : "You've hit your 50 message daily limit. Come back tomorrow — Scout will be ready!"}
          </p>
          {userProfile?.membership_tier === 'silver' && (
            <button
              onClick={onNavigateToMembership}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-gold to-yellow-500 text-dark-900 font-semibold text-sm hover:shadow-neon-gold transition-all"
            >
              Upgrade to Gold →
            </button>
          )}
          <p className="text-gray-600 text-xs mt-4">Resets at midnight</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-4 sm:pb-8 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-4 sm:px-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/30 rounded-full blur-lg animate-pulse" />
              <div className="relative p-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue">
                <Bot className="w-6 h-6 text-dark-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">Scout AI</h1>
                {userProfile?.is_founder && (
                  <span className="px-2 py-0.5 rounded-md bg-neon-gold/20 text-neon-gold text-xs font-bold flex items-center gap-1">
                    ⚡ Founder
                  </span>
                )}
                {userProfile?.membership_tier === 'gold' && !userProfile?.is_founder && (
                  <span className="px-2 py-0.5 rounded-md bg-neon-gold/20 text-neon-gold text-xs font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Gold
                  </span>
                )}
                {userProfile?.membership_tier === 'silver' && (
                  <span className="px-2 py-0.5 rounded-md bg-gray-400/20 text-gray-300 text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Silver
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {remaining} message{remaining !== 1 ? 's' : ''} remaining today
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-lg glass-effect text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
            title="Clear chat"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Message usage bar */}
        <div className="mt-3 h-1 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (messagesUsedToday / cap) * 100)}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 sm:space-y-4 mb-4 pb-24 sm:pb-20">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dark-900" />
            </div>
            <div className="glass-effect rounded-2xl rounded-tl-none px-3 sm:px-4 py-2.5 sm:py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
                <span className="text-gray-400 text-sm">Scouting games for you...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 sm:px-6 mb-4">
          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-effect text-xs sm:text-sm text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all touch-manipulation"
              >
                <suggestion.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{suggestion.text}</span>
                <span className="sm:hidden">{suggestion.text.split(' ').slice(0, 3).join(' ')}...</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 px-3 sm:px-6 pb-safe max-w-4xl mx-auto">
        <div className="glass-effect rounded-2xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What games are you looking for?"
            className="flex-1 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon-cyan transition-all touch-manipulation"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isUser ? 'bg-dark-600' : 'bg-gradient-to-r from-neon-cyan to-neon-blue'}`}>
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
        ) : (
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dark-900" />
        )}
      </div>
      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
            isUser
              ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/30 text-white rounded-tr-none'
              : 'glass-effect text-gray-200 rounded-tl-none'
          }`}
        >
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {message.displayContent || message.content}
          </p>
        </div>

        {message.games && message.games.length > 0 && (
          <div className="mt-2 sm:mt-3 grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
            {message.games.map((game, i) => (
              <GameCard key={i} game={game} />
            ))}
          </div>
        )}

        <p className="text-gray-600 text-xs mt-0.5 sm:mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

interface GameCardProps {
  game: RecommendedGame;
}

function GameCard({ game }: GameCardProps) {
  return (
    <div className="glass-effect rounded-xl overflow-hidden group hover:border-neon-cyan/30 transition-all touch-manipulation">
      <div className="relative aspect-video">
        <img
          src={game.coverUrl || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
        <div className="absolute top-1.5 left-1.5">
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
            game.tag === 'Hidden Gem'
              ? 'bg-neon-purple/90 text-white'
              : game.tag === 'Upcoming'
              ? 'bg-neon-cyan/90 text-dark-900'
              : 'bg-neon-green/90 text-dark-900'
          }`}>
            {game.tag}
          </span>
        </div>
      </div>
      <div className="p-2.5 sm:p-3">
        <h4 className="text-white font-semibold text-xs sm:text-sm mb-0.5 group-hover:text-neon-cyan transition-colors line-clamp-1">
          {game.title}
        </h4>
        <p className="text-gray-500 text-[10px] sm:text-xs mb-1">{game.developer}</p>
        <p className="text-gray-400 text-[10px] sm:text-xs line-clamp-2">{game.description}</p>
        <div className="mt-1.5">
          <span className="px-1.5 py-0.5 rounded bg-dark-600/50 text-gray-400 text-[10px] sm:text-xs">
            {game.genre}
          </span>
        </div>
      </div>
    </div>
  );
}
