import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegistrationForm from '../components/RegistrationForm';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Redirection automatique vers le dashboard
  React.useEffect(() => {
    console.log('🔄 RegisterPage: Auth disabled - redirecting to dashboard');
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return <RegistrationForm />;
};

export default RegisterPage;