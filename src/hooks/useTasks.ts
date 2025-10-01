import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface Task {
  id: string;
  order_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
  actual_hours: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  order?: {
    title: string;
    client: {
      name: string;
    };
  };
}

export interface TimeEntry {
  id: string;
  task_id?: string;
  order_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  description?: string;
  is_billable: boolean;
  created_at: string;
  task?: {
    title: string;
  };
  order?: {
    title: string;
    client: {
      name: string;
    };
  };
}

interface UseTasksReturn {
  tasks: Task[];
  timeEntries: TimeEntry[];
  loading: boolean;
  error: string | null;
  activeTimer: TimeEntry | null;
  createTask: (taskData: Partial<Task>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  startTimer: (taskId?: string, orderId?: string, description?: string) => Promise<boolean>;
  stopTimer: () => Promise<boolean>;
  createTimeEntry: (entryData: Partial<TimeEntry>) => Promise<boolean>;
  updateTimeEntry: (entryId: string, updates: Partial<TimeEntry>) => Promise<boolean>;
  deleteTimeEntry: (entryId: string) => Promise<boolean>;
  refetchTasks: () => Promise<void>;
}

// Mock data pour quand Supabase n'est pas configuré
const mockTasks: Task[] = [
  {
    id: '1',
    order_id: '1',
    title: 'Design initial concepts',
    description: 'Create 3 different logo concepts',
    status: 'completed',
    priority: 'high',
    estimated_hours: 4,
    actual_hours: 3.5,
    due_date: '2024-02-10',
    completed_at: '2024-02-09T15:30:00Z',
    created_at: '2024-02-05T10:00:00Z',
    updated_at: '2024-02-09T15:30:00Z',
    order: {
      title: 'Logo Design Project',
      client: { name: 'John Doe' }
    }
  },
  {
    id: '2',
    order_id: '1',
    title: 'Client feedback integration',
    description: 'Implement client feedback on chosen concept',
    status: 'in_progress',
    priority: 'medium',
    estimated_hours: 2,
    actual_hours: 1.2,
    due_date: '2024-02-15',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-12T14:20:00Z',
    order: {
      title: 'Logo Design Project',
      client: { name: 'John Doe' }
    }
  }
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    task_id: '1',
    order_id: '1',
    user_id: 'mock-user',
    start_time: '2024-02-09T10:00:00Z',
    end_time: '2024-02-09T13:30:00Z',
    duration_minutes: 210,
    description: 'Worked on logo concepts',
    is_billable: true,
    created_at: '2024-02-09T10:00:00Z',
    task: { title: 'Design initial concepts' },
    order: {
      title: 'Logo Design Project',
      client: { name: 'John Doe' }
    }
  }
];

export const useTasks = (orderId?: string): UseTasksReturn => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  const fetchTasks = useCallback(async () => {
    console.log('📋 Fetching tasks...');
    
    // Si Supabase n'est pas configuré, utiliser les données mock
    if (!isSupabaseConfigured || !supabase) {
      console.log('🎭 Using mock tasks data');
      const filteredTasks = orderId ? mockTasks.filter(t => t.order_id === orderId) : mockTasks;
      setTasks(filteredTasks);
      setTimeEntries(mockTimeEntries);
      setLoading(false);
      setError(null);
      return;
    }

    if (!user) {
      console.log('❌ No user found for tasks');
      setTasks([]);
      setTimeEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construire la requête pour les tâches
      let tasksQuery = supabase
        .from('tasks')
        .select(`
          *,
          orders!inner(
            title,
            clients!inner(name, user_id)
          )
        `)
        .eq('orders.clients.user_id', user.id)
        .order('created_at', { ascending: false });

      // Filtrer par order_id si spécifié
      if (orderId) {
        tasksQuery = tasksQuery.eq('order_id', orderId);
      }

      const { data: tasksData, error: tasksError } = await tasksQuery;

      if (tasksError) throw tasksError;

      // Transformer les données des tâches
      const transformedTasks: Task[] = tasksData?.map(task => ({
        ...task,
        order: {
          title: (task.orders as any).title,
          client: {
            name: (task.orders as any).clients.name
          }
        }
      })) || [];

      // Récupérer les entrées de temps
      let timeQuery = supabase
        .from('time_entries')
        .select(`
          *,
          tasks(title),
          orders!inner(
            title,
            clients!inner(name, user_id)
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (orderId) {
        timeQuery = timeQuery.eq('order_id', orderId);
      }

      const { data: timeData, error: timeError } = await timeQuery;

      if (timeError) throw timeError;

      // Transformer les données de temps
      const transformedTimeEntries: TimeEntry[] = timeData?.map(entry => ({
        ...entry,
        task: entry.tasks ? { title: (entry.tasks as any).title } : undefined,
        order: {
          title: (entry.orders as any).title,
          client: {
            name: (entry.orders as any).clients.name
          }
        }
      })) || [];

      // Vérifier s'il y a un timer actif
      const activeEntry = transformedTimeEntries.find(entry => !entry.end_time);
      setActiveTimer(activeEntry || null);

      setTasks(transformedTasks);
      setTimeEntries(transformedTimeEntries);
      console.log('✅ Tasks and time entries loaded successfully');
    } catch (error) {
      console.error('💥 Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, orderId]);

  const createTask = useCallback(async (taskData: Partial<Task>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    if (!taskData.title || !taskData.order_id) {
      toast.error('Title and order are required');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          order_id: taskData.order_id,
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          estimated_hours: taskData.estimated_hours || 0,
          due_date: taskData.due_date || null
        });

      if (error) throw error;

      toast.success('Task created successfully!');
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return false;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task updated successfully!');
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully!');
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  }, [fetchTasks]);

  const startTimer = useCallback(async (taskId?: string, orderId?: string, description?: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return false;
    }

    if (!taskId && !orderId) {
      toast.error('Task or order is required to start timer');
      return false;
    }

    // Arrêter le timer actuel s'il y en a un
    if (activeTimer) {
      await stopTimer();
    }

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId || null,
          order_id: orderId || (tasks.find(t => t.id === taskId)?.order_id),
          user_id: user.id,
          start_time: new Date().toISOString(),
          description: description || null,
          is_billable: true
        })
        .select()
        .single();

      if (error) throw error;

      setActiveTimer(data);
      toast.success('Timer started!');
      return true;
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
      return false;
    }
  }, [activeTimer, tasks, user]);

  const stopTimer = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !activeTimer) {
      return false;
    }

    try {
      const endTime = new Date();
      const startTime = new Date(activeTimer.start_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes
        })
        .eq('id', activeTimer.id);

      if (error) throw error;

      setActiveTimer(null);
      toast.success(`Timer stopped! ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m recorded`);
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
      return false;
    }
  }, [activeTimer, fetchTasks]);

  const createTimeEntry = useCallback(async (entryData: Partial<TimeEntry>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return false;
    }

    if (!entryData.start_time || !entryData.order_id) {
      toast.error('Start time and order are required');
      return false;
    }

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          ...entryData,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Time entry created successfully!');
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast.error('Failed to create time entry');
      return false;
    }
  }, [user, fetchTasks]);

  const updateTimeEntry = useCallback(async (entryId: string, updates: Partial<TimeEntry>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Time entry updated successfully!');
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('Failed to update time entry');
      return false;
    }
  }, [fetchTasks]);

  const deleteTimeEntry = useCallback(async (entryId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Time entry deleted successfully!');
      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast.error('Failed to delete time entry');
      return false;
    }
  }, [fetchTasks]);

  const refetchTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [user?.id, orderId]); // Remove fetchTasks from dependencies to prevent infinite loops

  return {
    tasks,
    timeEntries,
    loading,
    error,
    activeTimer,
    createTask,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    refetchTasks
  };
};