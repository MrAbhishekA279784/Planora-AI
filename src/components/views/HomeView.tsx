import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wallet,
  Calendar,
  Store,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Send,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { AppRoute, EventItem, ThemeItem } from '../../types';
import { heroCarouselCards, eventMoods } from '../../data/mockData';

interface HomeViewProps {
  events: EventItem[];
  themes: ThemeItem[];
  onRouteChange: (route: AppRoute) => void;
  onSelectEvent: (event: EventItem) => void;
  onSelectTheme: (theme: ThemeItem) => void;
  onQuickAiPrompt: (promptText: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  events,
  themes,
  onRouteChange,
  onSelectEvent,
  onSelectTheme,
  onQuickAiPrompt,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [promptInput, setPromptInput] = useState('');

  const activeCarouselCard = heroCarouselCards[carouselIndex];
  const primaryEvent = events[0];

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % heroCarouselCards.length);
  };

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => (prev - 1 + heroCarouselCards.length) % heroCarouselCards.length);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      onQuickAiPrompt(promptInput.trim());
      setPromptInput('');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 5.1 Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE8D3]/80 border border-[#E2CFB8] text-[11px] font-bold tracking-widest text-[#B86B2A] uppercase">
              Turn Moments Into Memories
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#171412] leading-[1.1] font-normal tracking-tight">
              Your next{' '}
              <span className="italic font-serif text-[#B86B2A] font-medium">
                unforgettable
              </span>{' '}
              event
            </h1>

            <p className="text-sm sm:text-base text-[#6D6A66] leading-relaxed max-w-xl">
              Plan weddings, birthdays and community events with the power of AI — personalized ideas,
              budgets, timelines and trusted vendors.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onRouteChange('create-event')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 group cursor-pointer"
              >
                <span>Create Your Event</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Social Proof Row */}
            <div className="pt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                  alt="Planner"
                  className="w-9 h-9 rounded-full border-2 border-[#FBF7EF] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                  alt="Planner"
                  className="w-9 h-9 rounded-full border-2 border-[#FBF7EF] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                  alt="Planner"
                  className="w-9 h-9 rounded-full border-2 border-[#FBF7EF] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                  alt="Planner"
                  className="w-9 h-9 rounded-full border-2 border-[#FBF7EF] object-cover"
                />
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#171412]">10K+ happy planners</div>
                <div className="flex items-center gap-1 text-[#B86B2A]">
                  <div className="flex text-[#D7A34B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-[#171412]">4.8/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual: Layered 3D-like Carousel of Event Cards */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]">
            {/* Carousel navigation controls */}
            <button
              onClick={handlePrevCarousel}
              className="absolute left-0 sm:left-2 z-30 w-10 h-10 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] shadow-md flex items-center justify-center text-[#171412] hover:bg-[#F8F0E4] hover:scale-105 transition-all"
              aria-label="Previous event card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextCarousel}
              className="absolute right-0 sm:right-2 z-30 w-10 h-10 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] shadow-md flex items-center justify-center text-[#171412] hover:bg-[#F8F0E4] hover:scale-105 transition-all"
              aria-label="Next event card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Layered Cards Stack */}
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] h-[340px] sm:h-[400px] flex items-center justify-center">
              {heroCarouselCards.map((card, idx) => {
                const isCenter = idx === carouselIndex;
                const isLeft = idx === (carouselIndex - 1 + heroCarouselCards.length) % heroCarouselCards.length;
                const isRight = idx === (carouselIndex + 1) % heroCarouselCards.length;

                if (!isCenter && !isLeft && !isRight) return null;

                let positionClass = '';
                if (isCenter) {
                  positionClass = 'z-20 scale-100 opacity-100 translate-x-0 shadow-2xl';
                } else if (isLeft) {
                  positionClass = 'z-10 scale-85 opacity-70 -translate-x-20 sm:-translate-x-28 -rotate-6 shadow-md pointer-events-none hidden sm:block';
                } else if (isRight) {
                  positionClass = 'z-10 scale-85 opacity-70 translate-x-20 sm:translate-x-28 rotate-6 shadow-md pointer-events-none hidden sm:block';
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (isCenter) onRouteChange('event-studio');
                      else setCarouselIndex(idx);
                    }}
                    className={`absolute w-full h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border border-[#EDE2D3] ${positionClass}`}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                    {/* Top Pill & Index */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase border border-white/30">
                        {card.label}
                      </span>
                      <span className="text-xs font-mono font-medium tracking-widest text-white/90">
                        {card.index}
                      </span>
                    </div>

                    {/* Bottom Card Content */}
                    <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-white/80 mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2 mt-4 z-20">
              {heroCarouselCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    carouselIndex === i ? 'w-6 bg-[#7A3D19]' : 'w-2 bg-[#E2CFB8]'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5.2 Feature Highlight Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onRouteChange('ai-copilot')}
          className="bg-[#FFFCF6] border border-[#EDE2D3] hover:border-[#E2CFB8] p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#171412]">AI Powered Planning</div>
            <div className="text-xs text-[#6D6A66] mt-0.5">Personalized plans for every occasion</div>
          </div>
        </div>

        <div
          onClick={() => onRouteChange('budget-planner')}
          className="bg-[#FFFCF6] border border-[#EDE2D3] hover:border-[#E2CFB8] p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] shrink-0 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#171412]">Smart Budgeting</div>
            <div className="text-xs text-[#6D6A66] mt-0.5">Plan better, spend smarter</div>
          </div>
        </div>

        <div
          onClick={() => onRouteChange('event-timeline')}
          className="bg-[#FFFCF6] border border-[#EDE2D3] hover:border-[#E2CFB8] p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#171412]">Complete Timelines</div>
            <div className="text-xs text-[#6D6A66] mt-0.5">Stay on track, stress free</div>
          </div>
        </div>

        <div
          onClick={() => onRouteChange('vendors')}
          className="bg-[#FFFCF6] border border-[#EDE2D3] hover:border-[#E2CFB8] p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] shrink-0 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#171412]">Trusted Vendors</div>
            <div className="text-xs text-[#6D6A66] mt-0.5">Find and compare the best</div>
          </div>
        </div>
      </section>

      {/* 5.3 Continue Planning & 5.4 Explore Event Moods */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Continue Planning (Left) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div
                onClick={() => onRouteChange('my-events')}
                className="font-serif text-xl font-bold text-[#171412] flex items-center gap-1.5 cursor-pointer hover:text-[#7A3D19]"
              >
                Continue planning <ChevronRight className="w-4 h-4 text-[#B86B2A]" />
              </div>
              <div className="text-xs text-[#928B83]">Pick up where you left off</div>
            </div>
          </div>

          {/* Active Event Card */}
          {primaryEvent ? (
            <div
              onClick={() => {
                onSelectEvent(primaryEvent);
                onRouteChange('my-events');
              }}
              className="bg-[#FFFCF6] border border-[#EDE2D3] hover:border-[#E2CFB8] p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-center gap-4"
            >
              <img
                src={primaryEvent.image}
                alt={primaryEvent.name}
                className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-serif font-bold text-base text-[#171412] group-hover:text-[#7A3D19] transition-colors">
                    {primaryEvent.name}
                  </h4>
                  <button className="text-[#928B83] hover:text-[#171412] p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#6D6A66]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B86B2A]" />
                    {primaryEvent.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B86B2A]" />
                    {primaryEvent.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#B86B2A]" />
                    {primaryEvent.guestCount} Guests
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-medium text-[#6D6A66]">
                    <span>Progress</span>
                    <span className="text-[#16A66A] font-bold">{primaryEvent.completionPercent}% complete</span>
                  </div>
                  <div className="w-full bg-[#EDE2D3] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16A66A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${primaryEvent.completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFCF6] border border-dashed border-[#EDE2D3] rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#171412]">No events yet</h4>
              <p className="text-xs text-[#6D6A66] max-w-xs mx-auto">
                Your workspace is ready. Create your first wedding, party, or celebration to begin planning.
              </p>
              <button
                onClick={() => onRouteChange('create-event')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Create Your First Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Explore Event Moods (Right) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div
                onClick={() => onRouteChange('event-studio')}
                className="font-serif text-xl font-bold text-[#171412] flex items-center gap-1.5 cursor-pointer hover:text-[#7A3D19]"
              >
                Explore event moods <ChevronRight className="w-4 h-4 text-[#B86B2A]" />
              </div>
              <div className="text-xs text-[#928B83]">Find inspiration for your special day</div>
            </div>
            <button
              onClick={() => onRouteChange('event-studio')}
              className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Mood Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto pb-1">
            {eventMoods.map((mood, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const matched = themes.find((t) => t.name.toLowerCase() === mood.title.toLowerCase()) || themes[0];
                  onSelectTheme(matched);
                  onRouteChange('event-studio');
                }}
                className="relative h-28 sm:h-32 rounded-xl overflow-hidden cursor-pointer group shadow-2xs hover:shadow-md transition-all border border-[#EDE2D3]"
              >
                <img
                  src={mood.image}
                  alt={mood.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                  <div className="font-serif text-xs font-medium leading-tight">
                    {mood.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5 AI Event Copilot Bottom Prompt Area */}
      <section className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B86B2A] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Event Copilot</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#171412] leading-tight">
              Tell me your vision. <br />
              <span className="italic font-serif text-[#7A3D19]">I’ll shape the plan.</span>
            </h2>
            <p className="text-xs text-[#6D6A66] max-w-sm">
              Get personalized ideas, budget plans, timelines, vendor suggestions and more — all with AI.
            </p>
          </div>

          {/* Right Input and Quick Action Pills */}
          <div className="lg:col-span-7 space-y-3">
            <form onSubmit={handlePromptSubmit} className="relative">
              <div className="flex items-center bg-[#FBF7EF] border border-[#EDE2D3] focus-within:border-[#B86B2A] rounded-full p-2 pl-4 shadow-inner transition-colors">
                <Sparkles className="w-4 h-4 text-[#B86B2A] mr-2 shrink-0" />
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="E.g. Plan a beach wedding in Goa for 300 guests with a budget of 8 lakh..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#171412] placeholder:text-[#928B83] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-[#7A3D19] hover:bg-[#4A2C1B] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95"
                  aria-label="Submit planning prompt"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => onQuickAiPrompt('Suggest a comprehensive budget plan for a 300 guest wedding in Goa')}
                className="px-3.5 py-1.5 rounded-full bg-[#F8F0E4] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[#7A3D19] font-medium transition-colors"
              >
                Suggest a budget plan
              </button>
              <button
                onClick={() => onQuickAiPrompt('Find best themes with pastel colors for beach celebrations')}
                className="px-3.5 py-1.5 rounded-full bg-[#F8F0E4] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[#7A3D19] font-medium transition-colors"
              >
                Find themes
              </button>
              <button
                onClick={() => onQuickAiPrompt('Compare venues and catering packages in Goa')}
                className="px-3.5 py-1.5 rounded-full bg-[#F8F0E4] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[#7A3D19] font-medium transition-colors"
              >
                Compare vendors
              </button>
              <button
                onClick={() => onQuickAiPrompt('Create an end-to-end timeline for my event in Goa')}
                className="px-3.5 py-1.5 rounded-full bg-[#F8F0E4] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[#7A3D19] font-medium transition-colors"
              >
                Create timeline
              </button>
              <button
                onClick={() => onQuickAiPrompt('Help plan a 5th birthday celebration for 50 guests')}
                className="px-3.5 py-1.5 rounded-full bg-[#F8F0E4] hover:bg-[#FBE8D3] border border-[#EDE2D3] text-[#7A3D19] font-medium transition-colors"
              >
                Plan a birthday
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
