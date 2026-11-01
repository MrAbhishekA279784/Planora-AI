import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Heart,
  Palette,
  Store,
  Clock,
  ShieldCheck,
  Star,
  Users,
  ChevronRight,
  TrendingDown,
  Gift,
  Building,
  Check,
  Compass,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AppRoute, EventItem, ThemeItem, VendorItem } from '../../types';
import { formatINR } from '../../utils/calculations';
import { useAuth } from '../../context/AuthContext';

interface LandingPageViewProps {
  onNavigate: (route: AppRoute) => void;
  onSelectTheme?: (theme: ThemeItem) => void;
  onSelectVendor?: (vendor: VendorItem) => void;
  isAuthenticated: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  isAuthenticated,
}) => {
  const { getIdToken } = useAuth();

  // Real review summary & submission state
  const [ratingSummary, setRatingSummary] = useState<{
    rawAverage: number;
    reviewCount: number;
    bayesianRating: number;
  } | null>(null);
  const [recentReviews, setRecentReviews] = useState<
    Array<{ id: string; authorName: string; rating: number; reviewText: string; createdAt: string }>
  >([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userReviewText, setUserReviewText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch live reviews and summary
  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        const [sumRes, recRes] = await Promise.all([
          fetch('/api/reviews/summary'),
          fetch('/api/reviews/recent'),
        ]);
        if (sumRes.ok && sumRes.headers.get('content-type')?.includes('application/json')) {
          const sumData = await sumRes.json();
          if (sumData.success && sumData.summary) {
            setRatingSummary(sumData.summary);
          }
        }
        if (recRes.ok && recRes.headers.get('content-type')?.includes('application/json')) {
          const recData = await recRes.json();
          if (recData.success && Array.isArray(recData.reviews)) {
            setRecentReviews(recData.reviews);
          }
        }
      } catch (err) {
        console.warn('Reviews fetch notice:', err);
      }
    };
    fetchReviewsData();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    setReviewError(null);
    setReviewSuccess(null);
    setIsSubmittingReview(true);

    try {
      const token = await getIdToken();
      const res = await fetch('/api/reviews/platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating: userRating,
          reviewText: userReviewText.trim(),
        }),
      });

      let data: any = null;
      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data?.success) {
        setReviewSuccess('Thank you for rating Planora AI! Your review has been saved.');
        if (data.summary) {
          setRatingSummary(data.summary);
        }
        setUserReviewText('');
        // Refetch latest reviews
        const recRes = await fetch('/api/reviews/recent');
        if (recRes.ok && recRes.headers.get('content-type')?.includes('application/json')) {
          const recData = await recRes.json();
          if (recData.reviews) setRecentReviews(recData.reviews);
        }
      } else {
        setReviewError(data?.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Scene 2 celebration tabs
  const [activeCelebration, setActiveCelebration] = useState<'wedding' | 'birthday' | 'community'>('wedding');

  // Scene 3 AI simulation interactive stage
  const [aiStage, setAiStage] = useState<number>(3); // 1 = prompt, 2 = parsing, 3 = structured plan

  // Scene 4 budget active category hover
  const [hoveredBudgetCat, setHoveredBudgetCat] = useState<string | null>('venue');

  // Scene 5 theme carousel index
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);

  // Scene 6 vendor category filter
  const [vendorCategory, setVendorCategory] = useState<'All' | 'Venue' | 'Catering' | 'Decoration' | 'Photography'>('All');

  // Scene 7 timeline active milestone
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(1);

  const themesData = [
    {
      id: 'beachside-elegant',
      name: 'Beachside Elegant',
      category: 'Wedding',
      description: 'Serene coastal vibes with pastel tones, rustic wooden arches, and candlelit seaside dining.',
      budget: '₹6 – 12 Lakh',
      guests: '100 – 500',
      palette: ['#E7CBA9', '#F4DDD4', '#B58D76', '#87A0B2'],
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      elements: ['Mandap on Beach', 'Fairy Light Canopies', 'Sea Shell Placecards', 'Pastel Florals'],
    },
    {
      id: 'royal-traditional',
      name: 'Royal Traditional',
      category: 'Wedding & Sangeet',
      description: 'Opulent palace aesthetics with marigold garlands, brass urns, and majestic regal pillars.',
      budget: '₹15 – 35 Lakh',
      guests: '300 – 1,200',
      palette: ['#C98A2C', '#7B181B', '#F9E7B4', '#1E3A2F'],
      image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80',
      elements: ['Carved Mandap', 'Brass Diya Lighting', 'Mogra Chandeliers', 'Velvet Seating'],
    },
    {
      id: 'minimal-modern',
      name: 'Minimal & Modern',
      category: 'Contemporary Reception',
      description: 'Monochromatic white floral arches, geometric brass frames, and crisp modern typography.',
      budget: '₹5 – 10 Lakh',
      guests: '80 – 350',
      palette: ['#F5F5F0', '#2C2B2A', '#D4AF37', '#8A9A86'],
      image: 'https://images.unsplash.com/photo-1519225425642-1e9a7e04f4ec?auto=format&fit=crop&w=1200&q=80',
      elements: ['Geometric Stage', 'Clear Ghost Chairs', 'Statement Greenery', 'Warm Edison Bulbs'],
    },
    {
      id: 'boho-garden',
      name: 'Boho Garden',
      category: 'Birthday & Anniversary',
      description: 'Lush botanical lawns with pampas grass, macrame backdrops, and relaxed low lounge seating.',
      budget: '₹3 – 7 Lakh',
      guests: '50 – 200',
      palette: ['#D2B48C', '#9CAF88', '#C47B56', '#FAF0E6'],
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      elements: ['Macrame Backdrops', 'Rattan Lounge Pods', 'Eucalyptus Runners', 'Acoustic Stage'],
    },
    {
      id: 'vintage-romance',
      name: 'Vintage Romance',
      category: 'Cocktail & Evening',
      description: 'Candlelit long banquet tables, heirloom crystal glassware, and antique dusty rose blooms.',
      budget: '₹7 – 14 Lakh',
      guests: '100 – 400',
      palette: ['#D8A47F', '#A36B4F', '#4A2C1B', '#E8D3C3'],
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      elements: ['Taper Candle Candelabras', 'Dusty Rose Silk', 'Calligraphy Menus', 'Warm String Arches'],
    },
  ];

  const budgetBreakdown = [
    { key: 'venue', name: 'Venue & Stay', amount: 300000, percentage: 37, color: '#7A3D19', icon: Building, tip: 'Booking 6+ months in advance secures prime beach lawns at up to 15% lower rates.' },
    { key: 'catering', name: 'Gourmet Catering', amount: 150000, percentage: 19, color: '#B86B2A', icon: Gift, tip: 'Live buffet counters with local coastal delicacies optimize cost per plate without compromising luxury.' },
    { key: 'decoration', name: 'Thematic Decor', amount: 120000, percentage: 15, color: '#D7A34B', icon: Palette, tip: 'Using seasonal local florals and modular fairy light installations saves ₹25,000 in transit.' },
    { key: 'photography', name: 'Cinematic Photography', amount: 80000, percentage: 10, color: '#4A2C1B', icon: Star, tip: 'Full day candid photo + 4K drone highlights bundle includes complimentary pre-wedding teaser.' },
    { key: 'entertainment', name: 'DJ & Sound Production', amount: 50000, percentage: 6, color: '#8A5A36', icon: Sparkles, tip: 'Acoustic sunset trio followed by live DJ setup utilizes unified sound engineering.' },
    { key: 'styling', name: 'Bridal & Groom Styling', amount: 40000, percentage: 5, color: '#A36B4F', icon: Heart, tip: 'Includes hair, makeup, draping, and on-site touchup artist across all 3 key events.' },
    { key: 'contingency', name: 'Safety Contingency', amount: 60000, percentage: 8, color: '#6D6A66', icon: ShieldCheck, tip: 'Dedicated buffer reserve automatically reallocated for guest transit and weather provisions.' },
  ];

  const sampleVendors = [
    {
      id: 'v1',
      name: 'Taj Resort & Coastal Lawn',
      category: 'Venue',
      location: 'Candolim, Goa',
      rating: 4.8,
      reviews: 320,
      price: '₹2.5L – ₹6.0L',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      badge: 'Popular',
      verified: true,
      features: ['Beachfront Lawn', '500+ Guests', 'In-house Valet', 'Sea Facing Stage'],
    },
    {
      id: 'v2',
      name: 'SpiceCraft Royal Caterers',
      category: 'Catering',
      location: 'Panaji, Goa',
      rating: 4.9,
      reviews: 210,
      price: '₹800 – ₹1,500 / plate',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      badge: 'Top Rated',
      verified: true,
      features: ['Live Tandoor & Grill', 'Custom Mocktail Bar', 'Multi-Cuisine', 'Tasting Included'],
    },
    {
      id: 'v3',
      name: 'Blush & Bloom Bespoke Decor',
      category: 'Decoration',
      location: 'Calangute, Goa',
      rating: 4.7,
      reviews: 180,
      price: '₹80,000 – ₹2.5L',
      image: 'https://images.unsplash.com/photo-1519225425642-1e9a7e04f4ec?auto=format&fit=crop&w=800&q=80',
      badge: 'Trending',
      verified: true,
      features: ['Imported Florals', 'Fairy Light Arches', 'Mandap Structuring', 'Eco-friendly Options'],
    },
    {
      id: 'v4',
      name: 'Moments Studio & Filmworks',
      category: 'Photography',
      location: 'Mapusa, Goa',
      rating: 4.8,
      reviews: 410,
      price: '₹50,000 – ₹1.2L',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
      badge: 'Popular',
      verified: true,
      features: ['4K Drone Coverage', 'Same-day Teaser', 'Traditional & Candid', 'Leather Photo Album'],
    },
  ];

  const milestones = [
    {
      stage: '6 Months Before',
      title: 'Vision & Venue Confirmation',
      status: 'Completed',
      desc: 'Selected Goa seaside venue, locked booking deposit, and initialized ₹8L budget architecture.',
      date: '12 Aug 2025',
    },
    {
      stage: '4 Months Before',
      title: 'Theme & Aesthetic Finalization',
      status: 'In Progress',
      desc: 'Selected Beachside Elegant palette, approved 3D mandap sketch, and booked Blush & Bloom Decor.',
      date: '20 Sep 2025',
    },
    {
      stage: '3 Months Before',
      title: 'Catering Tasting & Menu Lock',
      status: 'Upcoming',
      desc: 'Scheduled tasting session with SpiceCraft Catering for 300 guests across 4 meal courses.',
      date: '05 Oct 2025',
    },
    {
      stage: '2 Months Before',
      title: 'Digital Invitations & RSVP Tracker',
      status: 'Upcoming',
      desc: 'Dispatched interactive WhatsApp & email invites with real-time dietary RSVP tracking.',
      date: '15 Nov 2025',
    },
    {
      stage: '1 Week Before',
      title: 'Final Rehearsal & Vendor Sync',
      status: 'Upcoming',
      desc: 'Synchronized sound check, power backups, and guest transport logistics.',
      date: '10 Feb 2026',
    },
    {
      stage: 'Event Day',
      title: 'The Celebration Begins!',
      status: 'Upcoming',
      desc: 'Live on-site coordinator timeline, real-time schedule notifications, and memory captures.',
      date: '15 Feb 2026',
    },
  ];

  const currentTheme = themesData[activeThemeIndex];

  return (
    <div className="w-full space-y-24 md:space-y-36 pb-12 overflow-hidden">
      {/* ========================================================
          SCENE 1: THE FIRST IMPRESSION (IMMERSIVE 3D HERO)
          ======================================================== */}
      <section className="relative pt-6 sm:pt-12 pb-16">
        {/* Soft background ambient lights for glass backdrop */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[450px] bg-gradient-to-tr from-[#FBE8D3]/70 via-[#F5E7D3]/40 to-[#EDE2D3]/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto px-4">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EDE1] border border-[#E2CFB8] text-[#7A3D19] text-xs font-semibold tracking-wider uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B86B2A]" />
            <span>Turn Moments Into Memories</span>
          </div>

          {/* Editorial Serif Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#171412] leading-[1.1]">
            Your next <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#7A3D19] relative">
              unforgettable
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#B86B2A]/30 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>{' '}
            event.
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-[#6D6A66] max-w-2xl mx-auto leading-relaxed">
            Plan weddings, birthdays, and community gatherings with the power of Planora AI — personalized ideas, budgets, timelines, and verified vendors.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'create-event' : 'signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-[#FBF7EF] font-semibold text-base shadow-lg shadow-[#7A3D19]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Create Your Event' : 'Start Planning Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('scene-celebrations');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#171412] border border-[#EDE2D3] font-medium text-base shadow-xs hover:border-[#D7A34B] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#B86B2A]" />
              <span>Explore the Experience</span>
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-[#6D6A66] pt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full ring-2 ring-[#FBF7EF] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Planner" />
                <img className="w-7 h-7 rounded-full ring-2 ring-[#FBF7EF] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Planner" />
                <img className="w-7 h-7 rounded-full ring-2 ring-[#FBF7EF] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Planner" />
              </div>
              <span className="font-semibold text-[#171412]">10,000+ Happy Planners</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex text-[#D7A34B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      ratingSummary && ratingSummary.rawAverage >= star
                        ? 'text-[#D7A34B]'
                        : ratingSummary && ratingSummary.rawAverage >= star - 0.5
                        ? 'text-[#D7A34B]/70'
                        : 'text-[#EDE2D3]'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="font-semibold text-[#171412]">
                {ratingSummary && ratingSummary.reviewCount > 0
                  ? `${ratingSummary.rawAverage.toFixed(1)}/5 (${ratingSummary.reviewCount} ${
                      ratingSummary.reviewCount === 1 ? 'Review' : 'Reviews'
                    })`
                  : 'Be the first to review'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[#7A3D19] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#B86B2A]" />
              <span>Real Verified Planners</span>
            </div>
          </div>
        </div>

        {/* 3D PERSPECTIVE INTERACTIVE SHOWCASE CARDS */}
        <div className="mt-14 max-w-6xl mx-auto px-4 perspective-1200">
          <div className="relative h-[380px] sm:h-[460px] md:h-[520px] flex items-center justify-center preserve-3d">
            {/* Left Card: Birthdays (Tilted back-left in 3D) */}
            <div
              className="absolute left-2 sm:left-12 md:left-20 w-[240px] sm:w-[300px] md:w-[340px] h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer hover:scale-105 hover:z-30 border border-white/60 bg-white"
              style={{
                transform: 'rotateY(16deg) rotateX(4deg) translateZ(-40px)',
              }}
              onClick={() => {
                setActiveCelebration('birthday');
                document.getElementById('scene-celebrations')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80"
                alt="Colorful Birthday Celebration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FBE8D3]">Birthday • 02/03</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1">Colorful Birthdays</h3>
                <p className="text-xs text-white/80 line-clamp-1 mt-0.5">Fun themes for unforgettable moments</p>
              </div>
            </div>

            {/* Right Card: Community (Tilted back-right in 3D) */}
            <div
              className="absolute right-2 sm:right-12 md:right-20 w-[240px] sm:w-[300px] md:w-[340px] h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer hover:scale-105 hover:z-30 border border-white/60 bg-white"
              style={{
                transform: 'rotateY(-16deg) rotateX(4deg) translateZ(-40px)',
              }}
              onClick={() => {
                setActiveCelebration('community');
                document.getElementById('scene-celebrations')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
                alt="Community Gathering"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FBE8D3]">Community • 03/03</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1">Stronger Together</h3>
                <p className="text-xs text-white/80 line-clamp-1 mt-0.5">Festivals and reunions bringing people closer</p>
              </div>
            </div>

            {/* Center Primary Card: Beach Wedding (Front and Center with high elevation) */}
            <div
              className="relative z-20 w-[280px] sm:w-[360px] md:w-[420px] h-[350px] sm:h-[440px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 transition-all duration-500 ease-out hover:scale-[1.03] bg-white"
              style={{
                transform: 'translateZ(60px)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                alt="Seaside Wedding"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#7A3D19] backdrop-blur-md shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B86B2A] animate-pulse" />
                  Wedding • 01/03
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">Seaside Wedding</h3>
                <p className="text-xs sm:text-sm text-white/85 mt-1">
                  Love stories deserve extraordinary settings. 300 guests in Goa with curated mandap, sunset dinner, and acoustic band.
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20">
                  <div className="text-xs">
                    <span className="text-white/60">Estimated Budget</span>
                    <div className="font-bold text-[#FBE8D3] text-sm">₹8,00,000</div>
                  </div>
                  <button
                    onClick={() => onNavigate(isAuthenticated ? 'home' : 'signup')}
                    className="px-3.5 py-1.5 rounded-full bg-white text-[#7A3D19] text-xs font-bold hover:bg-[#FBE8D3] transition-colors"
                  >
                    View Plan →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 2: CHOOSE YOUR CELEBRATION (3D EVENT CARDS)
          ======================================================== */}
      <section id="scene-celebrations" className="max-w-6xl mx-auto px-4 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold tracking-widest text-[#B86B2A] uppercase mb-2">Celebration Types</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#171412]">
            Crafted for Every Milestone
          </h2>
          <p className="text-sm sm:text-base text-[#6D6A66] mt-3">
            Every celebration has its own cadence. Planora AI shapes its intelligence around the exact emotional tone of your event.
          </p>

          {/* Category Tabs */}
          <div className="mt-6 inline-flex p-1.5 rounded-full bg-[#F5EDE1] border border-[#E2CFB8]">
            <button
              onClick={() => setActiveCelebration('wedding')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCelebration === 'wedding'
                  ? 'bg-[#7A3D19] text-[#FBF7EF] shadow-xs'
                  : 'text-[#6D6A66] hover:text-[#171412]'
              }`}
            >
              💍 Weddings
            </button>
            <button
              onClick={() => setActiveCelebration('birthday')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCelebration === 'birthday'
                  ? 'bg-[#7A3D19] text-[#FBF7EF] shadow-xs'
                  : 'text-[#6D6A66] hover:text-[#171412]'
              }`}
            >
              🎂 Birthdays
            </button>
            <button
              onClick={() => setActiveCelebration('community')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCelebration === 'community'
                  ? 'bg-[#7A3D19] text-[#FBF7EF] shadow-xs'
                  : 'text-[#6D6A66] hover:text-[#171412]'
              }`}
            >
              👥 Community Events
            </button>
          </div>
        </div>

        {/* 3 Interactive Category Deep-Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Weddings Card */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border ${
              activeCelebration === 'wedding'
                ? 'bg-[#FFFCF6] border-[#B86B2A] shadow-xl scale-[1.02]'
                : 'bg-[#FFFCF6]/80 border-[#EDE2D3] hover:border-[#D7A34B] opacity-90'
            }`}
          >
            <div className="h-48 rounded-2xl overflow-hidden relative mb-5">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80"
                alt="Weddings"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#7A3D19] text-[11px] font-bold px-2.5 py-1 rounded-full">
                Grand & Intimate
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#171412]">Weddings</h3>
            <p className="text-xs text-[#7A3D19] font-medium mt-1">Elegant • Romantic • Timeless</p>
            <p className="text-xs text-[#6D6A66] mt-3 leading-relaxed">
              From sangeet choreography to beachfront mandap design, manage multi-day guest schedules, multi-cuisine tastings, and custom decor palettes.
            </p>
            <div className="mt-5 space-y-2 pt-4 border-t border-[#EDE2D3] text-xs text-[#171412]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Multi-day ceremony timeline manager</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Guest dietary & RSVP tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Venue & Mandap spatial seating 3D plans</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate(isAuthenticated ? 'create-event' : 'signup')}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#F8F0E4] hover:bg-[#7A3D19] text-[#7A3D19] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Plan a Wedding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Birthdays Card */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border ${
              activeCelebration === 'birthday'
                ? 'bg-[#FFFCF6] border-[#B86B2A] shadow-xl scale-[1.02]'
                : 'bg-[#FFFCF6]/80 border-[#EDE2D3] hover:border-[#D7A34B] opacity-90'
            }`}
          >
            <div className="h-48 rounded-2xl overflow-hidden relative mb-5">
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=700&q=80"
                alt="Birthdays"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#7A3D19] text-[11px] font-bold px-2.5 py-1 rounded-full">
                Ages 1 to 100
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#171412]">Birthdays</h3>
            <p className="text-xs text-[#7A3D19] font-medium mt-1">Fun • Creative • Memorable</p>
            <p className="text-xs text-[#6D6A66] mt-3 leading-relaxed">
              Curate whimsical balloon installations, entertainers, milestone 30th/50th dinner playlists, themed cakes, and custom return gifts seamlessly.
            </p>
            <div className="mt-5 space-y-2 pt-4 border-t border-[#EDE2D3] text-xs text-[#171412]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Interactive age-specific themes & decor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Magicians, DJs & host booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Gift registry & return gift budgeter</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate(isAuthenticated ? 'create-event' : 'signup')}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#F8F0E4] hover:bg-[#7A3D19] text-[#7A3D19] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Plan a Birthday</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Community Events Card */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border ${
              activeCelebration === 'community'
                ? 'bg-[#FFFCF6] border-[#B86B2A] shadow-xl scale-[1.02]'
                : 'bg-[#FFFCF6]/80 border-[#EDE2D3] hover:border-[#D7A34B] opacity-90'
            }`}
          >
            <div className="h-48 rounded-2xl overflow-hidden relative mb-5">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=80"
                alt="Community Events"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#7A3D19] text-[11px] font-bold px-2.5 py-1 rounded-full">
                Impactful & Large Scale
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#171412]">Community Events</h3>
            <p className="text-xs text-[#7A3D19] font-medium mt-1">Impactful • Organized • Together</p>
            <p className="text-xs text-[#6D6A66] mt-3 leading-relaxed">
              Coordinate festivals, society galas, university reunions, and technical meetups with multi-sponsor tracking and real-time vendor logistics.
            </p>
            <div className="mt-5 space-y-2 pt-4 border-t border-[#EDE2D3] text-xs text-[#171412]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Multi-volunteer task delegation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Sponsorship & vendor invoicing ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>Live attendee headcount checkpoints</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate(isAuthenticated ? 'create-event' : 'signup')}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#F8F0E4] hover:bg-[#7A3D19] text-[#7A3D19] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Plan Community Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 3: THE AI EVENT ARCHITECT (NATURAL PROMPT PROGRESSION)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FBE8D3]/50 rounded-full blur-3xl -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EDE1] text-[#7A3D19] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>The AI Event Architect</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171412] leading-tight">
                From One Prompt to a Complete Blueprint
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6A66] leading-relaxed">
                Describe your dream event in simple conversational English. Planora AI analyzes guest counts, locations, budgets, and aesthetic nuances to deliver a production-ready roadmap.
              </p>

              {/* Interactive Stage Step Controls */}
              <div className="pt-4 space-y-2">
                <div className="text-xs font-bold text-[#171412] uppercase tracking-wider">Interactive Simulation</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAiStage(1)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      aiStage === 1
                        ? 'bg-[#7A3D19] text-white border-[#7A3D19] shadow-xs'
                        : 'bg-[#F8F0E4] text-[#6D6A66] border-[#EDE2D3] hover:bg-[#F5E7D3]'
                    }`}
                  >
                    1. Natural Prompt
                  </button>
                  <button
                    onClick={() => setAiStage(2)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      aiStage === 2
                        ? 'bg-[#7A3D19] text-white border-[#7A3D19] shadow-xs'
                        : 'bg-[#F8F0E4] text-[#6D6A66] border-[#EDE2D3] hover:bg-[#F5E7D3]'
                    }`}
                  >
                    2. Parsing
                  </button>
                  <button
                    onClick={() => setAiStage(3)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      aiStage === 3
                        ? 'bg-[#7A3D19] text-white border-[#7A3D19] shadow-xs'
                        : 'bg-[#F8F0E4] text-[#6D6A66] border-[#EDE2D3] hover:bg-[#F5E7D3]'
                    }`}
                  >
                    3. Structured Plan
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate(isAuthenticated ? 'ai-copilot' : 'signup')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#7A3D19] hover:text-[#5D2E12]"
                >
                  <span>Experience the AI Assistant live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Interactive Visual Transformation */}
            <div className="lg:col-span-7 bg-[#FBF7EF] border border-[#E2CFB8] rounded-2xl p-5 sm:p-6 shadow-inner">
              {/* Natural Input Box */}
              <div className="bg-white rounded-xl p-4 border border-[#EDE2D3] shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FBE8D3] flex items-center justify-center text-[#7A3D19] shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#B86B2A]" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-[#928B83] uppercase tracking-wider">User Vision</div>
                  <p className="text-xs sm:text-sm font-medium text-[#171412] mt-0.5">
                    "I want a beach wedding in Goa for 300 guests with a budget of ₹8 lakh."
                  </p>
                </div>
                <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-semibold shrink-0">
                  Parsed
                </span>
              </div>

              {/* Stage Progression Cards */}
              <div className="mt-4 space-y-3">
                {/* Extracted Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-[#EDE2D3] text-center">
                    <span className="text-[10px] text-[#928B83]">Event Type</span>
                    <div className="text-xs font-bold text-[#7A3D19]">Seaside Wedding</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#EDE2D3] text-center">
                    <span className="text-[10px] text-[#928B83]">Location</span>
                    <div className="text-xs font-bold text-[#171412]">Goa, India</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#EDE2D3] text-center">
                    <span className="text-[10px] text-[#928B83]">Guest Count</span>
                    <div className="text-xs font-bold text-[#171412]">300 Guests</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#EDE2D3] text-center">
                    <span className="text-[10px] text-[#928B83]">Target Budget</span>
                    <div className="text-xs font-bold text-[#B86B2A]">₹8,00,000</div>
                  </div>
                </div>

                {/* Structured Actionable Components */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-[#EDE2D3] shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A3D19] mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#B86B2A]" />
                      Budget Plan
                    </div>
                    <div className="text-[11px] text-[#6D6A66]">
                      7 optimized categories, ₹60,000 contingency buffer built-in.
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#EDE2D3] shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A3D19] mb-1">
                      <Palette className="w-3.5 h-3.5 text-[#B86B2A]" />
                      Theme Match
                    </div>
                    <div className="text-[11px] text-[#6D6A66]">
                      Recommended "Beachside Elegant" with pastel tones and rustic mandap.
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#EDE2D3] shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A3D19] mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#B86B2A]" />
                      Timeline
                    </div>
                    <div className="text-[11px] text-[#6D6A66]">
                      6 milestones organized into 24 actionable task checklists.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 4: SMART BUDGETING (ALLOCATION BREAKDOWN)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold tracking-widest text-[#B86B2A] uppercase mb-2">Financial Architecture</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#171412]">
            Smart Budgeting Without Surprises
          </h2>
          <p className="text-sm sm:text-base text-[#6D6A66] mt-3">
            Every rupee is strategically distributed. Planora AI monitors expense categories in real-time, warning you before overruns occur.
          </p>
        </div>

        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-10 shadow-xl">
          {/* Top Budget Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE2D3]">
            <div>
              <span className="text-xs text-[#928B83] font-medium">Demonstration Budget Model</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#171412]">₹8,00,000</span>
                <span className="text-xs bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full font-semibold">
                  100% Balanced & Verified
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6D6A66]">Hover any category to inspect AI savings:</span>
            </div>
          </div>

          {/* Allocation Multi-Color Stack Bar */}
          <div className="mt-6">
            <div className="h-4 rounded-full overflow-hidden flex bg-[#EDE2D3] shadow-inner">
              {budgetBreakdown.map((item) => (
                <div
                  key={item.key}
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  className={`h-full cursor-pointer transition-opacity duration-150 ${
                    hoveredBudgetCat === item.key ? 'opacity-100 ring-2 ring-black/40' : 'opacity-85 hover:opacity-100'
                  }`}
                  onMouseEnter={() => setHoveredBudgetCat(item.key)}
                />
              ))}
            </div>
          </div>

          {/* Budget Categories Grid & Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 items-start">
            {/* Category Cards Column */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {budgetBreakdown.map((cat) => (
                <div
                  key={cat.key}
                  onMouseEnter={() => setHoveredBudgetCat(cat.key)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    hoveredBudgetCat === cat.key
                      ? 'bg-[#FBE8D3]/50 border-[#B86B2A] shadow-sm'
                      : 'bg-white border-[#EDE2D3] hover:border-[#D7A34B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-[#171412]">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#7A3D19]">{cat.percentage}%</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="text-[#928B83]">Allocated</span>
                    <span className="font-bold text-[#171412]">{formatINR(cat.amount)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live AI Optimization Recommendation Panel */}
            <div className="md:col-span-5 bg-[#FBF7EF] border border-[#E2CFB8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A3D19] mb-3">
                <Sparkles className="w-4 h-4 text-[#B86B2A]" />
                <span>AI Optimization Insight</span>
              </div>

              {hoveredBudgetCat && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 bg-white rounded-xl border border-[#EDE2D3]">
                    <div className="text-xs font-bold text-[#171412]">
                      {budgetBreakdown.find((b) => b.key === hoveredBudgetCat)?.name}
                    </div>
                    <div className="text-sm font-serif font-bold text-[#7A3D19] mt-0.5">
                      {formatINR(budgetBreakdown.find((b) => b.key === hoveredBudgetCat)?.amount || 0)} (
                      {budgetBreakdown.find((b) => b.key === hoveredBudgetCat)?.percentage}%)
                    </div>
                  </div>

                  <div className="text-xs text-[#6D6A66] leading-relaxed p-3 bg-[#F8F0E4] rounded-xl border border-[#EDE2D3]">
                    <span className="font-semibold text-[#171412] block mb-1">Savings Strategy:</span>
                    {budgetBreakdown.find((b) => b.key === hoveredBudgetCat)?.tip}
                  </div>

                  <button
                    onClick={() => onNavigate(isAuthenticated ? 'budget-planner' : 'signup')}
                    className="w-full py-2.5 rounded-xl bg-[#7A3D19] text-[#FBF7EF] text-xs font-semibold hover:bg-[#5D2E12] transition-colors"
                  >
                    Open Full Budget Planner →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 5: EVENT STUDIO & PERSONALIZED THEMES (3D GALLERY)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold tracking-widest text-[#B86B2A] uppercase mb-2">Event Studio</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#171412]">
            Five Signature Aesthetics
          </h2>
          <p className="text-sm sm:text-base text-[#6D6A66] mt-3">
            Explore curated color stories, floral palettes, and 3D stage arrangements designed by India’s top wedding and event creators.
          </p>

          {/* Theme Selector Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {themesData.map((th, idx) => (
              <button
                key={th.id}
                onClick={() => setActiveThemeIndex(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeThemeIndex === idx
                    ? 'bg-[#7A3D19] text-white shadow-xs'
                    : 'bg-[#F8F0E4] text-[#6D6A66] hover:bg-[#F5E7D3] hover:text-[#171412]'
                }`}
              >
                {th.name}
              </button>
            ))}
          </div>
        </div>

        {/* Focused Theme Showcase */}
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Theme Image Showcase */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden relative shadow-lg h-72 sm:h-96">
              <img
                src={currentTheme.image}
                alt={currentTheme.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                {currentTheme.category}
              </div>
            </div>

            {/* Theme Details & Palettes */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
                {currentTheme.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#6D6A66] leading-relaxed">
                {currentTheme.description}
              </p>

              {/* Color Palette Swatches */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#928B83] uppercase tracking-wider block mb-2">
                  Curated Palette
                </span>
                <div className="flex items-center gap-2">
                  {currentTheme.palette.map((color, i) => (
                    <div key={i} className="group relative">
                      <div
                        className="w-9 h-9 rounded-full ring-2 ring-white shadow-xs cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Elements Tags */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#928B83] uppercase tracking-wider block mb-2">
                  Signature Decor Elements
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentTheme.elements.map((el, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#F8F0E4] text-[#7A3D19] text-xs font-medium border border-[#EDE2D3]"
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>

              {/* Budget & Guest Spec */}
              <div className="pt-4 flex items-center justify-between border-t border-[#EDE2D3] text-xs">
                <div>
                  <span className="text-[#928B83]">Estimated Range</span>
                  <div className="font-bold text-[#171412] mt-0.5">{currentTheme.budget}</div>
                </div>
                <div>
                  <span className="text-[#928B83]">Guest Fit</span>
                  <div className="font-bold text-[#171412] mt-0.5">{currentTheme.guests}</div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => onNavigate(isAuthenticated ? 'event-studio' : 'signup')}
                  className="w-full py-3 rounded-xl bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Explore this Aesthetic in Event Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 6: VENDOR DISCOVERY (CURATED MARKETPLACE)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#B86B2A] uppercase mb-2">Curated Marketplace</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171412]">
              Handpicked Vendors You Can Trust
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6A66] mt-2 max-w-xl">
              Compare verified pricing, client reviews, portfolio photos, and availability. Direct messaging and comparison matrix without middleman markups.
            </p>
          </div>

          <button
            onClick={() => onNavigate(isAuthenticated ? 'vendors' : 'signup')}
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#F8F0E4] hover:bg-[#7A3D19] text-[#7A3D19] hover:text-white font-semibold text-xs border border-[#EDE2D3] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Browse All 120+ Vendors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-[#FFFCF6] border border-[#EDE2D3] hover:border-[#B86B2A] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#7A3D19] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {vendor.badge}
                </span>
                <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#171412] text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 text-[#D7A34B] fill-[#D7A34B]" />
                  {vendor.rating}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#B86B2A] uppercase tracking-wide">
                    {vendor.category} • {vendor.location}
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#171412] mt-1 line-clamp-1">
                    {vendor.name}
                  </h4>
                  <div className="text-xs font-bold text-[#7A3D19] mt-2">
                    {vendor.price}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {vendor.features.slice(0, 2).map((f, i) => (
                      <span key={i} className="text-[10px] bg-[#F8F0E4] text-[#6D6A66] px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDE2D3] flex items-center justify-between">
                  <span className="text-[11px] text-[#928B83]">{vendor.reviews} reviews</span>
                  <button
                    onClick={() => onNavigate(isAuthenticated ? 'vendors' : 'signup')}
                    className="text-xs font-bold text-[#7A3D19] hover:underline"
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SCENE 7: TIMELINE & EXECUTION (STRESS-FREE CHECKLIST)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold tracking-widest text-[#B86B2A] uppercase mb-2">Stress-Free Execution</div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#171412]">
            From 6 Months Out to the Big Day
          </h2>
          <p className="text-sm sm:text-base text-[#6D6A66] mt-3">
            Planora AI sequences your preparations into manageable steps, keeping suppliers, decorators, and family members synchronized.
          </p>
        </div>

        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                onClick={() => setActiveMilestoneIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  activeMilestoneIndex === idx
                    ? 'bg-[#FBE8D3]/40 border-[#B86B2A] shadow-sm'
                    : 'bg-white border-[#EDE2D3] hover:border-[#D7A34B]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      m.status === 'Completed'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : m.status === 'In Progress'
                        ? 'bg-[#FBE8D3] text-[#7A3D19]'
                        : 'bg-[#F5EDE1] text-[#928B83]'
                    }`}
                  >
                    {m.status === 'Completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#928B83] uppercase tracking-wider">
                        {m.stage}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          m.status === 'Completed'
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : m.status === 'In Progress'
                            ? 'bg-[#FBE8D3] text-[#7A3D19]'
                            : 'bg-gray-100 text-[#928B83]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#171412] mt-0.5">
                      {m.title}
                    </h4>
                    <p className="text-xs text-[#6D6A66] mt-1 max-w-xl">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-[#7A3D19]">{m.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center pt-4 border-t border-[#EDE2D3]">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'event-timeline' : 'signup')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#7A3D19] hover:underline"
            >
              <span>Explore Interactive Event Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 8: THE CONNECTED EVENT EXPERIENCE (INTEGRATED SYSTEM)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#7A3D19] to-[#4A2C1B] rounded-3xl p-8 sm:p-12 md:p-14 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#FBE8D3] text-xs font-semibold tracking-wider uppercase inline-block mb-4">
              All-In-One Unified Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              One Integrated Ecosystem. Zero Friction.
            </h2>
            <p className="text-sm sm:text-base text-white/80 mt-4 leading-relaxed">
              When you adjust your guest count from 200 to 300, Planora AI automatically recalibrates catering cost projections, prompts your venue for extra seating layouts, and flags RSVP deadlines on your timeline.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FBE8D3]">100%</div>
                <div className="text-xs text-white/70 mt-1">Live Budget Sync</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FBE8D3]">5 Curated</div>
                <div className="text-xs text-white/70 mt-1">Signature Themes</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FBE8D3]">120+</div>
                <div className="text-xs text-white/70 mt-1">Verified Vendors</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FBE8D3]">24/7</div>
                <div className="text-xs text-white/70 mt-1">Planora AI Copilot</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 8.5: REAL COMMUNITY EXPERIENCES & RATINGS
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-4" id="scene-reviews">
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#EDE2D3]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EDE1] border border-[#E2CFB8] text-[#7A3D19] text-xs font-semibold tracking-wider uppercase">
                <Star className="w-3.5 h-3.5 text-[#B86B2A] fill-[#B86B2A]" />
                <span>Verified Feedback</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#171412]">
                Community Experiences & Ratings
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6A66] max-w-xl">
                Real feedback from planners organizing celebrations on Planora AI. Every rating is authenticated and calculated dynamically from saved database records.
              </p>
            </div>

            {/* Live Aggregate Score Summary Card */}
            <div className="bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
              <div className="text-center border-r border-[#EDE2D3] pr-4">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#171412]">
                  {ratingSummary && ratingSummary.reviewCount > 0
                    ? ratingSummary.rawAverage.toFixed(1)
                    : '—'}
                </div>
                <div className="text-[10px] text-[#928B83] font-medium uppercase tracking-wider mt-0.5">
                  Average Rating
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex text-[#D7A34B]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-base ${
                        ratingSummary && ratingSummary.rawAverage >= star
                          ? 'text-[#D7A34B]'
                          : ratingSummary && ratingSummary.rawAverage >= star - 0.5
                          ? 'text-[#D7A34B]/70'
                          : 'text-[#EDE2D3]'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-xs font-semibold text-[#171412]">
                  {ratingSummary && ratingSummary.reviewCount > 0
                    ? `${ratingSummary.reviewCount} ${ratingSummary.reviewCount === 1 ? 'Verified Review' : 'Verified Reviews'}`
                    : 'No reviews yet'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Rating & Review Submission Form */}
          <div className="bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl p-6 text-left">
            <h3 className="font-serif font-bold text-base text-[#171412] mb-1">
              Rate Your Experience with Planora AI
            </h3>
            <p className="text-xs text-[#6D6A66] mb-4">
              Your feedback helps other planners find the best tools for their events.
            </p>

            {reviewSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            {reviewError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FDE8E6] border border-[#F5A9A4] text-[#C5221F] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                {/* 5 Selectable Stars */}
                <div>
                  <label className="block text-xs font-semibold text-[#171412] mb-1">
                    Select Your Rating
                  </label>
                  <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Select star rating">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUserRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                        aria-label={`${s} star${s > 1 ? 's' : ''}`}
                      >
                        <span
                          className={`${
                            (hoverRating || userRating) >= s
                              ? 'text-[#D7A34B]'
                              : 'text-[#D3C7B7]'
                          }`}
                        >
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#7A3D19] ml-2">
                      {hoverRating || userRating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Optional Review Text */}
                <div>
                  <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="landing-review-text">
                    Review & Comments (Optional)
                  </label>
                  <textarea
                    id="landing-review-text"
                    rows={3}
                    value={userReviewText}
                    onChange={(e) => setUserReviewText(e.target.value)}
                    placeholder="Share what worked well for your event planning (e.g. AI Copilot prompts, budget tracker, vendor discovery)..."
                    className="w-full p-3 bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Review...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Verified Review</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 p-4 rounded-xl border border-[#EDE2D3]">
                <div className="text-xs text-[#6D6A66]">
                  <span className="font-semibold text-[#171412]">Sign in to submit your verified review.</span>
                  <div>Only authenticated planners can submit reviews to maintain genuine ratings.</div>
                </div>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-5 py-2 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Sign In to Review
                </button>
              </div>
            )}
          </div>

          {/* List of Recent Real Reviews */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-base text-[#171412]">
              Latest Planner Reviews
            </h3>

            {recentReviews.length === 0 ? (
              <div className="p-8 text-center bg-[#FBF7EF] rounded-2xl border border-[#EDE2D3] space-y-1">
                <MessageSquare className="w-8 h-8 text-[#928B83] mx-auto mb-2 opacity-60" />
                <div className="text-xs font-semibold text-[#171412]">
                  No reviews submitted yet
                </div>
                <p className="text-[11px] text-[#6D6A66] max-w-sm mx-auto">
                  Be the first planner to review Planora AI and share your experience with the community.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-white rounded-2xl border border-[#EDE2D3] text-left space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#7A3D19] text-xs font-bold">
                          {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <span className="text-xs font-semibold text-[#171412]">
                          {rev.authorName}
                        </span>
                      </div>
                      <div className="flex text-[#D7A34B] text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={rev.rating >= s ? 'text-[#D7A34B]' : 'text-[#EDE2D3]'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {rev.reviewText && (
                      <p className="text-xs text-[#6D6A66] leading-relaxed">
                        &ldquo;{rev.reviewText}&rdquo;
                      </p>
                    )}
                    <div className="text-[10px] text-[#928B83]">
                      Verified Planner Feedback
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          SCENE 9: FINAL CALL TO ACTION
          ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EDE1] border border-[#E2CFB8] text-[#7A3D19] text-xs font-semibold tracking-wider uppercase mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#B86B2A]" />
          <span>Start Planning Today</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#171412] leading-tight">
          Your next unforgettable event starts here.
        </h2>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-[#6D6A66] max-w-2xl mx-auto">
          Bring your ideas together with personalized planning, smart budgets, beautiful themes, and trusted vendor discovery.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate(isAuthenticated ? 'create-event' : 'signup')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-[#FBF7EF] font-semibold text-base shadow-xl shadow-[#7A3D19]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Start Planning</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#171412] border border-[#EDE2D3] font-semibold text-base shadow-xs hover:border-[#D7A34B] transition-all cursor-pointer"
            >
              Create an Account
            </button>
          )}
        </div>

        {/* Confidence Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6D6A66]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#B86B2A]" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#B86B2A]" />
            Instant AI Blueprint
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#B86B2A]" />
            Export to PDF & Calendar
          </span>
        </div>
      </section>
    </div>
  );
};
