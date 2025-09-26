// src/components/TaskManager.tsx
import React, { useState } from 'react';
import { useTasks, Task } from '../hooks/useTasks';
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
  BarChart3,
  CheckSquare
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
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    refetchTasks
  } = useTasks(orderId);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTimeFormOpen, setIsTimeFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [timerDescription, setTimerDescription] = useState('');

  const getStatusBadge = (status: Task['status']) => {
    const base = 'w-8 h-8 rounded-xl grid place-items-center ring-1 ring-inset';
    switch (status) {
      case 'completed':
        return (
          <div className={`${base} bg-green-500/10 text-green-400 ring-green-700/30`}>
            <CheckCircle size={16} />
          </div>
        );
      case 'in_progress':
        return (
          <div className={`${base} bg-blue-500/10 text-blue-400 ring-blue-700/30`}>
            <AlertCircle size={16} />
          </div>
        );
      default:
        return (
          <div className={`${base} bg-slate-500/10 text-slate-300 ring-[#1C2230]`}>
            <Circle size={16} />
          </div>
        );
    }
  };

  const priorityPill = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-300 bg-red-900/30 border border-red-800';
      case 'medium':
        return 'text-yellow-300 bg-yellow-900/30 border border-yellow-800';
      case 'low':
        return 'text-green-300 bg-green-900/30 border border-green-800';
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const handleTaskStatusChange = async (id: string, next: Task['status']) => {
    const ok = await updateTask(id, { status: next });
    if (ok) toast.success(`Task marked as ${next.replace('_', ' ')}`);
  };

  const handleStartTimer = async (taskId?: string) => {
    const ok = await startTimer(taskId, orderId, timerDescription);
    if (ok) setTimerDescription('');
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${title}" ?`)) return;
    await deleteTask(id);
  };

  const totalEstimated = tasks.reduce((s, t) => s + t.estimated_hours, 0);
  const totalActual = tasks.reduce((s, t) => s + t.actual_hours, 0);
  const done = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? (done / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <div className="rounded-xl border bg-[#0B0E14] border-[#1C2230] p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <p className="ml-2 text-slate-400 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + KPIs */}
      <div className="rounded-xl border bg-[#0B0E14] border-[#1C2230] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center text-white">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {orderId ? `Tasks — ${orderTitle}` : 'All Tasks'}
              </h2>
              {clientName && <p className="text-sm text-slate-400">Client: {clientName}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimeFormOpen(true)}
              className="inline-flex items-center px-3 py-2.5 rounded-xl text-white bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition"
            >
              <Clock size={16} className="mr-2" />
              Add Time
            </button>
            <button
              onClick={() => setIsTaskFormOpen(true)}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-white bg-gradient-to-br from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 transition"
            >
              <Plus size={16} className="mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="rounded-xl overflow-hidden border border-[#1C2230]">
          <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1C2230]">
            <div className="p-4 sm:p-5 flex items-center gap-4 bg-[#0F141C]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-sky-500 to-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Tasks</div>
                <div className="text-2xl font-semibold text-white">{tasks.length}</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-4 bg-[#0F141C]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-emerald-500 to-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Completed</div>
                <div className="text-2xl font-semibold text-white">{done}</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-4 bg-[#0F141C]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-purple-500 to-fuchsia-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Estimated</div>
                <div className="text-2xl font-semibold text-white">{totalEstimated}h</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-4 bg-[#0F141C]">
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-br from-amber-500 to-orange-600">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Actual</div>
                <div className="text-2xl font-semibold text-white">{totalActual.toFixed(1)}h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Progress</span>
            <span className="text-sm font-medium text-slate-300">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#131823] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active timer */}
      {activeTimer && (
        <div className="rounded-xl border border-[#1C2230] p-4 bg-gradient-to-r from-green-600/30 to-blue-600/30 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <div>
                <p className="font-semibold">Timer Active</p>
                <p className="text-sm opacity-90">
                  {activeTimer.task ? `Task: ${activeTimer.task.title}` : 'General work'}
                </p>
              </div>
            </div>
            <button
              onClick={stopTimer}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition"
            >
              <Pause size={16} className="mr-2" />
              Stop Timer
            </button>
          </div>
        </div>
      )}

      {/* Quick timer */}
      {!activeTimer && (
        <div className="rounded-xl border bg-[#0B0E14] border-[#1C2230] p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="What are you working on?"
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#11151D] border border-[#1C2230] text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => handleStartTimer()}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-white bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition"
            >
              <Play size={16} className="mr-2" />
              Start Timer
            </button>
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="rounded-xl border bg-[#0B0E14] border-[#1C2230] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1C2230] bg-[#0F141C]">
          <h3 className="text-lg font-semibold text-white">Tasks ({tasks.length})</h3>
        </div>

        {tasks.length ? (
          <div className="divide-y divide-[#1C2230]">
            {tasks.map(task => (
              <div key={task.id} className="p-6 hover:bg-[#11161F] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() =>
                        handleTaskStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')
                      }
                      className="mt-0.5"
                      title="Toggle status"
                    >
                      {getStatusBadge(task.status)}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4
                          className={`text-base font-semibold ${
                            task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${priorityPill(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && <p className="text-sm text-slate-400 mb-2">{task.description}</p>}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        {task.due_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Due {formatDate(task.due_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>
                            {task.actual_hours.toFixed(1)}h / {task.estimated_hours}h
                          </span>
                        </div>
                        {!orderId && task.order && (
                          <div className="flex items-center gap-1.5">
                            <User size={14} />
                            <span>{task.order.client.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Time progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Time Progress</span>
                          <span className="text-xs text-slate-500">
                            {task.estimated_hours > 0
                              ? Math.round((task.actual_hours / task.estimated_hours) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-[#131823] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              task.actual_hours > task.estimated_hours ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                task.estimated_hours > 0
                                  ? (task.actual_hours / task.estimated_hours) * 100
                                  : 0
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleStartTimer(task.id)}
                      disabled={!!activeTimer}
                      className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-900/20 transition disabled:opacity-50"
                      title="Start timer for this task"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskFormOpen(true);
                      }}
                      className="p-2 rounded-xl text-blue-400 hover:bg-blue-900/20 transition"
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-900/20 transition"
                      title="Delete task"
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
            <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto bg-[#151A22] ring-1 ring-inset ring-[#1C2230] mb-3">
              <CheckCircle className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-semibold text-white">No tasks</h3>
            <p className="mt-1 text-sm text-slate-400">Get started by creating your first task.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsTaskFormOpen(true)}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-white bg-gradient-to-br from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 transition"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Time Entries */}
      {timeEntries.length > 0 && (
        <div className="rounded-xl border bg-[#0B0E14] border-[#1C2230] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Time Entries</h3>
          <div className="space-y-3">
            {timeEntries.slice(0, 5).map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#11161F] border border-[#1C2230]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-white">{entry.task?.title || 'General work'}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(entry.start_time)} • {entry.order?.client.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatDuration(entry.duration_minutes)}</p>
                  {entry.is_billable && (
                    <span className="inline-flex px-2.5 py-1 text-xs rounded-full bg-green-900/30 text-green-300 border border-green-800">
                      Billable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
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
