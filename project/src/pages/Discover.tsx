import { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Clock, TrendingUp, Star, ExternalLink, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Game } from '../types/database';

type GameFilter = 'all' | 'hidden_gems' | 'upcoming';
type SortBy = 'trending' | 'new' | 'popular';

export function Discover() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<GameFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    let result = [...games];

    if (filter === 'hidden_gems') {
      result = result.filter((g) => g.is_hidden_gem);
    } else if (filter === 'upcoming') {
      result = result.filter((g) => g.is_upcoming);
    }

    if (selectedGenre !== 'all') {
      result = result.filter((g) => g.genre.toLowerCase() === selectedGenre.toLowerCase());
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.developer.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'new':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popular':
          return (b.is_hidden_gem ? 1 : 0) - (a.is_hidden_gem ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredGames(result);
  }, [games, filter, sortBy, searchQuery, selectedGenre]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const genres = ['all', ...new Set(games.map((g) => g.genre))];

  const formatReleaseDate = (date: string | null) => {
    if (!date) return 'TBA';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
          Discover <span className="text-gradient-cyan">Hidden Gems</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Uncover the games everyone is missing. Indie titles, upcoming releases, and community favorites.
        </p>
      </div>

      <div className="glass-effect rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search games, developers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-dark-600/50 border border-dark-500/50 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-dark-600/50 border border-dark-500/50 rounded-lg text-white focus:border-neon-cyan/50 focus:outline-none transition-colors cursor-pointer"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-dark-600/50 border border-dark-500/50 rounded-lg text-white focus:border-neon-cyan/50 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="trending">Trending</option>
              <option value="new">New</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'all', label: 'All Games', icon: Star },
          { id: 'hidden_gems', label: 'Hidden Gems', icon: Sparkles },
          { id: 'upcoming', label: 'Upcoming', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as GameFilter)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex-shrink-0 touch-manipulation ${
              filter === tab.id
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'bg-dark-600/50 text-gray-400 hover:text-white hover:bg-dark-500/50 border border-dark-500/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-neon-cyan/30 rounded-full animate-spin border-t-neon-cyan" />
          </div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
          <p className="text-gray-400">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onSelect={() => setSelectedGame(game)} />
          ))}
        </div>
      )}

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} formatDate={formatReleaseDate} />
      )}
    </div>
  );
}

interface GameCardProps {
  game: Game;
  onSelect: () => void;
}

function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <article className="group relative rounded-xl overflow-hidden glass-effect hover:border-neon-cyan/30 transition-all duration-300 cursor-pointer touch-manipulation" onClick={onSelect}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.cover_image_url || `https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800`}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1 sm:gap-2">
          {game.is_hidden_gem && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-neon-purple/90 text-white text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Hidden Gem</span>
              <span className="sm:hidden">Gem</span>
            </span>
          )}
          {game.is_upcoming && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-neon-cyan/90 text-dark-900 text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">New</span>
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-dark-800/80 text-gray-300 text-[10px] sm:text-xs font-medium backdrop-blur-sm">
            {game.genre}
          </span>
        </div>
      </div>

      <div className="p-2.5 sm:p-4">
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-0.5 sm:mb-1 group-hover:text-neon-cyan transition-colors line-clamp-1">
          {game.title}
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-1">{game.developer}</p>
        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 hidden sm:block">{game.description}</p>

        {game.is_upcoming && game.release_date && (
          <div className="flex items-center gap-2 text-neon-cyan text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(game.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </article>
  );
}

interface GameModalProps {
  game: Game;
  onClose: () => void;
  formatDate: (date: string | null) => string;
}

function GameModal({ game, onClose, formatDate }: GameModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-effect rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full glass-effect text-white hover:text-neon-pink transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative aspect-video">
          <img
            src={game.cover_image_url || `https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1200`}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-transparent to-dark-900/50" />

          <div className="absolute top-4 left-4 flex gap-2">
            {game.is_hidden_gem && (
              <span className="px-3 py-1.5 rounded-lg bg-neon-purple/90 text-white text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                Hidden Gem
              </span>
            )}
            {game.is_upcoming && (
              <span className="px-3 py-1.5 rounded-lg bg-neon-cyan/90 text-dark-900 text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <Clock className="w-4 h-4" />
                Upcoming
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">{game.title}</h2>
              <p className="text-gray-400 text-base">{game.developer}</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-dark-600/50 border border-dark-500/50 text-gray-300 text-sm font-medium">
              {game.genre}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="glass-effect rounded-lg p-3 text-center">
              <Calendar className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
              <p className="text-white text-sm font-semibold">{formatDate(game.release_date)}</p>
              <p className="text-gray-500 text-xs">Release</p>
            </div>
            <div className="glass-effect rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-neon-green mx-auto mb-1" />
              <p className="text-white text-sm font-semibold">4.8</p>
              <p className="text-gray-500 text-xs">Rating</p>
            </div>
            <div className="glass-effect rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-neon-purple mx-auto mb-1" />
              <p className="text-white text-sm font-semibold">12.4K</p>
              <p className="text-gray-500 text-xs">Wishlisted</p>
            </div>
            <div className="glass-effect rounded-lg p-3 text-center">
              <Star className="w-5 h-5 text-neon-gold mx-auto mb-1" />
              <p className="text-white text-sm font-semibold">847</p>
              <p className="text-gray-500 text-xs">Reviews</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">About</h3>
            <p className="text-gray-300 leading-relaxed">{game.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {game.steam_url && (
              <a
                href={game.steam_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neon-cyan text-dark-900 font-semibold text-sm hover:shadow-neon-cyan transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View on Steam
              </a>
            )}
            {game.website_url && (
              <a
                href={game.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg glass-effect text-white font-semibold text-sm hover:border-neon-cyan/50 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Official Website
              </a>
            )}
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neon-purple text-white font-semibold text-sm hover:shadow-neon-purple transition-all">
              <TrendingUp className="w-4 h-4" />
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
