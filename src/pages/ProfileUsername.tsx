import React from 'react';
import { useParams } from 'react-router-dom';
import ProfilePageNew from './ProfilePageNew';

const ProfileUsername: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return <ProfilePageNew username={username} />;
};

export default ProfileUsername;
