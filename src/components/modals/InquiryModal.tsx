import React, { useState } from 'react';
import { X, Send, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { VendorItem } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface InquiryModalProps {
  vendor: VendorItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  vendor,
  isOpen,
  onClose,
}) => {
  useBodyScrollLock(isOpen);

  const [eventDate, setEventDate] = useState('15 Feb 2026');
  const [guestCount, setGuestCount] = useState(300);
  const [message, setMessage] = useState(
    'Hello! We love your portfolio and are planning a beachside celebration in Goa. Could you share your detailed package quotation and current availability for this date?'
  );
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl max-w-lg w-full shadow-2xl p-6 text-left space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
          <div className="flex items-center gap-3">
            <img
              src={vendor.image}
              alt={vendor.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-serif font-bold text-base text-[#171412]">
                Contact {vendor.name}
              </h3>
              <div className="text-xs text-[#928B83]">{vendor.category} • {vendor.location}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8F0E4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#16A66A] mx-auto" />
            <h4 className="font-serif font-bold text-lg text-[#171412]">Inquiry Sent!</h4>
            <p className="text-xs text-[#6D6A66]">
              {vendor.name} has received your event inquiry. You will be notified when they reply.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#171412] block mb-1">Target Date</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171412] block mb-1">Estimated Guests</label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#171412] block mb-1">Message to Vendor</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl text-xs text-[#171412] focus:outline-none resize-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#EDE2D3]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F8F0E4] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
