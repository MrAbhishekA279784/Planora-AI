import React from 'react';
import { X, Star, Check, ArrowRight, Scale, CheckCircle2 } from 'lucide-react';
import { VendorItem } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface VendorCompareModalProps {
  vendors: VendorItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (vendorId: string) => void;
  onSelectVendor: (vendor: VendorItem) => void;
}

export const VendorCompareModal: React.FC<VendorCompareModalProps> = ({
  vendors,
  isOpen,
  onClose,
  onRemove,
  onSelectVendor,
}) => {
  useBodyScrollLock(isOpen);
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-left space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE2D3]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FBE8D3] flex items-center justify-center text-[#7A3D19]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#171412]">
                Vendor Comparison ({vendors.length})
              </h2>
              <div className="text-xs text-[#6D6A66]">
                Side-by-side assessment of pricing, capacity, and verified features
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F8F0E4] hover:bg-[#F5E7D3] flex items-center justify-center text-[#171412]"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {vendors.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-[#6D6A66]">No vendors selected for comparison yet.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#7A3D19] text-white text-xs font-semibold"
            >
              Browse Vendors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-[#FBF7EF] border border-[#EDE2D3] rounded-2xl p-4 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Image & Remove */}
                  <div className="relative h-36 rounded-xl overflow-hidden">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onRemove(vendor.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                      aria-label="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-[#171412]">
                      {vendor.name}
                    </h3>
                    <div className="text-xs text-[#B86B2A] font-semibold">
                      {vendor.category}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="w-4 h-4 text-[#D7A34B] fill-current" />
                    <span className="font-bold text-[#171412]">{vendor.rating}</span>
                    <span className="text-[#928B83]">({vendor.reviewCount} reviews)</span>
                  </div>

                  {/* Attributes table */}
                  <div className="space-y-2 text-xs border-t border-[#EDE2D3] pt-2">
                    <div className="flex justify-between">
                      <span className="text-[#928B83]">Price Range</span>
                      <span className="font-bold text-[#7A3D19]">{vendor.priceDisplay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#928B83]">Location</span>
                      <span className="font-medium text-[#171412]">{vendor.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#928B83]">Distance</span>
                      <span className="font-medium text-[#171412]">{vendor.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#928B83]">Capacity</span>
                      <span className="font-medium text-[#171412]">{vendor.capacity || 'Flexible'}</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="border-t border-[#EDE2D3] pt-2 space-y-1">
                    <span className="text-[11px] font-bold text-[#171412] block">Amenities:</span>
                    {vendor.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-[#6D6A66]">
                        <Check className="w-3 h-3 text-[#16A66A]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectVendor(vendor);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Select Vendor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
