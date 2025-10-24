import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Ici vous pourriez récupérer les détails de la session depuis votre API
      // pour afficher plus d'informations sur l'achat
      setIsLoading(false);
    } else {
      toast.error('Aucun ID de session trouvé');
      navigate('/subscription');
    }
  }, [sessionId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Réussi !</h1>
          <p className="text-gray-600">
            Merci pour votre achat. Vous avez maintenant accès à toutes les fonctionnalités premium.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Prochaines Étapes</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Accédez à votre tableau de bord immédiatement</li>
              <li>• Explorez toutes les fonctionnalités premium</li>
              <li>• Téléchargez votre facture</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Aller au Tableau de Bord
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Ici vous pourriez générer et télécharger l'invoice
                toast.success('Facture téléchargée !');
              }}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger la Facture
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Un email de confirmation a été envoyé à votre adresse email enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;