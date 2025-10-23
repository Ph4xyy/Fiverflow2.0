import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { OrdersService, Order } from '../services/ordersService';
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Edit, 
  Lock, 
  Unlock, 
  DollarSign, 
  Calendar, 
  User, 
  Mail, 
  Globe,
  Settings,
  Save,
  X,
  Loader2
} from 'lucide-react';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Paramètres de visibilité
  const [visibilitySettings, setVisibilitySettings] = useState({
    showPrice: true,
    showClient: true,
    showDescription: true,
    isPublic: true
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const projectData = await OrdersService.getOrderById(projectId);
        if (projectData) {
          setProject(projectData);
          setIsOwner(projectData.user_id === user?.id);
          
          // Simuler les likes et vues (à remplacer par de vraies données)
          setLikes(Math.floor(Math.random() * 50) + 5);
          setViews(Math.floor(Math.random() * 200) + 20);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, user]);

  const handleLike = async () => {
    if (!project) return;
    
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    
    // TODO: Implémenter l'API de like
    console.log('Like toggled:', !hasLiked);
  };

  const handleSaveVisibility = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      // TODO: Sauvegarder les paramètres de visibilité
      console.log('Saving visibility settings:', visibilitySettings);
      
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // TODO: Afficher notification de succès
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-[#9c68f2] animate-spin mb-4" />
            <p className="text-gray-400">Chargement du projet...</p>
          </div>
        </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Projet non trouvé</h1>
          <p className="text-gray-400 mb-6">Ce projet n'existe pas ou a été supprimé</p>
          <ModernButton onClick={() => navigate('/profile')}>
            <ArrowLeft size={16} className="mr-2" />
            Retour au profil
          </ModernButton>
        </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations du projet */}
            <ModernCard>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{project.title}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        project.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {project.status === 'completed' ? 'Terminé' :
                         project.status === 'in_progress' ? 'En cours' :
                         project.status === 'pending' ? 'En attente' : 'Annulé'}
                      </span>
                      {!visibilitySettings.isPublic && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
                          <Lock size={14} className="inline mr-1" />
                          Privé
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="flex gap-2">
                      <ModernButton
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Settings size={16} className="mr-2" />
                        {isEditing ? 'Annuler' : 'Paramètres'}
                      </ModernButton>
                    </div>
                  )}
                </div>

                {/* Description */}
                {visibilitySettings.showDescription && project.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-400 leading-relaxed">{project.description}</p>
                  </div>
                )}

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibilitySettings.showPrice && project.budget && (
                    <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                      <DollarSign size={20} className="text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Budget</p>
                        <p className="text-white font-semibold">{project.budget} {project.currency}</p>
                      </div>
                    </div>
                  )}

                  {project.due_date && (
                    <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                      <Calendar size={20} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Échéance</p>
                        <p className="text-white font-semibold">
                          {new Date(project.due_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {project.platform && (
                    <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                      <Globe size={20} className="text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Plateforme</p>
                        <p className="text-white font-semibold">{project.platform}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                    <Calendar size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Créé le</p>
                      <p className="text-white font-semibold">
                        {new Date(project.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Paramètres de visibilité (pour le propriétaire) */}
            {isOwner && isEditing && (
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Paramètres de visibilité</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-white">Afficher le prix</label>
                        <p className="text-xs text-gray-400">Permet aux autres de voir le budget</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibilitySettings.showPrice}
                          onChange={(e) => setVisibilitySettings({...visibilitySettings, showPrice: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-white">Afficher la description</label>
                        <p className="text-xs text-gray-400">Permet aux autres de voir la description</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibilitySettings.showDescription}
                          onChange={(e) => setVisibilitySettings({...visibilitySettings, showDescription: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-white">Projet public</label>
                        <p className="text-xs text-gray-400">Rendre le projet visible par tous</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibilitySettings.isPublic}
                          onChange={(e) => setVisibilitySettings({...visibilitySettings, isPublic: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#35414e]">
                    <ModernButton 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      <X size={16} className="mr-2" />
                      Annuler
                    </ModernButton>
                    <ModernButton 
                      onClick={handleSaveVisibility}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-red-400" />
                      <span className="text-gray-400">Likes</span>
                    </div>
                    <span className="text-white font-semibold">{likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-blue-400" />
                      <span className="text-gray-400">Vues</span>
                    </div>
                    <span className="text-white font-semibold">{views}</span>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Actions */}
            {!isOwner && (
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                  <div className="space-y-3">
                    <ModernButton
                      variant={hasLiked ? "default" : "outline"}
                      onClick={handleLike}
                      className="w-full"
                    >
                      <Heart size={16} className="mr-2" />
                      {hasLiked ? 'Liked' : 'Like'}
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Informations client (si visible) */}
            {visibilitySettings.showClient && project.client_name && (
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Client</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-gray-400" />
                      <span className="text-white">{project.client_name}</span>
                    </div>
                    {project.client_email && (
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-400">{project.client_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </ModernCard>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProjectDetailPage;
