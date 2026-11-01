import React from 'react';
import { AppRoute, EventItem } from '../../types';
import { ProfileView } from './ProfileView';

interface ProfileMenuViewProps {
  onRouteChange: (route: AppRoute) => void;
  events?: EventItem[];
}

export const ProfileMenuView: React.FC<ProfileMenuViewProps> = ({
  onRouteChange,
  events = [],
}) => {
  return <ProfileView onRouteChange={onRouteChange} events={events} />;
};

export default ProfileMenuView;
