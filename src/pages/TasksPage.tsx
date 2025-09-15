import React from 'react';
import Layout from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import TaskManager from '../components/TaskManager';
import { CheckSquare } from 'lucide-react';

const TasksPage: React.FC = () => {
  const { restrictions, loading: restrictionsLoading, checkAccess } = usePlanRestrictions();

  // Check if user has access to tasks
  if (restrictionsLoading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading...</p>
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
      <div className="space-y-6 p-4 sm:p-0">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-accent-blue dark:to-accent-purple rounded-lg flex items-center justify-center">
            <CheckSquare className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Tasks & Time Tracking</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
              Manage your project tasks and track time spent on each activity.
            </p>
          </div>
        </div>

        {/* Task Manager */}
        <TaskManager />
      </div>
    </Layout>
  );
};

export default TasksPage;