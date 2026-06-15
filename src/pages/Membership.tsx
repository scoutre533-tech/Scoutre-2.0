import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Star, Shield, Users, Award, BadgeCheck, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { MembershipTier } from '../types/database';
import { supabase } from '../lib/supabase';

interface MembershipProps {
  user: User | null;
}

interface Tier {
  id: MembershipTier;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: { text: string; highlight?: boolean }[];
  color: string;
  popular?: boolean;
  msgCap?: string;
}

const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Scout',
    price: 0,
    duration: 'Free forever',
    description: 'Start your journey discovering hidden gems and upcoming games.',
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Browse all games and reels' },
      { text: 'Like and save content' },
      { text: 'Join community discussions' },
      { text: 'Basic forum access' },
      { text: 'Weekly newsletter' },
      { text: 'Basic Scout AI (keyword only)' },
    ],
  },
  {
    id: 'silver',
    name: 'Silver Scout',
    price: 4.99,
    duration: 'per month',
    description: 'Unlock the full Scout AI and support indie game discovery.',
    color: 'from-gray-300 to-gray-400',
    msgCap: '20 AI messages/day',
    features: [
      { text: 'Everything in Scout' },
      { text: 'Ad-free experience' },
      { text: 'Full Scout AI access', highlight: true },
      { text: '20 Scout AI messages per day', highlight: true },
      { text: 'Silver badge on profile' },
      { text: 'Priority game recommendations' },
      { text: 'Weekly curated game picks' },
      { text: 'Exclusive Discord channel' },
    ],
  },
  {
    id: 'gold',
    name: 'Gold Elite',
    price: 9.99,
    duration: 'per month',
    description: 'The ultimate experience for dedicated scouts and content creators.',
    color: 'from-yellow-400 to-yellow-600',
    popular: true,
    msgCap: '50 AI messages/day',
    features: [
      { text: 'Everything in Silver Scout' },
      { text: 'Full Scout AI access', highlight: true },
      { text: '50 Scout AI messages per day', highlight: true },
      { text: 'Verified Gold badge', highlight: true },
      { text: 'Creator spotlight opportunities', highlight: true },
      { text: 'Monthly dev Q&A sessions', highlight: true },
      { text: 'Custom profile frame' },
      { text: 'Upload unlimited reels' },
      { text: 'Analytics dashboard' },
      { text: 'Early game key giveaways' },
      { text: 'Featured content placement' },
      { text: 'Direct feedback line to devs' },
    ],
  },
];

export function Membership({ user }: MembershipProps) {
  const [currentTier, setCurrentTier] = useState<MembershipTier>('free');
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [founderSpotsLeft, setFounderSpotsLeft] = useState<number>(25);
  const [isFounder, setIsFounder] = useState(false);
  const [loadingSpots, setLoadingSpots] = useState(true);

  useEffect(() => {
    fetchFounderSpots();
    if (user) fetchUserTier();
  }, [user]);

  const fetchFounderSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('founder_spots')
        .select('spots_claimed, max_spots')
        .eq('id', 1)
        .single();
      if (error) throw error;
      if (data) setFounderSpotsLeft(data.max_spots - data.spots_claimed);
    } catch {
      setFounderSpotsLeft(25);
    } finally {
      setLoadingSpots(false);
    }
  };

  const fetchUserTier = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_tier, is_founder')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      if (data) {
        setCurrentTier(data.membership_tier as MembershipTier);
        setIsFounder(data.is_founder || false);
      }
    } catch {
      console.error('Error fetching user tier');
    }
  };

  const handleSelectPlan = (tier: Tier) => {
    if (tier.id === 'free' || tier.id === currentTier) return;
    setSelectedTier(tier);
  };

  const getDiscountedPrice = (price: number) => {
    return isAnnual ? price * 0.8 : price;
  };

  const spotsPercentage = (founderSpotsLeft / 25) * 100;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Founders Banner */}
      {founderSpotsLeft > 0 && !isFounder && (
        <div className="mb-8 relative overflow-hidden rounded-2xl border border-neon-gold/50 bg-gradient-to-r from-neon-gold/10 via-yellow-500/5 to-neon-gold/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-gold/5 to-transparent animate-pulse" />
          <div className="relative p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neon-gold/20 flex-shrink-0">
                  <Crown className="w-6 h-6 text-neon-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-neon-gold font-display font-bold text-lg">Founder's Deal</h3>
                    <span className="px-2 py-0.5 rounded-full bg-neon-gold/20 text-neon-gold text-xs font-bold">
                      {loadingSpots ? '...' : founderSpotsLeft} spots left
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Be one of the first 25 members. Get <span className="text-neon-gold font-semibold">Gold Elite access at $4.99/month — forever.</span> This deal disappears when the spots are gone.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 max-w-[200px] h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-gold to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${spotsPercentage}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs">{25 - founderSpotsLeft}/25 claimed</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  alert('Stripe integration coming soon! Founder pricing will be locked in at $4.99/month forever.');
                }}
                className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-gold to-yellow-500 text-dark-900 font-bold text-sm hover:shadow-neon-gold transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Claim Founder Spot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already a founder banner */}
      {isFounder && (
        <div className="mb-8 p-4 rounded-2xl border border-neon-gold/50 bg-neon-gold/10 flex items-center gap-3">
          <Crown className="w-6 h-6 text-neon-gold flex-shrink-0" />
          <div>
            <p className="text-neon-gold font-bold">You're a Founding Member! ⚡</p>
            <p className="text-gray-400 text-sm">You have Gold Elite access at $4.99/month forever. Thank you for believing in Scoutre from day one.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6">
          <Crown className="w-4 h-4 text-neon-gold" />
          <span className="text-sm text-gray-300">Unlock Premium Features</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">
          Choose Your <span className="text-gradient-gold">Hunt</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
          Support indie game discovery and unlock exclusive features. Every subscription helps smaller developers get discovered.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="glass-effect rounded-full p-1 flex items-center">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !isAnnual ? 'bg-neon-cyan text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              isAnnual ? 'bg-neon-cyan text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-neon-green text-xs font-semibold">-20%</span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isCurrent={tier.id === currentTier}
            isAnnual={isAnnual}
            discountedPrice={getDiscountedPrice(tier.price)}
            onSelect={() => handleSelectPlan(tier)}
          />
        ))}
      </div>

      {/* Why Premium */}
      <div className="glass-effect rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-display font-bold text-white mb-6 text-center">
          Why Go <span className="text-gradient-cyan">Premium</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Support Indie Devs', desc: 'Your subscription directly helps fund hidden gem discoveries' },
            { icon: Zap, title: 'Scout AI Access', desc: 'Get personalized game recommendations from our advanced AI' },
            { icon: Users, title: 'Exclusive Community', desc: 'Join premium-only discussions and events' },
            { icon: Award, title: 'Stand Out', desc: 'Show your dedication with premium badges and frames' },
          ].map((item, i) => (
            <div key={i} className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-neon-cyan" />
              </div>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm mb-2">
          Questions? <a href="#" className="text-neon-cyan hover:underline">Contact Support</a>
        </p>
        <p className="text-gray-600 text-xs">
          Cancel anytime. No hidden fees. Secure payment via Stripe.
        </p>
      </div>

      {selectedTier && (
        <CheckoutModal
          tier={selectedTier}
          isAnnual={isAnnual}
          onClose={() => setSelectedTier(null)}
        />
      )}
    </div>
  );
}

interface TierCardProps {
  tier: Tier;
  isCurrent: boolean;
  isAnnual: boolean;
  discountedPrice: number;
  onSelect: () => void;
}

function TierCard({ tier, isCurrent, isAnnual, discountedPrice, onSelect }: TierCardProps) {
  const isPopular = tier.popular;
  const borderColor = isPopular
    ? 'border-neon-gold/50'
    : tier.id === 'silver'
    ? 'border-gray-400/50'
    : 'border-dark-500/50';

  return (
    <div className={`relative rounded-2xl glass-effect ${borderColor} transition-all duration-300 hover:scale-[1.02] ${isPopular ? 'md:-mt-4 md:mb-4' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-dark-900 text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${tier.color}`}>
              {tier.id === 'gold' ? (
                <Crown className="w-6 h-6 text-dark-900" />
              ) : tier.id === 'silver' ? (
                <Shield className="w-6 h-6 text-dark-900" />
              ) : (
                <Star className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">{tier.name}</h3>
              {isCurrent && (
                <span className="text-neon-green text-xs font-medium flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Current Plan
                </span>
              )}
            </div>
          </div>
        </div>

        {tier.msgCap && (
          <div className="mb-4 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 inline-flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-neon-cyan" />
            <span className="text-neon-cyan text-xs font-medium">{tier.msgCap}</span>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-white">
              ${discountedPrice.toFixed(2)}
            </span>
            {isAnnual && tier.price > 0 && (
              <span className="text-gray-500 text-sm line-through ml-2">${tier.price}</span>
            )}
          </div>
          <span className="text-gray-400 text-sm">
            {tier.price === 0 ? '' : isAnnual ? '/month, billed yearly' : `/${tier.duration}`}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

        <button
          onClick={onSelect}
          disabled={isCurrent}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
            isCurrent
              ? 'bg-dark-600 text-gray-500 cursor-not-allowed'
              : isPopular
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-dark-900 hover:shadow-neon-gold'
              : tier.id === 'silver'
              ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-dark-900 hover:opacity-90'
              : 'bg-dark-600 text-white hover:bg-dark-500 border border-dark-500/50'
          }`}
        >
          {isCurrent ? 'Current Plan' : tier.price === 0 ? 'Current Plan' : 'Get Started'}
        </button>

        <div className="mt-6 space-y-3">
          {tier.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-neon-cyan' : 'text-gray-500'}`}>
                <Check className="w-4 h-4" />
              </div>
              <span className={`text-sm ${feature.highlight ? 'text-white font-medium' : 'text-gray-300'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CheckoutModalProps {
  tier: Tier;
  isAnnual: boolean;
  onClose: () => void;
}

function CheckoutModal({ tier, isAnnual, onClose }: CheckoutModalProps) {
  const price = isAnnual ? tier.price * 0.8 * 12 : tier.price;
  const savings = isAnnual ? (tier.price * 12 - price).toFixed(2) : '0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md glass-effect rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 bg-gradient-to-r ${tier.color}`}>
          <div className="flex items-center gap-3 mb-2">
            {tier.id === 'gold' ? (
              <Crown className="w-8 h-8 text-dark-900" />
            ) : (
              <Shield className="w-8 h-8 text-dark-900" />
            )}
            <h2 className="text-2xl font-display font-bold text-dark-900">{tier.name}</h2>
          </div>
          <p className="text-dark-800 text-sm">{tier.description}</p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-dark-500/50">
            <span className="text-gray-400">Plan</span>
            <span className="text-white font-medium">
              {tier.name} ({isAnnual ? 'Yearly' : 'Monthly'})
            </span>
          </div>

          {isAnnual && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Annual discount</span>
              <span className="text-neon-green font-medium">-${savings}</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 pt-4 border-t border-dark-500/50">
            <span className="text-gray-400">Total</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">${price.toFixed(2)}</span>
              <span className="text-gray-400 text-sm block">
                {isAnnual ? 'billed annually' : 'billed monthly'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              alert('Stripe integration coming soon! Payment processing will be available at launch.');
            }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold text-base hover:shadow-neon-cyan transition-all mb-3"
          >
            Continue to Checkout
          </button>

          <p className="text-gray-500 text-xs text-center">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
