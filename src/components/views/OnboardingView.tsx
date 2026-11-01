import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Globe,
  FileText,
  Upload,
  ArrowRight,
  Sparkles,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { useAuth, DEFAULT_NEUTRAL_AVATAR } from '../../context/AuthContext';

interface OnboardingViewProps {
  onComplete: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onNavigate }) => {
  const { user, updateProfileData, getIdToken } = useAuth();

  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>(
    (user.preferredLanguage as any) || 'English'
  );
  const [bio, setBio] = useState(user.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || DEFAULT_NEUTRAL_AVATAR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please choose a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file must be under 5MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(DEFAULT_NEUTRAL_AVATAR);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalAvatarUrl = avatarPreview;

      // If user uploaded a new local file (data URL)
      if (avatarPreview.startsWith('data:image/') && avatarPreview !== DEFAULT_NEUTRAL_AVATAR) {
        try {
          const token = await getIdToken();
          const mimeMatch = avatarPreview.match(/^data:(image\/[a-zA-Z+]+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
          const base64Data = avatarPreview.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

          const uploadRes = await fetch('/api/users/avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType,
            }),
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (data.profile?.photo_url) {
              finalAvatarUrl = data.profile.photo_url;
            }
          }
        } catch (uploadErr) {
          console.warn('Avatar upload fallback to local storage:', uploadErr);
        }
      }

      await updateProfileData({
        name: fullName.trim(),
        avatar: finalAvatarUrl,
        phone: phone.trim(),
        city: city.trim(),
        preferredLanguage,
        bio: bio.trim(),
        onboardingCompleted: true,
      });

      setIsSubmitting(false);
      onComplete();
      onNavigate('home');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await updateProfileData({
        name: fullName.trim() || user.name || user.email?.split('@')[0] || 'Planora Member',
        avatar: user.avatar || DEFAULT_NEUTRAL_AVATAR,
        onboardingCompleted: true,
      });
      setIsSubmitting(false);
      onComplete();
      onNavigate('home');
    } catch {
      setIsSubmitting(false);
      onComplete();
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#FBE8D3]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#EDE2D3]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-xl auth-glass-card p-6 sm:p-9 relative z-10 text-left">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EDE2D3]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#B86B2A] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-semibold text-[#7A3D19] uppercase tracking-wider">
              Profile Personalization
            </span>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-xs font-semibold text-[#6D6A66] hover:text-[#7A3D19] transition-colors cursor-pointer"
          >
            Skip for now →
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B86B2A] to-[#7A3D19] flex items-center justify-center text-[#FBF7EF] shadow-md mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
            Welcome to Planora AI{fullName ? `, ${fullName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-1.5 max-w-md mx-auto">
            Personalize your event planning workspace. You can complete this now or customize it anytime later in your profile.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-[#FDE8E6] border border-[#F5A9A4] text-[#C5221F] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Profile Picture Upload Section */}
          <div className="p-4 rounded-2xl bg-white/60 border border-[#EDE2D3] flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={avatarPreview}
                alt="Profile Avatar Preview"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#B86B2A]/30 shadow-sm bg-[#EDE2D3]"
              />
              <label
                htmlFor="onboarding-avatar-file"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="text-xs font-semibold text-[#171412]">Profile Picture (Optional)</div>
              <p className="text-[11px] text-[#928B83]">
                Upload your portrait or logo. Maximum size 5MB.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label
                  htmlFor="onboarding-avatar-file"
                  className="px-3 py-1.5 rounded-xl bg-[#FBE8D3] hover:bg-[#F5DEC3] text-[#7A3D19] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </label>
                <input
                  id="onboarding-avatar-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                {avatarPreview !== DEFAULT_NEUTRAL_AVATAR && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FDE8E6] text-[#C5221F] border border-[#EDE2D3] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name Field (Required) */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="onboarding-name">
              Full Name <span className="text-[#B86B2A]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="onboarding-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abhishek Gupta"
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412]"
              />
            </div>
          </div>

          {/* Contact & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="onboarding-phone">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="onboarding-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412]"
                />
              </div>
            </div>

            {/* Preferred City / Location */}
            <div>
              <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="onboarding-city">
                City / Event Location (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="onboarding-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Goa, Mumbai, Udaipur"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412]"
                />
              </div>
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="onboarding-lang">
              Preferred Language for AI Copilot
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <Globe className="w-4 h-4" />
              </div>
              <select
                id="onboarding-lang"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Hinglish">Hinglish (Casual Hindi-English)</option>
              </select>
            </div>
          </div>

          {/* Short Bio / Description */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="onboarding-bio">
              Event Planning Goals / Bio (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3.5 pointer-events-none text-[#928B83]">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="onboarding-bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Planning a destination beach wedding in Goa for 250 guests with music and royal banquet."
                className="w-full pl-10 pr-4 py-2 bg-white/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Complete Profile & Enter Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full sm:w-auto py-3 px-5 rounded-full bg-white/80 hover:bg-white text-[#6D6A66] hover:text-[#171412] border border-[#EDE2D3] text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
