import React from 'react';
import { useParams } from 'react-router-dom';
import UniversalProfilePage from '../components/UniversalProfilePage';

const ProfileUsername: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return <UniversalProfilePage username={username} />;
};

export default ProfileUsername;
