import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import ModernButton from './ModernButton';
import { AwardsService, Award } from '../services/awardsService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  award?: Award | null;
}

const AwardModal: React.FC<AwardModalProps> = ({ isOpen, onClose, onSuccess, award }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issuer: '',
    date_received: '',
    category: 'Autres'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (award) {
      setFormData({
        title: award.title,
        description: award.description || '',
        issuer: award.issuer,
        date_received: award.date_received,
        category: award.category
      });
    } else {
      setFormData({
        title: '',
        description: '',
        issuer: '',
        date_received: '',
        category: 'Autres'
      });
    }
  }, [award, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuer.trim() || !formData.date_received) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
      if (!user) return;

      if (award) {
        // Mise à jour
        const success = await AwardsService.updateAward(award.id, formData);
        if (success) {
          showSuccessNotification('Récompense mise à jour avec succès !');
          onSuccess();
          onClose();
        } else {
          showErrorNotification('Erreur lors de la mise à jour');
        }
      } else {
        // Création
        const newAward = await AwardsService.createAward({
          user_id: user.id,
          ...formData
        });
        if (newAward) {
          showSuccessNotification('Récompense ajoutée avec succès !');
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
            {award ? 'Modifier la récompense' : 'Ajouter une récompense'}
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
              Titre de la récompense *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              placeholder="Ex: Certification AWS, Prix du meilleur projet..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organisme *
            </label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              placeholder="Ex: Amazon Web Services, Université..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date de réception *
            </label>
            <input
              type="date"
              value={formData.date_received}
              onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              required
            />
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
              {AwardsService.getAwardCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
              placeholder="Décrivez cette récompense..."
              rows={3}
            />
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
              disabled={isLoading || !formData.title.trim() || !formData.issuer.trim() || !formData.date_received}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {award ? 'Mise à jour...' : 'Ajout...'}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {award ? 'Mettre à jour' : 'Ajouter'}
                </>
              )}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AwardModal;
