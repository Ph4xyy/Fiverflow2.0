import React, { useState } from 'react';
import Layout from './Layout';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MoreHorizontal,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  MessageSquare,
  BarChart3,
  Timer,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Target,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ModernWorkboardProps {}

const ModernWorkboard: React.FC<ModernWorkboardProps> = () => {
  const { user } = useAuth();
  const { tasks, timeEntries, loading, activeTimer, startTimer, stopTimer, refetchTasks } = useTasks();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Statistiques calculées
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const handleStartTimer = async (taskId?: string) => {
    const success = await startTimer(taskId);
    if (success) {
      toast.success('Timer started!');
    }
  };

  const handleStopTimer = async () => {
    const success = await stopTimer();
    if (success) {
      toast.success('Timer stopped!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c68f2]" />
          <p className="ml-3 text-gray-400">Loading workboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Workboard</h1>
            <p className="text-gray-400">Project management & task tracking</p>
          </div>
          <div className="flex gap-3">
            <ModernButton onClick={() => setShowFilters(!showFilters)} size="sm">
              <Filter className="mr-2" size={16} />
              Filters
            </ModernButton>
            <ModernButton size="sm">
              <Plus className="mr-2" size={16} />
              New Task
            </ModernButton>
          </div>
        </div>

        {/* Statistiques avec ModernCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard title="Total Tasks">
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-2">{totalTasks}</div>
              <div className="flex items-center text-sm text-gray-400">
                <BarChart3 size={16} className="mr-1" />
                All tasks
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <BarChart3 size={20} className="text-gray-400" />
              </div>
            </div>
          </ModernCard>

          <ModernCard title="Completed">
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-2">{completedTasks}</div>
              <div className="flex items-center text-sm text-green-400">
                <CheckCircle2 size={16} className="mr-1" />
                {completionRate.toFixed(0)}% completion rate
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <CheckCircle2 size={20} className="text-gray-400" />
              </div>
            </div>
          </ModernCard>

          <ModernCard title="In Progress">
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-2">{inProgressTasks}</div>
              <div className="flex items-center text-sm text-blue-400">
                <Activity size={16} className="mr-1" />
                Active tasks
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <Activity size={20} className="text-gray-400" />
              </div>
            </div>
          </ModernCard>

          <ModernCard title="Time Tracking">
            <div className="relative">
              <div className="text-3xl font-bold text-white mb-2">{formatDuration(totalActualHours)}</div>
              <div className="flex items-center text-sm text-purple-400">
                <Timer size={16} className="mr-1" />
                Total tracked
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <Timer size={20} className="text-gray-400" />
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Timer actif */}
        {activeTimer && (
          <ModernCard gradient>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div>
                  <p className="font-semibold text-white">Timer Active</p>
                  <p className="text-sm text-white/80">
                    {activeTimer.task ? `Task: ${activeTimer.task.title}` : 'General work'}
                  </p>
                </div>
              </div>
              <ModernButton onClick={handleStopTimer} variant="secondary">
                <Pause className="mr-2" size={16} />
                Stop Timer
              </ModernButton>
            </div>
          </ModernCard>
        )}

        {/* Barre de recherche et filtres */}
        <ModernCard>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#35414e] rounded-lg focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent bg-[#1e2938] text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <ModernButton
                onClick={() => setFilterStatus('all')}
                variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                size="sm"
              >
                All
              </ModernButton>
              <ModernButton
                onClick={() => setFilterStatus('todo')}
                variant={filterStatus === 'todo' ? 'primary' : 'secondary'}
                size="sm"
              >
                To Do
              </ModernButton>
              <ModernButton
                onClick={() => setFilterStatus('in_progress')}
                variant={filterStatus === 'in_progress' ? 'primary' : 'secondary'}
                size="sm"
              >
                In Progress
              </ModernButton>
              <ModernButton
                onClick={() => setFilterStatus('completed')}
                variant={filterStatus === 'completed' ? 'primary' : 'secondary'}
                size="sm"
              >
                Completed
              </ModernButton>
            </div>
          </div>
        </ModernCard>

        {/* Vue Kanban avec ModernCard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* To Do */}
          <ModernCard title="To Do">
            <div className="space-y-4">
              {filteredTasks.filter(t => t.status === 'todo').map(task => (
                <div key={task.id} className="p-4 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-white">{task.title}</h4>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartTimer(task.id)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Start timer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          {/* In Progress */}
          <ModernCard title="In Progress">
            <div className="space-y-4">
              {filteredTasks.filter(t => t.status === 'in_progress').map(task => (
                <div key={task.id} className="p-4 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-white">{task.title}</h4>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartTimer(task.id)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Start timer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          {/* Completed */}
          <ModernCard title="Completed">
            <div className="space-y-4">
              {filteredTasks.filter(t => t.status === 'completed').map(task => (
                <div key={task.id} className="p-4 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors opacity-60">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-white line-through">{task.title}</h4>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-3 line-through">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-white p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      </div>
    </Layout>
  );
};

export default ModernWorkboard;