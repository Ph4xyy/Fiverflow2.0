import React from 'react';
import { useSubscriptionPermissions } from '../hooks/useSubscriptionPermissions';
import { AlertTriangle, CheckCircle, Crown, Zap, TrendingUp } from 'lucide-react';
import ModernButton from './ModernButton';

interface SubscriptionLimitsProps {
  resource: 'clients' | 'orders' | 'projects' | 'storage' | 'teamMembers';
  currentCount: number;
  onUpgrade?: () => void;
}

const SubscriptionLimits: React.FC<SubscriptionLimitsProps> = ({
  resource,
  currentCount,
  onUpgrade
}) => {
  const { subscription, limits, isWithinLimit, getRemainingLimit } = useSubscriptionPermissions();

  const resourceLabels = {
    clients: 'Clients',
    orders: 'Commandes',
    projects: 'Projets',
    storage: 'Stockage (GB)',
    teamMembers: 'Membres d\'équipe'
  };

  const limitKey = `max${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof typeof limits;
  const limit = limits[limitKey];
  const remaining = getRemainingLimit(limitKey, currentCount);
  const isUnlimited = limit === -1;
  const isAtLimit = !isWithinLimit(limitKey, currentCount);

  if (isUnlimited) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle size={16} />
        <span className="text-sm">Illimité</span>
      </div>
    );
  }

  if (isAtLimit) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertTriangle size={16} />
          <span className="font-semibold">Limite atteinte</span>
        </div>
        <p className="text-gray-400 text-sm mb-3">
          Vous avez atteint la limite de {limit} {resourceLabels[resource].toLowerCase()} avec votre plan {subscription?.plan_display_name}.
        </p>
        <div className="flex items-center gap-2">
          <ModernButton
            size="sm"
            onClick={onUpgrade || (() => window.location.href = '/upgrade')}
          >
            <Crown size={14} className="mr-1" />
            Upgrader
          </ModernButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-yellow-400">
      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      <span className="text-sm">
        {remaining} {resourceLabels[resource].toLowerCase()} restant{remaining > 1 ? 's' : ''}
      </span>
    </div>
  );
};

export default SubscriptionLimits;
