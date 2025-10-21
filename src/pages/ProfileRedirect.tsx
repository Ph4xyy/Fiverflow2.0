import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Loader2 } from 'lucide-react';

const ProfileRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToUserProfile = async () => {
      if (!user) {
        // Si pas connecté, rediriger vers la page de connexion
        navigate('/login');
        return;
      }

      try {
        // Récupérer le username de l'utilisateur connecté
        const { data: userProfile, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();

        if (error || !userProfile?.username) {
          console.error('Erreur lors de la récupération du profil:', error);
          // Rediriger vers les paramètres pour définir un username
          navigate('/settings');
          return;
        }

        // Rediriger vers le profil de l'utilisateur
        navigate(`/profile/${userProfile.username}`);
      } catch (err) {
        console.error('Erreur lors de la redirection:', err);
        navigate('/settings');
      }
    };

    redirectToUserProfile();
  }, [user, navigate]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Redirection vers votre profil...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileRedirect;
