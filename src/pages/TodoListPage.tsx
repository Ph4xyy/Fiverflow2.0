import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, ChevronRight, ChevronDown, Calendar as CalendarIcon, MessageSquare,
  MoreVertical, CheckCircle2, Circle, Flag, AlertTriangle, User as UserIcon, Link2, Layers
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * TodoListPage
 * - Thème blackout par défaut (aucun "dark:"), couleurs proches de ta base : zinc/blue.
 * - Sous-tâches infinies via parent_id.
 * - Colonnes : Titre (arbo), Client, Commande, Statut, Priorité, Échéance, Commentaires, Actions.
 * - Sélecteurs Client & Commande alimentés par Supabase (clients, orders).
 * - Sync calendrier : upsert dans "calendar_events" si la table existe (sinon ignore proprement).
 * - Commentaires : panneau latéral; stocke dans "task_comments" si existe, sinon fallback mémoire locale.
 * - Aucun changement à ton infra — si une table manque, on capte l’erreur 42P01 et on n’interrompt pas l’UI.
 *
 * NOTE nav: Ajoute le lien “Todo List” dans ta sidebar Workspace sous “Tasks”.
 */

type UUID = string;

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

type Task = {
  id: UUID;
  user_id: UUID;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null; // ISO string (YYYY-MM-DD ou ISO datetime)
  client_id?: UUID | null;
  order_id?: UUID | null;
  parent_id?: UUID | null;
  list_id?: UUID | null;
  comments_count?: number | null;
  created_at?: string;
  updated_at?: string;
};

type Client = { id: UUID; name: string };
type Order = { id: UUID; number?: string | null; title?: string | null };

type Comment = {
  id?: UUID;
  task_id: UUID;
  user_id: UUID;
  content: string;
  created_at?: string;
};

const STATUS_OPTIONS: { value: TaskStatus; label: string; dot: React.ReactNode }[] = [
  { value: 'todo',        label: 'À faire',         dot: <Circle className="h-3 w-3 text-zinc-500" /> },
  { value: 'in_progress', label: 'En cours',        dot: <Circle className="h-3 w-3 text-blue-500" /> },
  { value: 'blocked',     label: 'Bloqué',          dot: <AlertTriangle className="h-3 w-3 text-yellow-500" /> },
  { value: 'done',        label: 'Terminé',         dot: <CheckCircle2 className="h-3 w-3 text-emerald-500" /> },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; icon: React.ReactNode }[] = [
  { value: 'low',    label: 'Basse',   icon: <Flag className="h-3 w-3 text-zinc-400" /> },
  { value: 'medium', label: 'Moyenne', icon: <Flag className="h-3 w-3 text-blue-400" /> },
  { value: 'high',   label: 'Haute',   icon: <Flag className="h-3 w-3 text-orange-400" /> },
  { value: 'urgent', label: 'Urgent',  icon: <Flag className="h-3 w-3 text-red-500" /> },
];

const cellBase = 'px-3 py-2 text-sm text-zinc-200';
const cellMuted = 'text-zinc-400';
const inputBase =
  'w-full px-3 py-2 rounded-lg border bg-zinc-900 text-zinc-100 placeholder-zinc-500 border-zinc-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
const selectBase =
  'w-full px-3 py-2 rounded-lg border bg-zinc-900 text-zinc-100 border-zinc-800 focus:outline-none ' +
  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

const headerButton =
  'inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm ' +
  'transition-colors shadow-sm';

const badge =
  'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700';

const rowContainer =
  'group relative border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors';

const columnGrid =
  'grid grid-cols-[minmax(280px,1fr)_minmax(160px,240px)_minmax(160px,240px)_140px_140px_170px_120px_48px] items-center';

const SubtleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    {...props}
    className={
      'px-2 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors ' + className
    }
  />
);

const TodoListPage: React.FC = () => {
  const { user } = useAuth();
  const [listTitle, setListTitle] = useState<string>('Workspace To-Do');
  const [editingTitle, setEditingTitle] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [commentDrawerOpen, setCommentDrawerOpen] = useState<boolean>(false);
  const [commentTask, setCommentTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');

  const [inlineAddParent, setInlineAddParent] = useState<string | null>(null);
  const inlineNewTitleRef = useRef<HTMLInputElement | null>(null);

  const isReady = !!user && isSupabaseConfigured && !!supabase;

  // -------------- Helpers --------------
  const childrenOf = useCallback(
    (parentId: string | null): Task[] => tasks.filter(t => (t.parent_id ?? null) === parentId),
    [tasks]
  );

  const hasChildren = useCallback(
    (taskId: string): boolean => tasks.some(t => t.parent_id === taskId),
    [tasks]
  );

  const buildPath = useCallback((task: Task): Task[] => {
    const path: Task[] = [];
    let current: Task | undefined = task;
    let safe = 0;
    while (current && safe < 50) {
      path.unshift(current);
      current = current.parent_id ? tasks.find(t => t.id === current!.parent_id) : undefined;
      safe++;
    }
    return path;
  }, [tasks]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clientName = (id?: string | null) => clients.find(c => c.id === id)?.name ?? '—';
  const orderLabel = (id?: string | null) => {
    const o = orders.find(x => x.id === id);
    if (!o) return '—';
    return o.number ? `#${o.number}` : (o.title || 'Commande');
  };

  // -------------- Data Load --------------
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user) return;
      setLoading(true);

      // Load list title (if table exists)
      try {
        if (isReady) {
          const { data: listData, error: listErr } = await supabase
            .from('task_lists')
            .select('id,title')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (!listErr && listData?.title) {
            if (mounted) setListTitle(listData.title);
          }
        }
      } catch (_) { /* ignore */ }

      // Load clients & orders
      if (isReady) {
        try {
          const [{ data: cData }, { data: oData }] = await Promise.all([
            supabase.from('clients').select('id,name').order('name', { ascending: true }),
            supabase.from('orders').select('id,number,title').order('created_at', { ascending: false })
          ]);
          if (mounted && cData) setClients(cData as any);
          if (mounted && oData) setOrders(oData as any);
        } catch (_) { /* ignore */ }
      }

      // Load tasks
      try {
        if (isReady) {
          const { data: tData } = await supabase
            .from('tasks')
            .select('id,user_id,title,description,status,priority,due_date,client_id,order_id,parent_id,list_id,comments_count,created_at,updated_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (mounted && tData) {
            setTasks(tData as Task[]);
            // Expand roots by default
            const roots = (tData as Task[]).filter(t => !t.parent_id);
            const ex: Record<string, boolean> = {};
            roots.forEach(r => (ex[r.id] = true));
            setExpanded(ex);
          }
        }
      } catch (_) { /* ignore */ }

      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, [user, isReady]);

  // -------------- Persistence --------------
  const upsertTask = async (partial: Partial<Task> & { id?: string }) => {
    if (!isReady || !user) return;

    setSaving(true);
    try {
      // Ensure sane defaults
      const payload: any = {
        user_id: user.id,
        title: partial.title ?? 'Sans titre',
        status: partial.status ?? 'todo',
        priority: partial.priority ?? 'medium',
        due_date: partial.due_date ?? null,
        client_id: partial.client_id ?? null,
        order_id: partial.order_id ?? null,
        parent_id: partial.parent_id ?? null,
        list_id: partial.list_id ?? null,
        description: partial.description ?? null,
      };

      let resultId: string | null = null;

      if (partial.id) {
        const { data, error } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', partial.id)
          .select('id, due_date, title')
          .single();

        if (error) throw error;
        resultId = data?.id ?? partial.id;
        // Local update
        setTasks(prev => prev.map(t => (t.id === resultId ? { ...t, ...payload } as Task : t)));
        await syncTaskToCalendar({ ...(payload as Task), id: resultId! });
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ ...payload, user_id: user.id }])
          .select('id, due_date, title')
          .single();

        if (error) throw error;
        resultId = data!.id;
        const newTask: Task = { id: resultId, user_id: user.id, ...payload };
        setTasks(prev => [...prev, newTask]);
        await syncTaskToCalendar(newTask);
      }
      return resultId;
    } catch (err: any) {
      if (err?.code === '42P01') {
        toast.error('Table "tasks" introuvable. Crée-la dans Supabase ou mappe le nom.');
      } else {
        toast.error('Échec de la sauvegarde de la tâche.');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!isReady) return;
    setSaving(true);
    try {
      // Delete recursively (front) then backend delete best-effort
      const allIds = collectDescendants(taskId, true);
      setTasks(prev => prev.filter(t => !allIds.includes(t.id)));

      try {
        await supabase.from('tasks').delete().in('id', allIds);
      } catch (_) { /* ignore */ }

      // Remove calendar events referencing this task
      try {
        await supabase.from('calendar_events').delete().eq('related_task_id', taskId);
      } catch (_) { /* ignore */ }
    } catch {
      toast.error('Suppression échouée.');
    } finally {
      setSaving(false);
    }
  };

  const collectDescendants = (taskId: string, includeSelf = false): string[] => {
    const out: string[] = includeSelf ? [taskId] : [];
    const stack = [taskId];
    let guard = 0;
    while (stack.length && guard < 10000) {
      const current = stack.pop()!;
      const kids = tasks.filter(t => t.parent_id === current);
      kids.forEach(k => {
        out.push(k.id);
        stack.push(k.id);
      });
      guard++;
    }
    return out;
  };

  const syncTaskToCalendar = async (task: Task) => {
    if (!isReady || !user) return;
    try {
      if (!task.due_date) {
        // Remove event if exists
        await supabase.from('calendar_events').delete().eq('related_task_id', task.id);
        return;
      }
      const eventPayload = {
        user_id: user.id,
        title: task.title,
        start: task.due_date,
        end: task.due_date,
        all_day: true,
        related_task_id: task.id,
      };
      await supabase.from('calendar_events').upsert(eventPayload, { onConflict: 'related_task_id' });
    } catch (err: any) {
      // Table may not exist — ignore silently but keep UI usable
      if (err?.code !== '42P01') {
        // optional: toast('Sync calendrier partielle.')
      }
    }
  };

  // -------------- Comments --------------
  const openComments = async (task: Task) => {
    setCommentTask(task);
    setCommentDrawerOpen(true);
    setCommentInput('');
    if (!isReady || !user) return;

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('id, task_id, user_id, content, created_at')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data as Comment[]);
      } else {
        setComments([]);
      }
    } catch (_) {
      setComments([]); // fallback mémoire si table absente
    }
  };

  const addComment = async () => {
    if (!commentTask || !commentInput.trim() || !isReady || !user) return;
    const c: Comment = {
      task_id: commentTask.id,
      user_id: user.id,
      content: commentInput.trim(),
    };
    setComments(prev => [...prev, { ...c, id: cryptoRandomId(), created_at: new Date().toISOString() }]);
    setCommentInput('');

    try {
      await supabase.from('task_comments').insert([c]);
      // increment comments_count on task
      try {
        const t = tasks.find(t => t.id === commentTask.id);
        if (t) {
          const newCount = (t.comments_count ?? 0) + 1;
          setTasks(prev => prev.map(x => (x.id === t.id ? { ...x, comments_count: newCount } : x)));
          await supabase.from('tasks').update({ comments_count: newCount }).eq('id', t.id);
        }
      } catch (_) { /* ignore */ }
    } catch (_) {
      // ignore
    }
  };

  // -------------- Inline add subtask --------------
  const startInlineAdd = (parentId: string | null) => {
    setInlineAddParent(parentId ?? null);
    setTimeout(() => inlineNewTitleRef.current?.focus(), 0);
  };

  const commitInlineAdd = async () => {
    const title = inlineNewTitleRef.current?.value?.trim();
    if (!title) {
      setInlineAddParent(null);
      return;
    }
    const id = await upsertTask({
      title,
      parent_id: inlineAddParent,
      status: 'todo',
      priority: 'medium',
    });
    if (id) setExpanded(prev => ({ ...prev, [inlineAddParent ?? 'root']: true }));
    inlineNewTitleRef.current!.value = '';
    setInlineAddParent(null);
  };

  // -------------- UI Cells --------------
  const StatusCell: React.FC<{ task: Task }> = ({ task }) => {
    return (
      <select
        className={selectBase}
        value={task.status}
        onChange={(e) => upsertTask({ id: task.id, status: e.target.value as TaskStatus })}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };

  const PriorityCell: React.FC<{ task: Task }> = ({ task }) => {
    return (
      <select
        className={selectBase}
        value={task.priority}
        onChange={(e) => upsertTask({ id: task.id, priority: e.target.value as TaskPriority })}
      >
        {PRIORITY_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };

  const DueDateCell: React.FC<{ task: Task }> = ({ task }) => {
    const value = task.due_date ? task.due_date.slice(0, 10) : '';
    return (
      <input
        type="date"
        className={inputBase}
        value={value}
        onChange={(e) => upsertTask({ id: task.id, due_date: e.target.value || null })}
      />
    );
  };

  const ClientCell: React.FC<{ task: Task }> = ({ task }) => (
    <select
      className={selectBase}
      value={task.client_id ?? ''}
      onChange={(e) => upsertTask({ id: task.id, client_id: e.target.value || null })}
    >
      <option value="">—</option>
      {clients.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );

  const OrderCell: React.FC<{ task: Task }> = ({ task }) => (
    <select
      className={selectBase}
      value={task.order_id ?? ''}
      onChange={(e) => upsertTask({ id: task.id, order_id: e.target.value || null })}
    >
      <option value="">—</option>
      {orders.map(o => (
        <option key={o.id} value={o.id}>{orderLabel(o.id)}</option>
      ))}
    </select>
  );

  const TitleCell: React.FC<{ task: Task; depth: number }> = ({ task, depth }) => {
    const [localTitle, setLocalTitle] = useState(task.title);
    useEffect(() => setLocalTitle(task.title), [task.title]);

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-1 rounded hover:bg-zinc-800"
          onClick={() => toggleExpand(task.id)}
          title={expanded[task.id] ? 'Réduire' : 'Développer'}
        >
          {hasChildren(task.id) ? (
            expanded[task.id] ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />
          ) : <span className="inline-block w-4 h-4" />}
        </button>

        <div className="flex-1">
          <input
            className={inputBase + ' ' + (depth > 0 ? `pl-${Math.min(depth, 6) * 2}` : '')}
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => {
              if (localTitle.trim() && localTitle.trim() !== task.title) {
                upsertTask({ id: task.id, title: localTitle.trim() });
              } else {
                setLocalTitle(task.title);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
            }}
          />
          <div className="mt-1 flex items-center gap-2">
            <span className={badge}><Layers className="h-3 w-3" />{buildPath(task).length - 1} niveau(x)</span>
            {task.parent_id && (
              <span className={badge}><Link2 className="h-3 w-3" /> lié</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // -------------- Rows (recursive) --------------
  const TaskRow: React.FC<{ task: Task; depth: number }> = ({ task, depth }) => {
    return (
      <>
        <div className={rowContainer + ' ' + columnGrid}>
          <div className={cellBase}>
            <TitleCell task={task} depth={depth} />
          </div>

          <div className={cellBase}><ClientCell task={task} /></div>
          <div className={cellBase}><OrderCell task={task} /></div>
          <div className={cellBase}><StatusCell task={task} /></div>
          <div className={cellBase}><PriorityCell task={task} /></div>
          <div className={cellBase}><DueDateCell task={task} /></div>

          <div className={cellBase}>
            <SubtleButton onClick={() => openComments(task)}>
              <MessageSquare className="h-4 w-4 mr-1" /> {task.comments_count ?? 0}
            </SubtleButton>
          </div>

          <div className={cellBase + ' flex items-center justify-end'}>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <SubtleButton onClick={() => startInlineAdd(task.id)}>
                <Plus className="h-4 w-4" /> Sous-tâche
              </SubtleButton>
              <SubtleButton onClick={() => deleteTask(task.id)}>
                <MoreVertical className="h-4 w-4" />
              </SubtleButton>
            </div>
          </div>
        </div>

        {inlineAddParent === task.id && (
          <div className={columnGrid + ' border-b border-zinc-800 bg-zinc-900/40'}>
            <div className={cellBase}>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4" />
                <input
                  ref={inlineNewTitleRef}
                  className={inputBase}
                  placeholder="Nom de la sous-tâche…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitInlineAdd();
                    if (e.key === 'Escape') setInlineAddParent(null);
                  }}
                  onBlur={commitInlineAdd}
                />
              </div>
            </div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' flex items-center justify-end'}>
              <span className="text-zinc-500 text-xs">Entrée pour ajouter</span>
            </div>
          </div>
        )}

        {expanded[task.id] && hasChildren(task.id) &&
          childrenOf(task.id).map(child => (
            <TaskRow key={child.id} task={child} depth={depth + 1} />
          ))
        }
      </>
    );
  };

  const RootRows: React.FC = () => {
    const roots = tasks.filter(t => !t.parent_id);
    return (
      <>
        {roots.map(task => (
          <TaskRow key={task.id} task={task} depth={0} />
        ))}

        {inlineAddParent === null && (
          <div className={columnGrid + ' border-b border-zinc-800 bg-zinc-900/40'}>
            <div className={cellBase}>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded hover:bg-zinc-800" title="Développer">
                  <span className="inline-block w-4 h-4" />
                </button>
                <input
                  ref={inlineNewTitleRef}
                  className={inputBase}
                  placeholder="Nouvelle tâche…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitInlineAdd();
                  }}
                  onBlur={() => {
                    // si on a tapé quelque chose
                    if (inlineNewTitleRef.current?.value?.trim()) commitInlineAdd();
                  }}
                />
              </div>
            </div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' ' + cellMuted}>—</div>
            <div className={cellBase + ' flex items-center justify-end'}>
              <span className="text-zinc-500 text-xs">Entrée pour ajouter</span>
            </div>
          </div>
        )}
      </>
    );
  };

  // -------------- Header: Title Save --------------
  const saveListTitle = async () => {
    if (!isReady || !user) return setEditingTitle(false);

    try {
      const { data } = await supabase
        .from('task_lists')
        .upsert({ user_id: user.id, title: listTitle }, { onConflict: 'user_id' })
        .select('id')
        .maybeSingle();

      if (data) toast.success('Titre enregistré');
      setEditingTitle(false);
    } catch (err: any) {
      if (err?.code === '42P01') {
        // table absente, on n’interrompt pas le flux
      }
      setEditingTitle(false);
    }
  };

  // -------------- Skeleton --------------
  const SkeletonRow: React.FC = () => (
    <div className={columnGrid + ' border-b border-zinc-800'}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-3 py-3">
          <div className="h-5 w-full bg-zinc-800/80 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-300">Veuillez vous connecter pour accéder à la To-Do List.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-zinc-300" />
            </div>
            {!editingTitle ? (
              <h1
                className="text-2xl font-semibold text-zinc-100 cursor-text"
                onClick={() => setEditingTitle(true)}
                title="Clique pour renommer la liste"
              >
                {listTitle}
              </h1>
            ) : (
              <input
                className={inputBase + ' text-xl font-semibold'}
                value={listTitle}
                onChange={e => setListTitle(e.target.value)}
                onBlur={saveListTitle}
                onKeyDown={e => { if (e.key === 'Enter') saveListTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                autoFocus
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className={headerButton}
              onClick={() => startInlineAdd(null)}
            >
              <Plus className="h-4 w-4" />
              Nouvelle tâche
            </button>
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Les tâches avec une échéance apparaîtront dans ton calendrier.
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950">
          <div className={'border-b border-zinc-800 bg-zinc-900/60 ' + columnGrid}>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Tâche</div>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Client</div>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Commande</div>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Statut</div>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Priorité</div>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Échéance</div>
            <div className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Commentaires</div>
            <div className="px-3 py-3"></div>
          </div>

          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            <RootRows />
          )}

          {saving && (
            <div className="p-3 text-xs text-zinc-400 border-t border-zinc-800 bg-zinc-900/40">
              Sauvegarde…
            </div>
          )}
        </div>
      </div>

      {/* Drawer commentaires */}
      {commentDrawerOpen && commentTask && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setCommentDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-zinc-300" />
                <div>
                  <div className="text-zinc-100 font-medium">Commentaires</div>
                  <div className="text-zinc-400 text-xs">{commentTask.title}</div>
                </div>
              </div>
              <SubtleButton onClick={() => setCommentDrawerOpen(false)}>Fermer</SubtleButton>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 && (
                <div className="text-sm text-zinc-400">Aucun commentaire pour le moment.</div>
              )}
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg border border-zinc-800 p-3 bg-zinc-900/40">
                  <div className="text-xs text-zinc-400 mb-1">{new Date(c.created_at || '').toLocaleString()}</div>
                  <div className="text-sm text-zinc-100 whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <input
                  className={inputBase + ' flex-1'}
                  placeholder="Écrire un commentaire…"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
                />
                <button className={headerButton} onClick={addComment}>
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------- Utils --------------
function cryptoRandomId() {
  // petit helper pour fallback IDs client-side
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).slice(2);
}

export default TodoListPage;
