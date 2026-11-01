import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Edit3 } from 'lucide-react';
import { UserProfile } from '../../../types';
import { DEFAULT_NEUTRAL_AVATAR } from '../../../context/AuthContext';

interface ProfileHeaderProps {
  user: UserProfile;
  isEditing: boolean;
  onEditClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isEditing, onEditClick }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <img
          src={user.avatar || DEFAULT_NEUTRAL_AVATAR}
          alt={user.name || 'Member'}
          className="w-24 h-24 rounded-full object-cover ring-4 ring-[#EDE2D3] shadow-sm bg-[#EDE2D3] shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
              {user.name || 'Planora Member'}
            </h1>
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
              No bio added yet. Click &ldquo;Edit Profile&rdquo; to customize your workspace preferences.
            </p>
          )}
        </div>
      </div>

      {!isEditing && (
        <button
          onClick={onEditClick}
          className="px-4 py-2 rounded-xl bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      )}
    </div>
  );
};
