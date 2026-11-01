import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  CheckCircle2,
  MapPin,
  Waves,
  Users,
  Car,
  Utensils,
  MessageSquare,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { AppRoute, VendorItem } from '../../types';

interface VendorDetailsViewProps {
  vendor: VendorItem;
  onBack: () => void;
  onOpenInquiryModal: (vendor: VendorItem) => void;
  onToggleFavorite: (vendorId: string) => void;
  onRouteChange: (route: AppRoute) => void;
}

export const VendorDetailsView: React.FC<VendorDetailsViewProps> = ({
  vendor,
  onBack,
  onOpenInquiryModal,
  onToggleFavorite,
  onRouteChange,
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Photos' | 'Reviews' | 'Packages'>('Overview');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const tabs: Array<'Overview' | 'Photos' | 'Reviews' | 'Packages'> = [
    'Overview',
    'Photos',
    'Reviews',
    'Packages',
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 text-left space-y-6">
      {/* Top Image Gallery Header */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-md">
        <img
          src={vendor.gallery[activePhotoIndex] || vendor.image}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#171412] hover:bg-white transition-colors shadow-sm"
          aria-label="Go back to vendors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Top-Right Favorite and Share */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(vendor.id)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#7A3D19] hover:bg-white transition-colors shadow-sm"
            aria-label="Save to favorites"
          >
            <Heart
              className={`w-5 h-5 ${
                vendor.isFavorite ? 'fill-[#E94C45] text-[#E94C45]' : 'text-[#6D6A66]'
              }`}
            />
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Vendor link copied to clipboard!');
            }}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#171412] hover:bg-white transition-colors shadow-sm"
            aria-label="Share vendor"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium">
          {activePhotoIndex + 1}/{vendor.gallery.length || 1}
        </div>
      </div>

      {/* Vendor Summary Details */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
                {vendor.name}
              </h1>
              {vendor.verified && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A66A] bg-[#E1F5E9] px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6D6A66]">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#D7A34B] fill-current" />
                <span className="font-bold text-[#171412]">{vendor.rating}</span>
                <span>({vendor.reviewCount} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B86B2A]" />
                <span>{vendor.location}</span>
                <span>({vendor.distance})</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-sm font-semibold text-[#928B83]">{vendor.category}</div>
            <div className="font-serif font-bold text-xl text-[#7A3D19]">{vendor.priceDisplay}</div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EDE2D3] pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-xs font-bold transition-all relative ${
                activeTab === tab
                  ? 'text-[#7A3D19] border-b-2 border-[#7A3D19]'
                  : 'text-[#6D6A66] hover:text-[#171412]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-6 pt-2">
            {/* About Section */}
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base text-[#171412]">About</h3>
              <p className="text-xs sm:text-sm text-[#6D6A66] leading-relaxed">
                {vendor.description}
              </p>
            </div>

            {/* Amenities Highlight Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#F8F0E4] rounded-2xl flex flex-col items-center text-center gap-1.5">
                <Waves className="w-5 h-5 text-[#B86B2A]" />
                <span className="text-xs font-bold text-[#171412]">Beachfront</span>
              </div>
              <div className="p-3.5 bg-[#F8F0E4] rounded-2xl flex flex-col items-center text-center gap-1.5">
                <Users className="w-5 h-5 text-[#B86B2A]" />
                <span className="text-xs font-bold text-[#171412]">{vendor.capacity || '500+ Guests'}</span>
              </div>
              <div className="p-3.5 bg-[#F8F0E4] rounded-2xl flex flex-col items-center text-center gap-1.5">
                <Car className="w-5 h-5 text-[#B86B2A]" />
                <span className="text-xs font-bold text-[#171412]">Valet Parking</span>
              </div>
              <div className="p-3.5 bg-[#F8F0E4] rounded-2xl flex flex-col items-center text-center gap-1.5">
                <Utensils className="w-5 h-5 text-[#B86B2A]" />
                <span className="text-xs font-bold text-[#171412]">In-house Catering</span>
              </div>
            </div>

            {/* Gallery Thumbnail Row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#171412]">Gallery</h3>
                <span className="text-xs font-semibold text-[#7A3D19] cursor-pointer hover:underline">
                  View All ({vendor.gallery.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {vendor.gallery.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activePhotoIndex === i ? 'border-[#B86B2A]' : 'border-transparent'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Photos */}
        {activeTab === 'Photos' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {vendor.gallery.map((imgUrl, idx) => (
              <div key={idx} className="h-44 rounded-2xl overflow-hidden shadow-2xs">
                <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'Reviews' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-[#F8F0E4] rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-2xl font-serif font-bold text-[#171412]">{vendor.rating} out of 5</div>
                <div className="text-xs text-[#6D6A66]">Based on {vendor.reviewCount} customer reviews</div>
              </div>
              <div className="flex text-[#D7A34B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#171412]">
                  <span>Pooja & Sameer</span>
                  <span className="text-[#928B83]">Jan 2026</span>
                </div>
                <div className="flex text-[#D7A34B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-[#6D6A66] pt-1">
                  "Our sunset vows at the beachfront lawn were beyond magical. The hospitality team ensured flawless flow for 350 guests without a single hitch."
                </p>
              </div>

              <div className="p-4 bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#171412]">
                  <span>Arjun Verma</span>
                  <span className="text-[#928B83]">Dec 2025</span>
                </div>
                <div className="flex text-[#D7A34B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-[#6D6A66] pt-1">
                  "Exceptional coordination and delicious seafood catering. Would book again for any grand celebration."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Packages */}
        {activeTab === 'Packages' && (
          <div className="space-y-3 pt-2">
            <div className="p-4 bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-[#171412]">Sunset Beach Vows Package</div>
                <div className="text-xs text-[#6D6A66]">Lawn venue, bridal suite, acoustic stage & sound system</div>
              </div>
              <div className="font-bold text-sm text-[#7A3D19]">₹2,50,000</div>
            </div>

            <div className="p-4 bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-[#171412]">Grand Coastal Wedding Package</div>
                <div className="text-xs text-[#6D6A66]">2-day access, private beach, banquet hall, valet & security</div>
              </div>
              <div className="font-bold text-sm text-[#7A3D19]">₹5,50,000</div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFCF6]/95 backdrop-blur-md border-t border-[#EDE2D3] p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block text-left">
            <div className="text-xs text-[#928B83]">Starting from</div>
            <div className="font-serif font-bold text-lg text-[#7A3D19]">{vendor.priceDisplay.split('–')[0]}</div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenInquiryModal(vendor)}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-xl border border-[#EDE2D3] bg-[#F8F0E4] hover:bg-[#F5E7D3] text-[#7A3D19] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => onOpenInquiryModal(vendor)}
              className="flex-1 sm:flex-initial py-3 px-8 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Enquire Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
