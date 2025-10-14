// src/pages/WorkboardPage.tsx (renamed from TasksPage)
import React from 'react';
import Layout, { cardClass } from '../components/Layout';
import TodoTable from '../components/TodoTable';
import PlanRestrictedPage from '../components/PlanRestrictedPage';

import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import TaskManager from '../components/TaskManager';
import { CheckSquare } from 'lucide-react';

const WorkboardPage: React.FC = () => {
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="ml-4 text-slate-400">{'Loading...'}</p>
          </div>
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
      <div className="space-y-6 p-4 sm:p-0 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center text-white shadow-glow-sm">
            <CheckSquare size={18} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{'Workboard'}</h1>
            <p className="text-sm sm:text-base text-slate-400">
              {'Centralize task tracking, time entries, and advanced to-do table.'}
            </p>
          </div>
        </div>

        {/* Carte sombre + scope pour forcer le nouveau thème à l’intérieur */}
        <div className={`${cardClass} p-0 bg-[#0B0E14] border-[#1C2230] min-w-0 overflow-hidden`}>
          <div className="task-scope p-4 sm:p-5">
            <TaskManager showRecentTimeEntries={false} />
          </div>
        </div>

        <div className={`${cardClass} p-0 bg-[#0B0E14] border-[#1C2230] min-w-0 overflow-hidden`}>
          <div className="task-scope p-4 sm:p-5">
            <TodoTable />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkboardPage;
