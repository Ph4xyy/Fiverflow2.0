import React, { useState } from 'react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { useTasks } from '../hooks/useTasks';
import { useOrders } from '../hooks/useOrders';
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
  Activity,
  X,
  Save,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  List,
  Archive,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ModernWorkboardProps {}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
  due_date: string;
  order_id?: string;
}

// Composant TaskCard moderne et fonctionnel
interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  getPriorityColor: (priority: string) => string;
  completed?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStartTimer,
  onStatusChange,
  getPriorityColor,
  completed = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-gray-400', bgColor: 'bg-gray-100' },
    { value: 'in_progress', label: 'In Progress', color: 'text-blue-400', bgColor: 'bg-blue-100' },
    { value: 'on_hold', label: 'On Hold', color: 'text-yellow-400', bgColor: 'bg-yellow-100' },
    { value: 'completed', label: 'Completed', color: 'text-green-400', bgColor: 'bg-green-100' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-100' },
    { value: 'archived', label: 'Archived', color: 'text-gray-500', bgColor: 'bg-gray-100' }
  ];

  const getStatusLabel = (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status;
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(option => option.value === status)?.color || 'text-gray-400';
  };

  const getStatusBgColor = (status: string) => {
    return statusOptions.find(option => option.value === status)?.bgColor || 'bg-gray-100';
  };

  return (
    <div className={`group p-3 rounded-lg bg-gradient-to-br from-[#35414e] to-[#2a3441] hover:from-[#3d4a57] hover:to-[#35414e] transition-all duration-300 border border-[#4a5568] hover:border-[#9c68f2]/30 cursor-pointer ${completed ? 'opacity-60' : ''}`}>
      {/* Header avec titre et actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-2">
          <h4 className={`font-semibold text-white text-sm ${completed ? 'line-through' : ''}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs text-gray-300 mt-1 line-clamp-1 ${completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 rounded-lg bg-[#4a5568]/50 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all"
            title="Edit task"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg bg-[#4a5568]/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Footer avec badges et actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <Flag className="w-2.5 h-2.5 mr-0.5" />
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartTimer(task.id);
            }}
            className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all"
            title="Start timer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          
          {/* Dropdown pour changer le statut */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1.5 rounded-lg bg-[#4a5568]/50 hover:bg-[#9c68f2]/20 text-gray-400 hover:text-white transition-all"
              title="Change status"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#1e2938] border border-[#35414e] rounded-xl shadow-2xl z-50">
                <div className="py-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, option.value);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-[#35414e] flex items-center gap-3 transition-colors ${option.color}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${option.bgColor}`}></div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModernWorkboard: React.FC<ModernWorkboardProps> = () => {
  const { user } = useAuth();
  const { tasks, timeEntries, loading, activeTimer, startTimer, stopTimer, refetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const { orders, loading: ordersLoading } = useOrders();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // État du formulaire de tâche
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: 1,
    due_date: '',
    order_id: ''
  });

  // Statistiques calculées
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const onHoldTasks = tasks.filter(t => t.status === 'on_hold').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;
  const archivedTasks = tasks.filter(t => t.status === 'archived').length;
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
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200';
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

  // Gestion du formulaire de tâche
  const handleTaskFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const taskData = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        priority: taskForm.priority,
        estimated_hours: taskForm.estimated_hours,
        due_date: taskForm.due_date || null,
        order_id: taskForm.order_id || null,
        status: 'pending' as const
      };

      if (editingTask) {
        const success = await updateTask(editingTask.id, taskData);
        if (!success) {
          toast.error('Failed to update task');
          return;
        }
      } else {
        const success = await createTask(taskData);
        if (!success) {
          toast.error('Failed to create task');
          return;
        }
      }

      // Reset form
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        estimated_hours: 1,
        due_date: ''
      });
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      estimated_hours: task.estimated_hours || 1,
      due_date: task.due_date || ''
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      estimated_hours: 1,
      due_date: ''
    });
    setEditingTask(null);
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c68f2]" />
          <p className="ml-3 text-gray-400">Loading workboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Workboard</h1>
            <p className="text-gray-400">Project management & task tracking</p>
          </div>
          <div className="flex gap-3">
            {/* Mode de vue */}
            <div className="flex items-center bg-[#35414e] rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-[#9c68f2] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1 inline" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#9c68f2] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4 mr-1 inline" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-[#9c68f2] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 mr-1 inline" />
                Calendar
              </button>
            </div>
            
            <ModernButton onClick={() => setShowFilters(!showFilters)} size="sm">
              <Filter className="mr-2" size={16} />
              Filters
            </ModernButton>
            <ModernButton onClick={() => setShowTaskModal(true)} size="sm">
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
                onClick={() => setFilterStatus('pending')}
                variant={filterStatus === 'pending' ? 'primary' : 'secondary'}
                size="sm"
              >
                Pending
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
              <ModernButton
                onClick={() => setFilterStatus('on_hold')}
                variant={filterStatus === 'on_hold' ? 'primary' : 'secondary'}
                size="sm"
              >
                On Hold
              </ModernButton>
              <ModernButton
                onClick={() => setFilterStatus('cancelled')}
                variant={filterStatus === 'cancelled' ? 'primary' : 'secondary'}
                size="sm"
              >
                Cancelled
              </ModernButton>
              <ModernButton
                onClick={() => setFilterStatus('archived')}
                variant={filterStatus === 'archived' ? 'primary' : 'secondary'}
                size="sm"
              >
                Archived
              </ModernButton>
            </div>
          </div>
        </ModernCard>

        {/* Contenu selon le mode de vue */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending */}
            <ModernCard title={
              <div className="flex items-center justify-between w-full">
                <span>Pending</span>
                <span className="text-xs font-medium text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'pending').length}
                </span>
              </div>
            }>
              <div className="space-y-3 min-h-[400px]">
                {filteredTasks.filter(t => t.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pending tasks</p>
                  </div>
                ) : (
                  filteredTasks.filter(t => t.status === 'pending').map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={handleEditTask}
                      onDelete={setShowDeleteConfirm}
                      onStartTimer={handleStartTimer}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                    />
                  ))
                )}
              </div>
            </ModernCard>

            {/* In Progress */}
            <ModernCard title={
              <div className="flex items-center justify-between w-full">
                <span>In Progress</span>
                <span className="text-xs font-medium text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'in_progress').length}
                </span>
              </div>
            }>
              <div className="space-y-3 min-h-[400px]">
                {filteredTasks.filter(t => t.status === 'in_progress').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active tasks</p>
                  </div>
                ) : (
                  filteredTasks.filter(t => t.status === 'in_progress').map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={handleEditTask}
                      onDelete={setShowDeleteConfirm}
                      onStartTimer={handleStartTimer}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                    />
                  ))
                )}
              </div>
            </ModernCard>

            {/* Completed */}
            <ModernCard title={
              <div className="flex items-center justify-between w-full">
                <span>Completed</span>
                <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
            }>
              <div className="space-y-3 min-h-[400px]">
                {filteredTasks.filter(t => t.status === 'completed').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No completed tasks</p>
                  </div>
                ) : (
                  filteredTasks.filter(t => t.status === 'completed').map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={handleEditTask}
                      onDelete={setShowDeleteConfirm}
                      onStartTimer={handleStartTimer}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                      completed={true}
                    />
                  ))
                )}
              </div>
            </ModernCard>

            {/* Colonnes supplémentaires pour On Hold, Cancelled, Archived si elles contiennent des tâches */}
            {(filteredTasks.filter(t => t.status === 'on_hold').length > 0 ||
              filteredTasks.filter(t => t.status === 'cancelled').length > 0 ||
              filteredTasks.filter(t => t.status === 'archived').length > 0) && (
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* On Hold */}
                {filteredTasks.filter(t => t.status === 'on_hold').length > 0 && (
                  <ModernCard title={
                    <div className="flex items-center justify-between w-full">
                      <span>On Hold</span>
                      <span className="text-xs font-medium text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full">
                        {filteredTasks.filter(t => t.status === 'on_hold').length}
                      </span>
                    </div>
                  }>
                    <div className="space-y-3 min-h-[200px]">
                      {filteredTasks.filter(t => t.status === 'on_hold').map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={handleEditTask}
                          onDelete={setShowDeleteConfirm}
                          onStartTimer={handleStartTimer}
                          onStatusChange={handleStatusChange}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  </ModernCard>
                )}

                {/* Cancelled */}
                {filteredTasks.filter(t => t.status === 'cancelled').length > 0 && (
                  <ModernCard title={
                    <div className="flex items-center justify-between w-full">
                      <span>Cancelled</span>
                      <span className="text-xs font-medium text-red-400 bg-red-900/30 px-2 py-1 rounded-full">
                        {filteredTasks.filter(t => t.status === 'cancelled').length}
                      </span>
                    </div>
                  }>
                    <div className="space-y-3 min-h-[200px]">
                      {filteredTasks.filter(t => t.status === 'cancelled').map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={handleEditTask}
                          onDelete={setShowDeleteConfirm}
                          onStartTimer={handleStartTimer}
                          onStatusChange={handleStatusChange}
                          getPriorityColor={getPriorityColor}
                          completed={true}
                        />
                      ))}
                    </div>
                  </ModernCard>
                )}

                {/* Archived */}
                {filteredTasks.filter(t => t.status === 'archived').length > 0 && (
                  <ModernCard title={
                    <div className="flex items-center justify-between w-full">
                      <span>Archived</span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {filteredTasks.filter(t => t.status === 'archived').length}
                      </span>
                    </div>
                  }>
                    <div className="space-y-3 min-h-[200px]">
                      {filteredTasks.filter(t => t.status === 'archived').map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={handleEditTask}
                          onDelete={setShowDeleteConfirm}
                          onStartTimer={handleStartTimer}
                          onStatusChange={handleStatusChange}
                          getPriorityColor={getPriorityColor}
                          completed={true}
                        />
                      ))}
                    </div>
                  </ModernCard>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <ModernCard title="All Tasks">
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-[#35414e] hover:bg-[#3d4a57] transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.status === 'completed' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-400 hover:border-green-400'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium text-white ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`text-sm text-gray-400 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartTimer(task.id)}
                      className="text-green-400 hover:text-green-300 p-1"
                      title="Start timer"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditTask(task)}
                      className="text-gray-400 hover:text-white p-1"
                      title="Edit task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(task.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        )}

        {viewMode === 'calendar' && (
          <ModernCard title="Calendar View">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Calendar View</h3>
              <p className="text-gray-400 mb-4">Calendar view will be implemented soon</p>
              <ModernButton onClick={() => setViewMode('kanban')} variant="secondary">
                Switch to Kanban
              </ModernButton>
            </div>
          </ModernCard>
        )}

        {/* Modal de création/édition de tâche */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e2938] rounded-xl border border-[#35414e] w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-[#35414e]">
                <h3 className="text-xl font-semibold text-white">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    resetTaskForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleTaskFormSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2]"
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2]"
                    placeholder="Enter task description..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order (Optional)
                  </label>
                  <select
                    value={taskForm.order_id || ''}
                    onChange={(e) => setTaskForm({...taskForm, order_id: e.target.value || undefined})}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2]"
                  >
                    <option value="">No Order</option>
                    {orders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.title} - {order.budget ? `$${order.budget}` : 'No Budget'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})}
                      className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={taskForm.estimated_hours}
                      onChange={(e) => setTaskForm({...taskForm, estimated_hours: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white placeholder-gray-400 focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-[#35414e] border border-[#4a5568] text-white focus:border-[#9c68f2] focus:ring-1 focus:ring-[#9c68f2]"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <ModernButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowTaskModal(false);
                      resetTaskForm();
                    }}
                  >
                    Cancel
                  </ModernButton>
                  <ModernButton type="submit">
                    <Save className="mr-2" size={16} />
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </ModernButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e2938] rounded-xl border border-[#35414e] w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Task</h3>
                    <p className="text-sm text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this task? All associated time entries will also be removed.
                </p>
                
                <div className="flex items-center justify-end space-x-3">
                  <ModernButton
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </ModernButton>
                  <ModernButton
                    variant="danger"
                    onClick={() => handleDeleteTask(showDeleteConfirm)}
                  >
                    <Trash2 className="mr-2" size={16} />
                    Delete Task
                  </ModernButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ModernWorkboard;