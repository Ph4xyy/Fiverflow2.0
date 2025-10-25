import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

const CancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Annulé</h1>
          <p className="text-gray-600">
            Votre paiement a été annulé. Aucun frais n'a été facturé à votre compte.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Besoin d'Aide ?</h3>
            <p className="text-sm text-yellow-700">
              Si vous avez rencontré des problèmes lors du checkout, veuillez contacter notre équipe de support.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate('/subscription')}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'Accueil
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Vous pouvez retourner à notre page d'abonnement à tout moment pour finaliser votre achat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
