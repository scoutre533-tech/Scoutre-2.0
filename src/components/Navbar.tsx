import { useState, useEffect } from 'react';
import { Compass, Menu, X, User, LogOut } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Page = 'feed' | 'discover' | 'membership' | 'community' | 'scout';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: SupabaseUser | null;
  onSignInClick: () => void;
}

export function Navbar({ currentPage, setCurrentPage, user, onSignInClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const navItems: { id: Page; label: string }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'discover', label: 'Discover' },
    { id: 'scout', label: 'Scout AI' },
    { id: 'membership', label: 'Premium' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('feed')}
            className="flex items-center gap-2 group"
          >
            <div className="relative p-2">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-lg opacity-50 blur-sm group-hover:opacity-75 transition-opacity" />
              <Compass className="w-6 h-6 text-neon-cyan relative z-10" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-gradient-cyan">
              SCOUTRE
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === item.id
                    ? 'text-neon-cyan neon-border-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-600/50 border border-dark-500/50 hover:border-neon-cyan/30 transition-all">
                  <User className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm text-gray-300 max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-neon-pink hover:bg-dark-600/50 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold text-sm hover:shadow-neon-cyan transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600/50 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-effect border-t border-dark-500/50">
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'text-neon-cyan bg-neon-cyan/10'
                    : 'text-gray-300 hover:text-white hover:bg-dark-600/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-dark-500/50">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-gray-400 text-sm truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-neon-pink hover:bg-dark-600/50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignInClick();
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold text-sm"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
