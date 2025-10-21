import React from 'react';
import { useParams } from 'react-router-dom';
import UniversalProfilePageNew from '../components/UniversalProfilePageNew';

const ProfileUsername: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return <UniversalProfilePageNew username={username} />;
};

export default ProfileUsername;
