import React, { useState } from 'react';
import { X, Store, MapPin, Phone, Globe, DollarSign, Star, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { VendorItem, EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AddCustomVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorAdded: (vendor: VendorItem) => void;
  activeEvent?: EventItem | null;
}

export const AddCustomVendorModal: React.FC<AddCustomVendorModalProps> = ({
  isOpen,
  onClose,
  onVendorAdded,
  activeEvent,
}) => {
  const { getIdToken } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue');
  const [address, setAddress] = useState(activeEvent?.location || '');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [priceMin, setPriceMin] = useState<number>(50000);
  const [priceMax, setPriceMax] = useState<number>(150000);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(4.8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setErrorMsg('Vendor name and location address are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Default coordinates based on location or Goa default
    let lat = 15.498877;
    let lng = 73.766324;
    const locLower = address.toLowerCase();
    if (locLower.includes('mumbai')) { lat = 18.922; lng = 72.8346; }
    else if (locLower.includes('udaipur')) { lat = 24.5854; lng = 73.7125; }
    else if (locLower.includes('delhi')) { lat = 28.6139; lng = 77.209; }

    try {
      const token = await getIdToken();
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          category: category.toLowerCase(),
          address: address.trim(),
          locationName: address.trim(),
          latitude: lat,
          longitude: lng,
          phone: phone.trim(),
          website: website.trim(),
          rating,
          description: description.trim(),
          priceMin,
          priceMax,
          source: 'user_saved',
        }),
      });

      const data = await res.json();
      if (res.ok && data.vendor) {
        const newVendor: VendorItem = {
          id: data.vendor.id || `custom_${Date.now()}`,
          name: data.vendor.name,
          category: (category.charAt(0).toUpperCase() + category.slice(1)) as any,
          location: data.vendor.address || address,
          distance: 'Custom Vendor',
          rating: data.vendor.rating || rating,
          reviewCount: 1,
          priceDisplay: `₹${priceMin.toLocaleString('en-IN')} – ₹${priceMax.toLocaleString('en-IN')}`,
          priceMin,
          priceMax,
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
          badge: 'Saved in Account',
          verified: false,
          capacity: 'Custom',
          features: ['User Saved', 'Direct Contact'],
          description: description || 'Custom vendor added by user.',
          gallery: [],
          latitude: lat,
          longitude: lng,
          address,
          phone,
          website,
          source: 'user_saved',
          isFavorite: true,
        };

        onVendorAdded(newVendor);
        onClose();
        // Reset form
        setName('');
        setPhone('');
        setWebsite('');
        setDescription('');
      } else {
        setErrorMsg(data.error || 'Failed to save vendor to account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating vendor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FBE8D3] text-[#7A3D19] flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#171412]">
                Add Custom Vendor
              </h3>
              <p className="text-xs text-[#6D6A66]">
                Save vendor contact & details directly to your account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8F0E4] text-[#6D6A66]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Taj Shoreline Lawn"
                className="w-full px-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none focus:border-[#B86B2A]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Photography">Photography</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Makeup & Styling">Makeup & Styling</option>
                <option value="Invitations">Invitations</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          {/* Location / Address */}
          <div>
            <label className="text-xs font-bold text-[#171412] block mb-1">
              Address / Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Candolim Beach Road, North Goa"
                className="w-full pl-9 pr-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none focus:border-[#B86B2A]"
              />
            </div>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Website Link
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Budget Min/Max & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Min Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={priceMin}
                onChange={(e) => setPriceMin(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Max Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#171412] block mb-1">
                Rating (1 - 5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 4.8)}
                className="w-full px-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-[#171412] block mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes on capacity, package pricing, catering rules..."
              className="w-full px-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl text-xs text-[#171412] focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#EDE2D3] bg-[#FBF7EF] hover:bg-[#F8F0E4] text-xs font-semibold text-[#171412]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Vendor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
