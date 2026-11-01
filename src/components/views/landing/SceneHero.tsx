import React from 'react';
import { Sparkles, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

interface SceneHeroProps {
  isAuthenticated: boolean;
  onNavigate: (route: any) => void;
  ratingSummary: { reviewCount: number; rawAverage: number } | null;
  setActiveCelebration: (type: 'wedding' | 'birthday' | 'community') => void;
}

export const SceneHero: React.FC<SceneHeroProps> = ({
  isAuthenticated,
  onNavigate,
  ratingSummary,
  setActiveCelebration,
}) => {
  return (
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
          {/* Left Card: Birthdays */}
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

          {/* Right Card: Community */}
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

          {/* Center Primary Card: Beach Wedding */}
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
  );
};
