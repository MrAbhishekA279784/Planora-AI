import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Camera,
  Trash2,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Home,
  Calendar,
  Sparkles,
  Store,
  Bot,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { AppRoute, EventItem } from '../../types';
import { useAuth, DEFAULT_NEUTRAL_AVATAR } from '../../context/AuthContext';

interface ProfileViewProps {
  onRouteChange: (route: AppRoute) => void;
  events?: EventItem[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onRouteChange, events = [] }) => {
  const { user, updateProfileData, logout, getIdToken } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>(
    (user.preferredLanguage as any) || 'English'
  );
  const [bio, setBio] = useState(user.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || DEFAULT_NEUTRAL_AVATAR);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when user profile updates
  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setPreferredLanguage((user.preferredLanguage as any) || 'English');
    setBio(user.bio || '');
    setAvatarPreview(user.avatar || DEFAULT_NEUTRAL_AVATAR);
  }, [user]);

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

  const handleCancelEdit = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setPreferredLanguage((user.preferredLanguage as any) || 'English');
    setBio(user.bio || '');
    setAvatarPreview(user.avatar || DEFAULT_NEUTRAL_AVATAR);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);

    try {
      let finalAvatarUrl = avatarPreview;

      // Handle custom file upload
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
          console.warn('Avatar upload fallback to local state:', uploadErr);
        }
      }

      await updateProfileData({
        name: name.trim(),
        avatar: finalAvatarUrl,
        phone: phone.trim(),
        city: city.trim(),
        preferredLanguage,
        bio: bio.trim(),
      });

      setIsSaving(false);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  const handleSignOutClick = async () => {
    await logout();
    onRouteChange('landing');
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 text-left space-y-6">
      {/* Page Title & Back to Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-0.5">
            Manage your personal details, workspace preferences and account security
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#FDE8E6] border border-[#F5A9A4] text-[#C5221F] text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Profile Card (View or Edit Mode) */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 sm:p-8 shadow-xs">
        {isEditing ? (
          /* ================= EDIT MODE FORM ================= */
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE2D3]">
              <h2 className="font-serif font-bold text-lg text-[#171412]">Edit Profile Details</h2>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-[#928B83] hover:text-[#171412] flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>

            {/* Avatar Uploader */}
            <div className="p-4 rounded-2xl bg-[#FBF7EF] border border-[#EDE2D3] flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarPreview}
                  alt={name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-[#B86B2A]/30 shadow-xs bg-[#EDE2D3]"
                />
                <label
                  htmlFor="profile-avatar-file"
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload New Photo"
                >
                  <Camera className="w-5 h-5" />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="text-xs font-bold text-[#171412]">Profile Picture</div>
                <p className="text-[11px] text-[#928B83]">
                  Upload a photo under 5MB (JPEG, PNG, or WebP).
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                  <label
                    htmlFor="profile-avatar-file"
                    className="px-3 py-1.5 rounded-xl bg-[#FBE8D3] hover:bg-[#F5DEC3] text-[#7A3D19] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Picture</span>
                  </label>
                  <input
                    id="profile-avatar-file"
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
                      <span>Remove Picture</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#171412] mb-1.5" htmlFor="edit-name">
                Full Name <span className="text-[#B86B2A]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhishek Gupta"
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412]"
                />
              </div>
            </div>

            {/* Email (Readonly with note) */}
            <div>
              <label className="block text-xs font-bold text-[#171412] mb-1.5" htmlFor="edit-email">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="edit-email"
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F0E4]/60 text-xs sm:text-sm rounded-xl border border-[#EDE2D3] text-[#6D6A66] cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#928B83] mt-1">
                Your email is verified through Firebase Authentication. Changing email requires credential reauthentication.
              </p>
            </div>

            {/* Phone & City Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171412] mb-1.5" htmlFor="edit-phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171412] mb-1.5" htmlFor="edit-city">
                  City / Event Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="edit-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Goa, Mumbai, Udaipur"
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412]"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-[#171412] mb-1.5" htmlFor="edit-lang">
                Preferred Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                  <Globe className="w-4 h-4" />
                </div>
                <select
                  id="edit-lang"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Hinglish">Hinglish (Casual Hindi-English)</option>
                </select>
              </div>
            </div>

            {/* Bio / Planning Goals */}
            <div>
              <label className="block text-xs font-bold text-[#171412] mb-1.5" htmlFor="edit-bio">
                Planning Goals & Notes
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3.5 pointer-events-none text-[#928B83]">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  id="edit-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short note about the events you organize or specific planning preferences."
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] resize-none"
                />
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-6 rounded-xl bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-[#F8F0E4] border border-[#EDE2D3] text-[#6D6A66] hover:text-[#171412] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ================= VIEW MODE ================= */
          <div className="space-y-6">
            {/* Header info row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={user.avatar || DEFAULT_NEUTRAL_AVATAR}
                alt={user.name || 'Member'}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#EDE2D3] shadow-sm bg-[#EDE2D3] shrink-0"
              />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-serif text-2xl font-bold text-[#171412]">
                    {user.name || 'Planora Member'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E1F5E9] text-[#16A66A] text-[10px] font-bold border border-[#C3ECD3]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Workspace</span>
                  </span>
                </div>

                <div className="text-xs text-[#6D6A66] flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#928B83]" />
                    {user.email || 'No email attached'}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#928B83]" />
                      {user.phone}
                    </span>
                  )}
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#928B83]" />
                      {user.city}
                    </span>
                  )}
                </div>

                {user.bio ? (
                  <p className="text-xs text-[#6D6A66] pt-2 italic max-w-xl">
                    "{user.bio}"
                  </p>
                ) : (
                  <p className="text-xs text-[#928B83] pt-2">
                    No bio added yet. Click &ldquo;Edit Profile&rdquo; to add your location and event goals.
                  </p>
                )}
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#EDE2D3]">
              <div className="p-3.5 bg-[#FBF7EF] rounded-2xl border border-[#EDE2D3]">
                <div className="text-[11px] font-medium text-[#928B83]">Preferred Language</div>
                <div className="font-semibold text-xs text-[#171412] mt-0.5">
                  {user.preferredLanguage || 'English'}
                </div>
              </div>

              <div className="p-3.5 bg-[#FBF7EF] rounded-2xl border border-[#EDE2D3]">
                <div className="text-[11px] font-medium text-[#928B83]">Active Saved Events</div>
                <div className="font-semibold text-xs text-[#171412] mt-0.5">
                  {events.length} {events.length === 1 ? 'Event' : 'Events'}
                </div>
              </div>

              <div className="p-3.5 bg-[#FBF7EF] rounded-2xl border border-[#EDE2D3]">
                <div className="text-[11px] font-medium text-[#928B83]">Account Security</div>
                <div className="font-semibold text-xs text-[#16A66A] mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Firebase Auth Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Quick Links */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-2 shadow-2xs divide-y divide-[#EDE2D3]/60">
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => onRouteChange('home')}
            className="w-full px-4 py-3 text-xs font-semibold text-[#171412] hover:bg-[#F8F0E4] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-[#7A3D19]" />
              <span>Workspace Home</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#928B83]" />
          </button>

          <button
            onClick={() => onRouteChange('my-events')}
            className="w-full px-4 py-3 text-xs font-semibold text-[#171412] hover:bg-[#F8F0E4] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#7A3D19]" />
              <span>My Events</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#928B83]" />
          </button>

          <button
            onClick={() => onRouteChange('event-studio')}
            className="w-full px-4 py-3 text-xs font-semibold text-[#171412] hover:bg-[#F8F0E4] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#B86B2A]" />
              <span>Event Themes</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#928B83]" />
          </button>

          <button
            onClick={() => onRouteChange('vendors')}
            className="w-full px-4 py-3 text-xs font-semibold text-[#171412] hover:bg-[#F8F0E4] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-[#7A3D19]" />
              <span>Vendors Marketplace</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#928B83]" />
          </button>

          <button
            onClick={() => onRouteChange('ai-copilot')}
            className="w-full px-4 py-3 text-xs font-semibold text-[#171412] hover:bg-[#F8F0E4] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-[#B86B2A]" />
              <span>AI Copilot</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#928B83]" />
          </button>
        </div>

        {/* Sign Out Option */}
        <div className="pt-1">
          <button
            onClick={handleSignOutClick}
            className="w-full px-4 py-3 text-xs font-semibold text-[#E94C45] hover:bg-[#FDE8E6] rounded-2xl flex items-center gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
