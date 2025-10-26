// src/pages/WorkboardPage.tsx (renamed from TasksPage)
import React from 'react';
import Layout, { cardClass } from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import ModernWorkboard from '../components/ModernWorkboard';

import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { CheckSquare } from 'lucide-react';

const WorkboardPage: React.FC = () => {
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-4 text-slate-400">{'Loading...'}</p>
        </div>
      </Layout>
    );
  }

  if (!checkAccess('tasks')) {
    return (
      <PlanRestrictedPage
        feature="tasks"
        currentPlan={restrictions?.plan || 'free'}
        isTrialActive={restrictions?.isTrialActive}
        trialDaysRemaining={restrictions?.trialDaysRemaining}
      />
    );
  }

  return (
    <Layout>
      <ModernWorkboard />
    </Layout>
  );
};

export default WorkboardPage;
