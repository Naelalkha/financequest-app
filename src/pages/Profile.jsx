import React from 'react';
import ProfileView from '../features/identity/ProfileView';

/**
 * Profile Page - Simplified Router Component
 * 
 * Following the "CARTE" pattern:
 * - No business logic here
 * - Just imports ProfileView from features
 * - ProfileView handles its own layout (AppBackground already included)
 */
const Profile = () => {
  return <ProfileView />;
};

export default Profile;