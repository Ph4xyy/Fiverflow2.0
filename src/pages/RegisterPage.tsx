import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegistrationForm from '../components/RegistrationForm';

const RegisterPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return <RegistrationForm />;
};

export default RegisterPage;