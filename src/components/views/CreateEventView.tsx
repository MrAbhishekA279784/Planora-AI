import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Heart,
  Gift,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { AppRoute, EventItem, EventType } from '../../types';
import { formatINR } from '../../utils/calculations';

interface CreateEventViewProps {
  onCreateEvent: (newEvent: EventItem) => void;
  onBack: () => void;
  onRouteChange: (route: AppRoute) => void;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({
  onCreateEvent,
  onBack,
  onRouteChange,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Details
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);

  // Step 2: Preferences
  const [themeStyle, setThemeStyle] = useState('Classic Elegant');
  const [settingType, setSettingType] = useState('Indoor & Outdoor');
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);

  // Step 3: Budget
  const [totalBudget, setTotalBudget] = useState<number>(500000);
  const [budgetFlexibility, setBudgetFlexibility] = useState('Flexible (+/- 10%)');

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; date?: string; location?: string }>({});

  const validateStep1 = () => {
    const errs: typeof errors = {};
    if (!eventName.trim()) errs.name = 'Please provide an event name';
    if (!location.trim()) errs.location = 'Please provide a location';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleFinishCreate = () => {
    const newEvent: EventItem = {
      id: `ev-${Date.now()}`,
      name: eventName,
      subtitle: `${themeStyle} in ${location}`,
      eventType,
      date: eventDate || 'Date TBD',
      rawDate: eventDate || new Date().toISOString().split('T')[0],
      location,
      guestCount,
      status: 'planning',
      completionPercent: 0,
      totalBudget,
      image:
        eventType === 'wedding'
          ? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'
          : eventType === 'birthday'
          ? 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80'
          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      budgetCategories: totalBudget > 0 ? [
        { id: `b1-${Date.now()}`, name: 'Venue', amount: Math.round(totalBudget * 0.38), percentage: 38, color: '#7A3D19' },
        { id: `b2-${Date.now()}`, name: 'Catering', amount: Math.round(totalBudget * 0.22), percentage: 22, color: '#B86B2A' },
        { id: `b3-${Date.now()}`, name: 'Decoration', amount: Math.round(totalBudget * 0.16), percentage: 16, color: '#D7A34B' },
        { id: `b4-${Date.now()}`, name: 'Photography', amount: Math.round(totalBudget * 0.12), percentage: 12, color: '#4A2C1B' },
        { id: `b5-${Date.now()}`, name: 'Entertainment & Others', amount: Math.round(totalBudget * 0.12), percentage: 12, color: '#6D6A66' },
      ] : [],
      tasks: [],
    };

    onCreateEvent(newEvent);
    onRouteChange('my-events');
  };

  return (
    <div className="max-w-xl mx-auto pb-24 text-left space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={step > 1 ? () => setStep((step - 1) as any) : onBack}
          className="w-9 h-9 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] flex items-center justify-center hover:bg-[#F8F0E4]"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#171412]">
            Create New Event
          </h1>
          <div className="text-xs text-[#6D6A66]">
            Step {step} of 4: {step === 1 ? 'Details' : step === 2 ? 'Preferences' : step === 3 ? 'Budget' : 'Review'}
          </div>
        </div>
      </div>

      {/* 4-Step Progress Stepper */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FFFCF6] border border-[#EDE2D3] rounded-2xl">
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Preferences' },
          { num: 3, label: 'Budget' },
          { num: 4, label: 'Review' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.num
                  ? 'bg-[#7A3D19] text-white shadow-xs'
                  : step > s.num
                  ? 'bg-[#16A66A] text-white'
                  : 'bg-[#F8F0E4] text-[#928B83] border border-[#EDE2D3]'
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-semibold ${step === s.num ? 'text-[#7A3D19]' : 'text-[#928B83]'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Details */}
      {step === 1 && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-5">
          {/* Event Type */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#171412] block">Event Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: 'wedding' as const, label: 'Wedding', icon: Heart },
                { type: 'birthday' as const, label: 'Birthday', icon: Gift },
                { type: 'community' as const, label: 'Community', icon: Building2 },
                { type: 'other' as const, label: 'Other', icon: HelpCircle },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = eventType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setEventType(item.type)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                      isSelected
                        ? 'bg-[#FBE8D3] border-[#B86B2A] text-[#7A3D19] shadow-2xs'
                        : 'bg-[#FBF7EF] border-[#EDE2D3] text-[#6D6A66] hover:bg-[#F8F0E4]'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 text-[#B86B2A]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Name */}
          <div className="space-y-1">
            <label className="font-bold text-xs text-[#171412] block">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Riya & Karan Wedding"
              className="w-full p-3 bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl text-xs sm:text-sm text-[#171412] focus:outline-none"
            />
            {errors.name && <p className="text-[11px] text-[#E94C45]">{errors.name}</p>}
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-xs text-[#171412] block">Event Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="Select date"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl text-xs text-[#171412] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-xs text-[#171412] block">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city or venue"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl text-xs text-[#171412] focus:outline-none"
                />
              </div>
              {errors.location && <p className="text-[11px] text-[#E94C45]">{errors.location}</p>}
            </div>
          </div>

          {/* Expected Guests */}
          <div className="space-y-1">
            <label className="font-bold text-xs text-[#171412] block">Expected Guests</label>
            <div className="relative">
              <Users className="w-4 h-4 text-[#928B83] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl text-xs text-[#171412] focus:outline-none cursor-pointer"
              >
                <option value={50}>50 Guests (Intimate)</option>
                <option value={150}>150 Guests (Medium)</option>
                <option value={300}>300 Guests (Grand)</option>
                <option value={500}>500+ Guests (Large Destination)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-2xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Preferences */}
      {step === 2 && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#171412] block">Theme / Mood Style</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Beachside Elegant', 'Royal Traditional', 'Minimal & Modern', 'Boho Garden'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setThemeStyle(style)}
                  className={`p-3 rounded-2xl border text-left font-semibold transition-all ${
                    themeStyle === style
                      ? 'bg-[#FBE8D3] border-[#B86B2A] text-[#7A3D19]'
                      : 'bg-[#FBF7EF] border-[#EDE2D3] text-[#6D6A66]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-xs text-[#171412] block">Preferred Setting</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['Beachfront Lawn', 'Indoor Ballroom', 'Private Villa'].map((set) => (
                <button
                  key={set}
                  type="button"
                  onClick={() => setSettingType(set)}
                  className={`p-2.5 rounded-xl border font-semibold transition-all ${
                    settingType === set
                      ? 'bg-[#FBE8D3] border-[#B86B2A] text-[#7A3D19]'
                      : 'bg-[#FBF7EF] border-[#EDE2D3] text-[#6D6A66]'
                  }`}
                >
                  {set}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-xs text-[#171412] block">Must-Have Services</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Venue', 'Catering', 'Decoration', 'Photography', 'Entertainment', 'Makeup'].map((srv) => {
                const isSelected = servicesNeeded.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setServicesNeeded(servicesNeeded.filter((s) => s !== srv));
                      } else {
                        setServicesNeeded([...servicesNeeded, srv]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                      isSelected
                        ? 'bg-[#E1F5E9] border-[#16A66A] text-[#16A66A]'
                        : 'bg-[#FBF7EF] border-[#EDE2D3] text-[#6D6A66]'
                    }`}
                  >
                    <span>{srv}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-2xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Continue to Budget</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: Budget */}
      {step === 3 && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#171412] block">Total Target Budget (INR)</label>
            <div className="relative">
              <span className="text-lg font-bold text-[#7A3D19] absolute left-4 top-1/2 -translate-y-1/2">₹</span>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseInt(e.target.value, 10) || 0)}
                className="w-full pl-8 pr-4 py-3 bg-[#FBF7EF] border border-[#EDE2D3] focus:border-[#B86B2A] rounded-2xl font-serif text-2xl font-bold text-[#171412] focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-[#928B83]">
              Formatted: {formatINR(totalBudget)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-xs text-[#171412] block">Budget Flexibility</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['Strict Budget', 'Flexible (+/- 10%)', 'Open Budget'].map((flex) => (
                <button
                  key={flex}
                  type="button"
                  onClick={() => setBudgetFlexibility(flex)}
                  className={`p-2.5 rounded-xl border font-semibold transition-all ${
                    budgetFlexibility === flex
                      ? 'bg-[#FBE8D3] border-[#B86B2A] text-[#7A3D19]'
                      : 'bg-[#FBF7EF] border-[#EDE2D3] text-[#6D6A66]'
                  }`}
                >
                  {flex}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation preview */}
          <div className="p-4 bg-[#F8F0E4] rounded-2xl text-xs space-y-2">
            <span className="font-bold text-[#7A3D19] block">Estimated Smart Allocation:</span>
            <div className="flex justify-between text-[#6D6A66]">
              <span>Venue & Hospitality (~38%)</span>
              <span className="font-bold text-[#171412]">{formatINR(Math.round(totalBudget * 0.38))}</span>
            </div>
            <div className="flex justify-between text-[#6D6A66]">
              <span>Catering & Drinks (~22%)</span>
              <span className="font-bold text-[#171412]">{formatINR(Math.round(totalBudget * 0.22))}</span>
            </div>
            <div className="flex justify-between text-[#6D6A66]">
              <span>Theme Decor (~16%)</span>
              <span className="font-bold text-[#171412]">{formatINR(Math.round(totalBudget * 0.16))}</span>
            </div>
            <div className="flex justify-between text-[#6D6A66]">
              <span>Photography & Others (~24%)</span>
              <span className="font-bold text-[#171412]">{formatINR(Math.round(totalBudget * 0.24))}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-2xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Review Event</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: Review & Final Create */}
      {step === 4 && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="border-b border-[#EDE2D3] pb-3">
            <h2 className="font-serif font-bold text-xl text-[#171412]">
              Review Your Event Plan
            </h2>
            <p className="text-xs text-[#6D6A66]">
              Confirm your event outline before initializing the planning workspace.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#EDE2D3]/60">
              <span className="text-[#928B83]">Event Name</span>
              <span className="font-bold text-[#171412]">{eventName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EDE2D3]/60">
              <span className="text-[#928B83]">Type</span>
              <span className="font-semibold text-[#171412] capitalize">{eventType}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EDE2D3]/60">
              <span className="text-[#928B83]">Date & Location</span>
              <span className="font-semibold text-[#171412]">{eventDate} • {location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EDE2D3]/60">
              <span className="text-[#928B83]">Guest Capacity</span>
              <span className="font-semibold text-[#171412]">{guestCount} Guests</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EDE2D3]/60">
              <span className="text-[#928B83]">Theme & Setting</span>
              <span className="font-semibold text-[#171412]">{themeStyle} ({settingType})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EDE2D3]/60">
              <span className="text-[#928B83]">Target Budget</span>
              <span className="font-bold text-[#7A3D19]">{formatINR(totalBudget)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#928B83]">Selected Services</span>
              <span className="font-semibold text-[#171412]">{servicesNeeded.join(', ')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishCreate}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>Create Event & Open Workspace</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
