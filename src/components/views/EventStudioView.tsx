import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Bookmark,
  Edit2,
  Calendar,
  DollarSign,
  Users,
  Palette,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { AppRoute, EventItem, EventType, ThemeItem } from '../../types';

interface EventStudioViewProps {
  themes: ThemeItem[];
  selectedTheme: ThemeItem;
  onSelectTheme: (theme: ThemeItem) => void;
  onToggleSaveTheme: (themeId: string) => void;
  onToggleFavoriteTheme: (themeId: string) => void;
  onRouteChange: (route: AppRoute) => void;
  activeEvent: EventItem | null;
}

export const EventStudioView: React.FC<EventStudioViewProps> = ({
  themes,
  selectedTheme,
  onSelectTheme,
  onToggleSaveTheme,
  onToggleFavoriteTheme,
  onRouteChange,
  activeEvent,
}) => {
  const [selectedEventType, setSelectedEventType] = useState<EventType>('wedding');
  const [activeCategory, setActiveCategory] = useState('Themes');
  const [themeSearch, setThemeSearch] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);

  // AI Theme Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<any>(null);

  // Customize modal state
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customPalette, setCustomPalette] = useState(selectedTheme.palette);

  const categories = [
    'Themes',
    'Decorations',
    'Menu Ideas',
    'Activities',
    'Invitations',
    'Outfits',
    'Music & Entertainment',
  ];

  const filteredThemes = themes.filter((t) => {
    if (themeSearch.trim()) {
      return (
        t.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(themeSearch.toLowerCase())
      );
    }
    return true;
  });

  const handleGenerateAiTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, eventType: selectedEventType }),
      });
      const data = await res.json();
      if (data.theme) {
        setGeneratedTheme(data.theme);
        // Also update selected theme preview with generated output
        const newTheme: ThemeItem = {
          id: `ai-${Date.now()}`,
          name: data.theme.name,
          category: 'Themes',
          eventType: selectedEventType,
          description: data.theme.description,
          image: selectedTheme.image,
          bestFor: data.theme.bestFor || 'Custom Celebration',
          estimatedBudget: data.theme.estimatedBudget || '₹7 – 12 lakh',
          guestCapacity: data.theme.guestCapacity || '150 – 350',
          palette: data.theme.palette || ['#FBE8D3', '#E8A598', '#D48B70', '#85B6D4', '#5E3821'],
          elements: selectedTheme.elements,
          isFavorite: false,
          isSaved: true,
        };
        onSelectTheme(newTheme);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 7.1 Hero Section: Left Hero + Right AI Theme Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left Hero Region */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FBF7EF] via-[#F8F0E4] to-[#F5E7D3] p-6 sm:p-8 border border-[#EDE2D3]">
            {/* Background flourish and decorative image */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-35 pointer-events-none hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
                alt="Mandap decor"
                className="w-full h-full object-cover rounded-r-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F8F0E4] to-transparent" />
            </div>

            <div className="relative z-10 max-w-xl space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171412] tracking-tight">
                Event Studio
              </h1>
              <p className="font-serif text-lg sm:text-xl text-[#7A3D19] italic">
                Turn your ideas into beautiful experiences
              </p>
              <p className="text-xs sm:text-sm text-[#6D6A66] leading-relaxed">
                Explore stunning themes, decoration ideas, menus, activities and personalized
                suggestions for your event.
              </p>
              <div className="font-serif text-sm italic text-[#B86B2A] pt-1">
                Ideas • Inspiration • Your Event
              </div>
            </div>
          </div>

          {/* 3 Event Type Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setSelectedEventType('wedding')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedEventType === 'wedding'
                  ? 'bg-[#FBE8D3]/80 border-[#B86B2A] shadow-xs'
                  : 'bg-[#FFFCF6] border-[#EDE2D3] hover:border-[#E2CFB8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F0E4] flex items-center justify-center text-[#7A3D19]">
                  💍
                </div>
                <div>
                  <div className="font-bold text-sm text-[#171412]">Wedding</div>
                  <div className="text-[11px] text-[#6D6A66]">Elegant • Romantic • Timeless</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B86B2A]" />
            </div>

            <div
              onClick={() => setSelectedEventType('birthday')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedEventType === 'birthday'
                  ? 'bg-[#FBE8D3]/80 border-[#B86B2A] shadow-xs'
                  : 'bg-[#FFFCF6] border-[#EDE2D3] hover:border-[#E2CFB8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F0E4] flex items-center justify-center text-[#7A3D19]">
                  🎁
                </div>
                <div>
                  <div className="font-bold text-sm text-[#171412]">Birthday</div>
                  <div className="text-[11px] text-[#6D6A66]">Fun • Creative • Memorable</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B86B2A]" />
            </div>

            <div
              onClick={() => setSelectedEventType('community')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedEventType === 'community'
                  ? 'bg-[#FBE8D3]/80 border-[#B86B2A] shadow-xs'
                  : 'bg-[#FFFCF6] border-[#EDE2D3] hover:border-[#E2CFB8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F0E4] flex items-center justify-center text-[#7A3D19]">
                  👥
                </div>
                <div>
                  <div className="font-bold text-sm text-[#171412]">Community Event</div>
                  <div className="text-[11px] text-[#6D6A66]">Impactful • Organized • Together</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B86B2A]" />
            </div>
          </div>
        </div>

        {/* Right Panel: AI Theme Generator */}
        <div className="lg:col-span-4 bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-sm text-left space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-[#171412]">AI Theme Generator</div>
              <div className="text-[10px] text-[#928B83]">Generative design engine</div>
            </div>
          </div>

          <p className="text-xs text-[#6D6A66] leading-relaxed">
            Describe your vision and get personalized theme ideas with color palettes, decor, outfits and more.
          </p>

          <form onSubmit={handleGenerateAiTheme} className="space-y-3">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="E.g. I want a beach wedding with pastel themes for 300 guests in Goa..."
              className="w-full bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl p-3 text-xs text-[#171412] placeholder:text-[#928B83] focus:outline-none resize-none"
            />

            <button
              type="submit"
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] disabled:bg-[#EDE2D3] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Designing theme...</span>
                </>
              ) : (
                <>
                  <span>Generate Theme Ideas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {generatedTheme && (
            <div className="p-3 bg-[#F8F0E4] rounded-2xl border border-[#E2CFB8] text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold text-[#7A3D19]">{generatedTheme.name}</div>
              <div className="text-[11px] text-[#6D6A66]">{generatedTheme.description}</div>
              <div className="flex items-center gap-1.5 pt-1">
                {generatedTheme.palette?.map((c: string, idx: number) => (
                  <span
                    key={idx}
                    className="w-5 h-5 rounded-full border border-black/10 inline-block shadow-2xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7.2 Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE2D3] pb-4">
        {/* Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#7A3D19] text-white shadow-xs'
                  : 'bg-[#FFFCF6] hover:bg-[#F8F0E4] text-[#6D6A66] border border-[#EDE2D3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={themeSearch}
              onChange={(e) => setThemeSearch(e.target.value)}
              placeholder="Search themes, ideas..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFFCF6] border border-[#EDE2D3] rounded-full text-xs text-[#171412] placeholder:text-[#928B83] focus:outline-none focus:border-[#B86B2A]"
            />
          </div>
          <button
            className="w-8 h-8 rounded-full border border-[#EDE2D3] bg-[#FFFCF6] flex items-center justify-center hover:bg-[#F8F0E4] text-[#6D6A66]"
            aria-label="Filter settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7.3 Popular Wedding Themes Row */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#171412]">
            Popular {selectedEventType.charAt(0).toUpperCase() + selectedEventType.slice(1)} Themes
          </h2>
          <button className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Themes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredThemes.slice(0, 5).map((theme) => {
            const isSelected = selectedTheme.id === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`group bg-[#FFFCF6] rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md ${
                  isSelected ? 'border-[#B86B2A] ring-2 ring-[#B86B2A]/20' : 'border-[#EDE2D3]'
                }`}
              >
                <div className="relative h-32 sm:h-36 overflow-hidden">
                  <img
                    src={theme.image}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteTheme(theme.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#7A3D19] hover:bg-white transition-colors"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        theme.isFavorite ? 'fill-[#E94C45] text-[#E94C45]' : 'text-[#6D6A66]'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 text-left">
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-[#171412] group-hover:text-[#7A3D19] transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-[11px] text-[#6D6A66] line-clamp-2 mt-1">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7.4 Theme Details & Theme Elements (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
        {/* Left: Theme Details */}
        <div className="lg:col-span-6 bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
            <h3 className="font-serif font-bold text-xl text-[#171412]">
              Theme Details
            </h3>
            <button
              onClick={() => onToggleSaveTheme(selectedTheme.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                selectedTheme.isSaved
                  ? 'bg-[#E1F5E9] text-[#16A66A]'
                  : 'bg-[#F8F0E4] hover:bg-[#FBE8D3] text-[#7A3D19]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{selectedTheme.isSaved ? 'Saved' : 'Save Theme'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Theme Hero Image with Carousel Arrows */}
            <div className="sm:col-span-5 relative h-48 rounded-2xl overflow-hidden shadow-xs">
              <img
                src={selectedTheme.image}
                alt={selectedTheme.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setGalleryIndex((prev) => (prev > 0 ? prev - 1 : 0))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#171412]"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGalleryIndex((prev) => prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#171412]"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Attributes */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <h4 className="font-serif font-bold text-xl text-[#171412]">
                  {selectedTheme.name}
                </h4>
                <p className="text-xs text-[#6D6A66] mt-1 leading-relaxed">
                  {selectedTheme.description}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#EDE2D3]/60">
                  <span className="text-[#928B83]">Best for</span>
                  <span className="font-semibold text-[#171412]">{selectedTheme.bestFor}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#EDE2D3]/60">
                  <span className="text-[#928B83]">Estimated Budget</span>
                  <span className="font-semibold text-[#171412]">{selectedTheme.estimatedBudget}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#EDE2D3]/60">
                  <span className="text-[#928B83]">Guest Capacity</span>
                  <span className="font-semibold text-[#171412]">{selectedTheme.guestCapacity}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#928B83]">Color Palette</span>
                  <div className="flex items-center gap-1.5">
                    {selectedTheme.palette.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`"${selectedTheme.name}" applied to your active event!`);
                  onRouteChange('my-events');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Use This Theme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Theme Elements (6 Tiles) */}
        <div className="lg:col-span-6 bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
            <h3 className="font-serif font-bold text-xl text-[#171412]">
              Theme Elements
            </h3>
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#F8F0E4] hover:bg-[#FBE8D3] text-[#7A3D19] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedTheme.elements.map((el, i) => (
              <div
                key={i}
                className="group relative h-28 rounded-xl overflow-hidden border border-[#EDE2D3] shadow-2xs"
              >
                <img
                  src={el.image}
                  alt={el.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white font-serif text-xs font-medium leading-tight">
                  {el.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7.5 Right-Side Inspiration Panels (Quick Inspiration & Similar Themes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Quick Inspiration */}
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 shadow-2xs space-y-3">
          <h4 className="font-serif font-bold text-base text-[#171412]">
            Quick Inspiration
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F8F0E4] rounded-2xl flex items-center gap-2.5 cursor-pointer hover:bg-[#F5E7D3] transition-colors">
              <Palette className="w-4 h-4 text-[#B86B2A]" />
              <span className="text-xs font-semibold text-[#171412]">Color Palettes</span>
            </div>
            <div className="p-3 bg-[#F8F0E4] rounded-2xl flex items-center gap-2.5 cursor-pointer hover:bg-[#F5E7D3] transition-colors">
              <Sparkles className="w-4 h-4 text-[#B86B2A]" />
              <span className="text-xs font-semibold text-[#171412]">Stage Designs</span>
            </div>
            <div className="p-3 bg-[#F8F0E4] rounded-2xl flex items-center gap-2.5 cursor-pointer hover:bg-[#F5E7D3] transition-colors">
              <Calendar className="w-4 h-4 text-[#B86B2A]" />
              <span className="text-xs font-semibold text-[#171412]">Table Settings</span>
            </div>
            <div className="p-3 bg-[#F8F0E4] rounded-2xl flex items-center gap-2.5 cursor-pointer hover:bg-[#F5E7D3] transition-colors">
              <Sparkles className="w-4 h-4 text-[#B86B2A]" />
              <span className="text-xs font-semibold text-[#171412]">Entry Decor</span>
            </div>
          </div>
        </div>

        {/* Similar Themes */}
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base text-[#171412]">
              Similar Themes
            </h4>
            <button className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {themes.slice(1, 4).map((th) => (
              <div
                key={th.id}
                onClick={() => onSelectTheme(th)}
                className="relative h-24 rounded-xl overflow-hidden cursor-pointer group border border-[#EDE2D3]"
              >
                <img
                  src={th.image}
                  alt={th.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[11px] font-serif font-medium leading-tight">
                  {th.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customize Theme Elements Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 max-w-lg w-full shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE2D3] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#171412]">
                Customize Theme Elements
              </h3>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8F0E4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#171412] block mb-1.5">Color Palette Swatches</label>
                <div className="flex items-center gap-3">
                  {customPalette.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const updated = [...customPalette];
                          updated[idx] = e.target.value;
                          setCustomPalette(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#EDE2D3]"
                      />
                      <span className="text-[10px] text-[#928B83]">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171412] block mb-1">Mandap & Stage Preference</label>
                <select className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none">
                  <option>Beachside Pastel Archway with Drapes</option>
                  <option>Contemporary Geometric Floral Pergola</option>
                  <option>Traditional Marigold Heritage Mandap</option>
                  <option>Fairy Light Canopy with Pampas Accents</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#171412] block mb-1">Lighting Ambience</label>
                <select className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none">
                  <option>Warm Festoon & Filament Edison Bulbs</option>
                  <option>Dramatic Uplighting with Fairy Lights</option>
                  <option>Candlelit Lantern Walkways</option>
                  <option>Starlight Ceiling Projectors</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#EDE2D3]">
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8F0E4] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    selectedTheme.palette = customPalette;
                    setShowCustomizeModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7A3D19] text-white font-medium hover:bg-[#4A2C1B]"
                >
                  Apply Customization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
