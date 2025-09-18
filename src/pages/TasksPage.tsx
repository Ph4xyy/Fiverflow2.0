// src/pages/TasksPage.tsx
import React from 'react';
import Layout from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import TaskManager from '../components/TaskManager';
import { CheckSquare } from 'lucide-react';

const TasksPage: React.FC = () => {
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  // Chargement (visuel sombre cohérent)
  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-slate-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Accès restreint
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
      <div className="space-y-6 p-4 sm:p-0">
        {/* Header (même style que nav : carré arrondi + dégradé cohérent) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center text-white shadow-glow-sm">
            <CheckSquare size={18} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Tasks & Time Tracking</h1>
            <p className="text-sm sm:text-base text-slate-400">
              Manage your project tasks and track time spent on each activity.
            </p>
          </div>
        </div>

        {/* Task Manager (aucune logique modifiée) */}
        <TaskManager />
      </div>
    </Layout>
  );
};

export default TasksPage;
