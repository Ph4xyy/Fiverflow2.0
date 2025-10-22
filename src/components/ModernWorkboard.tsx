import React, { useState } from 'react';
import Layout, { cardClass } from '../components/Layout';
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
      case 'todo': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading workboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0E14] to-[#0F141C]">
        {/* Header moderne avec thème sombre */}
        <div className="bg-[#0F141C] border-b border-[#1C2230] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Workboard</h1>
                  <p className="text-sm text-slate-400">Project management & task tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-[#1C2230] rounded-lg text-sm font-medium text-slate-300 bg-[#111722] hover:bg-[#141B27] transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
                
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistiques modernes avec thème sombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#0F141C] rounded-xl p-6 border border-[#1C2230] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Tasks</p>
                  <p className="text-3xl font-bold text-white">{totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#0F141C] rounded-xl p-6 border border-[#1C2230] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Completed</p>
                  <p className="text-3xl font-bold text-emerald-400">{completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#0F141C] rounded-xl p-6 border border-[#1C2230] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">In Progress</p>
                  <p className="text-3xl font-bold text-blue-400">{inProgressTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#0F141C] rounded-xl p-6 border border-[#1C2230] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-400">{completionRate.toFixed(0)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Timer actif */}
          {activeTimer && (
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold">Timer Active</p>
                    <p className="text-sm opacity-90">
                      {activeTimer.task ? `Task: ${activeTimer.task.title}` : 'General work'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStopTimer}
                  className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Timer
                </button>
              </div>
            </div>
          )}

          {/* Barre de recherche et filtres avec thème sombre */}
          <div className="bg-[#0F141C] rounded-xl p-6 border border-[#1C2230] shadow-sm mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#1C2230] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#111722] text-white placeholder-slate-400"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#111722] text-slate-300 hover:bg-[#141B27] border border-[#1C2230]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('todo')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'todo' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#111722] text-slate-300 hover:bg-[#141B27] border border-[#1C2230]'
                  }`}
                >
                  To Do
                </button>
                <button
                  onClick={() => setFilterStatus('in_progress')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'in_progress' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#111722] text-slate-300 hover:bg-[#141B27] border border-[#1C2230]'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'completed' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#111722] text-slate-300 hover:bg-[#141B27] border border-[#1C2230]'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Vue Kanban moderne avec thème sombre */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* To Do */}
            <div className="bg-[#0F141C] rounded-xl border border-[#1C2230] shadow-sm">
              <div className="p-6 border-b border-[#1C2230]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">To Do</h3>
                  <span className="bg-[#111722] text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-[#1C2230]">
                    {filteredTasks.filter(t => t.status === 'todo').length}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {filteredTasks.filter(t => t.status === 'todo').map(task => (
                  <div key={task.id} className="bg-[#111722] rounded-lg p-4 border border-[#1C2230] hover:shadow-md transition-shadow hover:bg-[#141B27]">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <button className="text-slate-400 hover:text-slate-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartTimer(task.id)}
                          className="text-emerald-400 hover:text-emerald-300 p-1"
                          title="Start timer"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-200 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-[#0F141C] rounded-xl border border-[#1C2230] shadow-sm">
              <div className="p-6 border-b border-[#1C2230]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">In Progress</h3>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                    {filteredTasks.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {filteredTasks.filter(t => t.status === 'in_progress').map(task => (
                  <div key={task.id} className="bg-[#111722] rounded-lg p-4 border border-[#1C2230] hover:shadow-md transition-shadow hover:bg-[#141B27]">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <button className="text-slate-400 hover:text-slate-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartTimer(task.id)}
                          className="text-emerald-400 hover:text-emerald-300 p-1"
                          title="Start timer"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-200 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div className="bg-[#0F141C] rounded-xl border border-[#1C2230] shadow-sm">
              <div className="p-6 border-b border-[#1C2230]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Completed</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                    {filteredTasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {filteredTasks.filter(t => t.status === 'completed').map(task => (
                  <div key={task.id} className="bg-[#111722] rounded-lg p-4 border border-[#1C2230] hover:shadow-md transition-shadow hover:bg-[#141B27]">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white line-through opacity-60">{task.title}</h4>
                      <button className="text-slate-400 hover:text-slate-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-400 mb-3 line-through opacity-60">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)} opacity-60`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-slate-400 hover:text-slate-200 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModernWorkboard;
