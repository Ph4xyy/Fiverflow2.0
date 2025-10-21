import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import ModernButton from './ModernButton';
import { SkillsService, Skill } from '../services/skillsService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  skill?: Skill | null;
}

const SkillModal: React.FC<SkillModalProps> = ({ isOpen, onClose, onSuccess, skill }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: 'beginner' as Skill['level'],
    category: 'Général'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        level: skill.level,
        category: skill.category
      });
    } else {
      setFormData({
        name: '',
        level: 'beginner',
        category: 'Général'
      });
    }
  }, [skill, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
      if (!user) return;

      if (skill) {
        // Mise à jour
        const success = await SkillsService.updateSkill(skill.id, formData);
        if (success) {
          showSuccessNotification('Compétence mise à jour avec succès !');
          onSuccess();
          onClose();
        } else {
          showErrorNotification('Erreur lors de la mise à jour');
        }
      } else {
        // Création
        const newSkill = await SkillsService.createSkill({
          user_id: user.id,
          ...formData
        });
        if (newSkill) {
          showSuccessNotification('Compétence ajoutée avec succès !');
          onSuccess();
          onClose();
        } else {
          showErrorNotification('Erreur lors de la création');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      showErrorNotification('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e2938] rounded-lg w-full max-w-md border border-[#35414e]">
        <div className="flex items-center justify-between p-6 border-b border-[#35414e]">
          <h2 className="text-xl font-semibold text-white">
            {skill ? 'Modifier la compétence' : 'Ajouter une compétence'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#35414e] rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la compétence *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              placeholder="Ex: React, Photoshop, Marketing..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Niveau
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as Skill['level'] })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
            >
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
            >
              {SkillsService.getSkillCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <ModernButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </ModernButton>
            <ModernButton
              type="submit"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {skill ? 'Mise à jour...' : 'Ajout...'}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {skill ? 'Mettre à jour' : 'Ajouter'}
                </>
              )}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
