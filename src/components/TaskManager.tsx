import React, { useState } from 'react';
import { useTasks, Task, TimeEntry } from '../hooks/useTasks';
import TaskForm from './TaskForm';
import TimeEntryForm from './TimeEntryForm';
import { 
  Plus, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Edit,
  Trash2,
  Timer,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskManagerProps {
  orderId?: string;
  orderTitle?: string;
  clientName?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ orderId, orderTitle, clientName }) => {
  const { 
    tasks, 
    timeEntries, 
    loading, 
    activeTimer, 
    createTask, 
    updateTask, 
    deleteTask, 
    startTimer, 
    stopTimer,
    refetchTasks 
  } = useTasks(orderId);
  
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTimeFormOpen, setIsTimeFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [timerDescription, setTimerDescription] = useState('');

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in_progress':
        return <AlertCircle className="text-blue-500" size={16} />;
      case 'todo':
        return <Circle className="text-gray-400" size={16} />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const success = await updateTask(taskId, { status: newStatus });
    if (success) {
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
    }
  };

  const handleStartTimer = async (taskId?: string) => {
    const success = await startTimer(taskId, orderId, timerDescription);
    if (success) {
      setTimerDescription('');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${taskTitle}" ?`)) {
      return;
    }

    await deleteTask(taskId);
  };

  const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
  const totalActualHours = tasks.reduce((sum, task) => sum + task.actual_hours, 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600 dark:text-slate-400 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              {orderId ? `Tasks - ${orderTitle}` : 'All Tasks'}
            </h2>
            {clientName && (
              <p className="text-sm text-gray-600 dark:text-slate-400">Client: {clientName}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setIsTimeFormOpen(true)}
              className="inline-flex items-center px-3 py-2 bg-purple-600 dark:bg-accent-purple text-white text-sm rounded-lg hover:bg-purple-700 dark:hover:bg-purple-400 transition-colors"
            >
              <Clock size={16} className="mr-2" />
              Add Time
            </button>
            <button
              onClick={() => setIsTaskFormOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-accent-blue text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-accent-blue">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{tasks.length}</p>
              </div>
              <BarChart3 className="text-blue-500 dark:text-accent-blue" size={20} />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-accent-green">Completed</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{completedTasks}</p>
              </div>
              <CheckCircle className="text-green-500 dark:text-accent-green" size={20} />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-accent-purple">Estimated</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalEstimatedHours}h</p>
              </div>
              <Clock className="text-purple-500 dark:text-accent-purple" size={20} />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-accent-orange">Actual</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{totalActualHours.toFixed(1)}h</p>
              </div>
              <Timer className="text-orange-500 dark:text-accent-orange" size={20} />
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-accent-blue dark:to-accent-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timer actif */}
      {activeTimer && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 dark:from-accent-green dark:to-accent-blue text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium">Timer Active</p>
                <p className="text-sm opacity-90">
                  {activeTimer.task ? `Task: ${activeTimer.task.title}` : 'General work'}
                </p>
              </div>
            </div>
            <button
              onClick={stopTimer}
              className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Pause size={16} className="mr-2" />
              Stop Timer
            </button>
          </div>
        </div>
      )}

      {/* Quick Timer */}
      {!activeTimer && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="What are you working on?"
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-accent-blue focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            />
            <button
              onClick={() => handleStartTimer()}
              className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-accent-green text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors"
            >
              <Play size={16} className="mr-2" />
              Start Timer
            </button>
          </div>
        </div>
      )}

      {/* Liste des tâches */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Tasks ({tasks.length})</h3>
        </div>

        {tasks.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleTaskStatusChange(
                        task.id, 
                        task.status === 'completed' ? 'todo' : 'completed'
                      )}
                      className="mt-1"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className={`text-base font-medium ${
                          task.status === 'completed' 
                            ? 'text-gray-500 dark:text-slate-500 line-through' 
                            : 'text-gray-900 dark:text-slate-100'
                        }`}>
                          {task.title}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-slate-500">
                        {task.due_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Due {formatDate(task.due_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{task.actual_hours.toFixed(1)}h / {task.estimated_hours}h</span>
                        </div>
                        {!orderId && task.order && (
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{task.order.client.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Barre de progression du temps */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-slate-500">Time Progress</span>
                          <span className="text-xs text-gray-500 dark:text-slate-500">
                            {task.estimated_hours > 0 ? Math.round((task.actual_hours / task.estimated_hours) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              task.actual_hours > task.estimated_hours 
                                ? 'bg-red-500 dark:bg-red-400' 
                                : 'bg-blue-500 dark:bg-accent-blue'
                            }`}
                            style={{ 
                              width: `${Math.min(100, task.estimated_hours > 0 ? (task.actual_hours / task.estimated_hours) * 100 : 0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleStartTimer(task.id)}
                      disabled={!!activeTimer}
                      className="p-2 text-green-600 dark:text-accent-green hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Start timer for this task"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskFormOpen(true);
                      }}
                      className="p-2 text-blue-600 dark:text-accent-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Get started by creating your first task.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => setIsTaskFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-accent-blue hover:bg-blue-700 dark:hover:bg-blue-400"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entrées de temps récentes */}
      {timeEntries.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Time Entries</h3>
          <div className="space-y-3">
            {timeEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-accent-blue rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {entry.task?.title || 'General work'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatDate(entry.start_time)} • {entry.order?.client.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {formatDuration(entry.duration_minutes)}
                  </p>
                  {entry.is_billable && (
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                      Billable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSuccess={() => {
          refetchTasks();
          setEditingTask(null);
        }}
        task={editingTask}
        orderId={orderId}
      />

      <TimeEntryForm
        isOpen={isTimeFormOpen}
        onClose={() => setIsTimeFormOpen(false)}
        onSuccess={refetchTasks}
        orderId={orderId}
        tasks={tasks}
      />
    </div>
  );
};

export default TaskManager;