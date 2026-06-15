import { useState, useEffect } from 'react';
import { Feed } from './pages/Feed';
import { Discover } from './pages/Discover';
import { Membership } from './pages/Membership';
import { Community } from './pages/Community';
import { Scout } from './pages/Scout';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

type Page = 'feed' | 'discover' | 'membership' | 'community' | 'scout';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-neon-cyan/30 rounded-full animate-spin border-t-neon-cyan" />
          <div
            className="absolute inset-0 w-16 h-16 border-2 border-neon-purple/30 rounded-full animate-spin border-t-neon-purple"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'feed':
        return <Feed user={user} />;
      case 'discover':
        return <Discover />;
      case 'membership':
        return <Membership user={user} />;
      case 'community':
        return <Community user={user} />;
      case 'scout':
        return (
          <Scout
            user={user}
            onNavigateToMembership={() => setCurrentPage('membership')}
          />
        );
      default:
        return <Feed user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 cyber-grid-bg">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onSignInClick={() => setShowAuthModal(true)}
      />
      <main className="pb-20">
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}

function BottomNav({
  currentPage,
  setCurrentPage,
}: {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}) {
  const navItems: { id: Page; label: string; icon: JSX.Element }[] = [
    {
      id: 'feed',
      label: 'Feed',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 'membership',
      label: 'Premium',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      id: 'community',
      label: 'Community',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
    {
      id: 'scout',
      label: 'Scout',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-dark-500/50 sm:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300 ${
              currentPage === item.id
                ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default App;
