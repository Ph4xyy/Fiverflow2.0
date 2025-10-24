import React from 'react';
import { useParams } from 'react-router-dom';
import PageProfile from './PageProfile';

const ProfileUsername: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return <PageProfile username={username} />;
};

export default ProfileUsername;
