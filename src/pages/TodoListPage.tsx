// src/pages/TodoListPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Layout, { cardClass } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  ListChecks,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageSquare,
  Tag,
  Palette,
  SlidersHorizontal,
  Filter,
  Trash2,
  Save,
  X,
  Check,
  Clock,
  Building2,
  Package2,
  Pencil,
} from 'lucide-react';

/** ===========================
 *  Types
 *  =========================== */
type UUID = string;

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TaskRow {
  id: UUID;
  user_id?: UUID;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null; // yyyy-mm-dd
  client_id?: UUID | null;
  order_id?: UUID | null;
  parent_id?: UUID | null;
  list_id?: UUID | null;
  comments_count?: number;
  // Champs optionnels (peuvent ne pas exister en DB — gérés avec fallback UI)
  color?: string | null;
  labels?: string[] | null;
  position?: number | null;
  collapsed?: boolean | null;

  // Locaux/UI
  _depth?: number;
  _children?: TaskRow[];
  _loading?: boolean;
}

interface ClientLite { id: UUID; name: string }
interface OrderLite { id: UUID; title: string }

type ColumnKey =
  | 'task'
  | 'status'
  | 'priority'
  | 'client'
  | 'order'
  | 'due'
  | 'comments'
  | 'tags';

/** ===========================
 *  Constantes / Palettes
 *  =========================== */
const DEFAULT_COLUMNS: ColumnKey[] = [
  'task', 'status', 'priority', 'client', 'order', 'due', 'comments', 'tags'
];

const COLOR_SWATCHES = [
  '#EF4444', // red-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#22C55E', // green-500
  '#A855F7', // purple-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
  '#EAB308', // yellow-500
];

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo',         label: 'To do',        color: 'bg-zinc-700' },
  { value: 'in_progress',  label: 'In progress',  color: 'bg-blue-600' },
  { value: 'blocked',      label: 'Blocked',      color: 'bg-rose-600' },
  { value: 'done',         label: 'Done',         color: 'bg-emerald-600' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; dot: string }[] = [
  { value: 'urgent', label: 'P1 Urgent', dot: 'bg-rose-500' },
  { value: 'high',   label: 'P2 High',   dot: 'bg-amber-500' },
  { value: 'medium', label: 'P3 Medium', dot: 'bg-blue-500' },
  { value: 'low',    label: 'P4 Low',    dot: 'bg-zinc-500' },
];

const CELL_BASE =
  'px-3 py-2 text-sm text-slate-200 border-b border-white/5 align-top';

/** ===========================
 *  Utils
 *  =========================== */
const byPositionThenCreated = (a: TaskRow, b: TaskRow) => {
  const pa = a.position ?? 0;
  const pb = b.position ?? 0;
  if (pa !== pb) return pa - pb;
  // fallback: stable by id
  return a.id.localeCompare(b.id);
};

const buildTree = (rows: TaskRow[]): TaskRow[] => {
  const map = new Map<string, TaskRow>();
  rows.forEach(r => map.set(r.id, { ...r, _children: [] }));

  const roots: TaskRow[] = [];
  rows.forEach(r => {
    if (r.parent_id && map.has(r.parent_id)) {
      const parent = map.get(r.parent_id)!;
      parent._children!.push(map.get(r.id)!);
    } else {
      roots.push(map.get(r.id)!);
    }
  });

  const assignDepth = (node: TaskRow, depth: number) => {
    node._depth = depth;
    node._children?.sort(byPositionThenCreated).forEach(c => assignDepth(c, depth + 1));
  };
  roots.sort(byPositionThenCreated).forEach(r => assignDepth(r, 0));
  return roots;
};

const flattenTree = (nodes: TaskRow[], collapsedIds: Set<string>): TaskRow[] => {
  const out: TaskRow[] = [];
  const walk = (n: TaskRow) => {
    out.push(n);
    const isCollapsed = collapsedIds.has(n.id) || n.collapsed;
    if (!isCollapsed) n._children?.forEach(walk);
  };
  nodes.forEach(walk);
  return out;
};

const pill = (text: string, extra = '') =>
  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${extra}`}>
    {text}
  </span>;

/** ===========================
 *  Page
 *  =========================== */
const TodoListPage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [tree, setTree] = useState<TaskRow[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  const colorPersistSupportedRef = useRef<boolean>(true); // devient false si la colonne "color" n'existe pas en DB

  const visibleRows = useMemo(() => {
    const t = buildTree(rows);
    setTree(t);
    const flat = flattenTree(t, collapsed);
    return filterStatus === 'all' ? flat : flat.filter(r => r.status === filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, collapsed, filterStatus]);

  /** ------------- Load data ------------- */
  const loadAll = useCallback(async () => {
    if (!user) return;
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Base de données non configurée');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cRes, oRes, tRes] = await Promise.all([
        supabase.from('clients')
          .select('id,name')
          .eq('user_id', user.id)
          .order('name', { ascending: true }),
        supabase.from('orders')
          .select('id,title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('tasks')
          .select(`
            id, user_id, title, description, status, priority, due_date,
            client_id, order_id, parent_id, list_id, comments_count,
            color, labels, position, collapsed
          `) // si certaines colonnes n'existent pas, Supabase renverra null pour ces champs si la policy le permet ; sinon on gèrera via try/catch à la sauvegarde
          .eq('user_id', user.id)
          .order('position', { ascending: true })
      ]);

      if (cRes.error) throw cRes.error;
      if (oRes.error) throw oRes.error;
      if (tRes.error) throw tRes.error;

      setClients(cRes.data || []);
      setOrders(oRes.data || []);
      setRows((tRes.data as TaskRow[] | null) || []);
    } catch (e: any) {
      console.error(e);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /** ------------- Helpers Supabase ------------- */
  const upsertCalendar = useCallback(async (task: TaskRow) => {
    if (!user || !task.due_date) return;
    try {
      await supabase.from('calendar_events').upsert({
        user_id: user.id,
        title: task.title || 'Task',
        start: task.due_date,
        end: task.due_date,
        all_day: true,
        related_task_id: task.id,
      }, { onConflict: 'related_task_id' });
    } catch (e) {
      // non bloquant
      console.warn('[calendar upsert]', e);
    }
  }, [user]);

  const updateTask = useCallback(async (id: UUID, patch: Partial<TaskRow>) => {
    if (!user) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    if (!isSupabaseConfigured || !supabase) return;

    const payload: Record<string, any> = { ...patch };
    // Si la DB n’a pas la colonne "color"/"labels"/"position"/"collapsed", supprime-les du payload et désactive la persistance
    if (!colorPersistSupportedRef.current) {
      delete payload.color;
      delete payload.labels;
      delete payload.position;
      delete payload.collapsed;
    }

    try {
      const { error } = await supabase.from('tasks').update(payload).eq('id', id);
      if (error) {
        const msg = String(error?.message || '');
        // Heuristique: si "column \"color\" does not exist" etc → on coupe la persistance couleur/labels/position
        if (/column .* does not exist/i.test(msg)) {
          colorPersistSupportedRef.current = false;
          toast((t) => (
            <div className="text-sm">
              <div className="font-semibold">Option couleur avancée non activée</div>
              <div className="opacity-80">Exécute le patch SQL proposé pour ajouter <code>color</code>, <code>labels</code>, <code>position</code>, <code>collapsed</code>.</div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="mt-2 px-3 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                OK
              </button>
            </div>
          ), { duration: 6000 });
        } else {
          throw error;
        }
      }
      // calendrier
      if (typeof patch.due_date !== 'undefined') {
        const task = rows.find(r => r.id === id);
        const merged = { ...(task || {}), ...patch } as TaskRow;
        if (merged.due_date) await upsertCalendar(merged);
      }
    } catch (e) {
      console.error(e);
      toast.error('Sauvegarde impossible (réseau ou droits)');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, rows, upsertCalendar]);

  const insertTask = useCallback(async (parent?: TaskRow) => {
    if (!user) return;
    const optimistic: TaskRow = {
      id: `tmp_${Math.random().toString(36).slice(2)}`,
      title: 'New task',
      status: 'todo',
      priority: 'medium',
      user_id: user.id,
      parent_id: parent?.id ?? null,
      comments_count: 0,
      position: (parent?._children?.length || 0) + (rows.length + 1),
      color: null,
      labels: [],
      collapsed: false,
      _depth: (parent?._depth ?? -1) + 1,
      _children: []
    };
    setRows(prev => [optimistic, ...prev]);

    if (!isSupabaseConfigured || !supabase) return;

    try {
      const payload: any = {
        user_id: user.id,
        title: optimistic.title,
        status: optimistic.status,
        priority: optimistic.priority,
        parent_id: optimistic.parent_id,
        position: optimistic.position,
      };
      // persistance color si dispo
      if (colorPersistSupportedRef.current) {
        payload.color = optimistic.color;
        payload.labels = optimistic.labels;
        payload.collapsed = optimistic.collapsed;
      }
      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;
      if (data?.id) {
        setRows(prev => prev.map(r => r.id === optimistic.id ? { ...r, id: data.id } : r));
      }
      toast.success('Tâche créée');
    } catch (e) {
      console.error(e);
      toast.error('Création impossible');
      // rollback
      setRows(prev => prev.filter(r => r.id !== optimistic.id));
    }
  }, [user, rows]);

  const removeTask = useCallback(async (task: TaskRow) => {
    setRows(prev => prev.filter(r => r.id !== task.id && r.parent_id !== task.id)); // naïf: enlève aussi enfants directs (cascade côté DB gère tout)
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      toast('Tâche supprimée', { icon: '🗑️' });
    } catch (e) {
      console.error(e);
      toast.error('Suppression impossible');
    }
  }, []);

  const addComment = useCallback(async (task: TaskRow, content: string) => {
    if (!user || !content.trim()) return;
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('task_comments').insert({
        task_id: task.id,
        user_id: user.id,
        content: content.trim()
      });
      if (error) throw error;
      setRows(prev => prev.map(r => r.id === task.id
        ? { ...r, comments_count: (r.comments_count || 0) + 1 }
        : r));
    } catch (e) {
      console.error(e);
      toast.error('Commentaire non sauvegardé');
    }
  }, [user]);

  /** ------------- UI utils ------------- */
  const toggleCollapse = (id: string) => {
    const next = new Set(collapsed);
    next.has(id) ? next.delete(id) : next.add(id);
    setCollapsed(next);
    // Persistance optionnelle si supporté (champ collapsed)
    if (colorPersistSupportedRef.current) {
      updateTask(id, { collapsed: next.has(id) });
    }
  };

  const setTaskColor = (task: TaskRow, color: string | null) => {
    // visu immédiate
    setRows(prev => prev.map(r => r.id === task.id ? { ...r, color } : r));
    // persistance
    updateTask(task.id, { color });
  };

  /** ------------- Cellules ------------- */
  const TitleCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(t.title);
    useEffect(() => setVal(t.title), [t.title]);

    const onSave = async () => {
      setEditing(false);
      if (val.trim() && val !== t.title) {
        await updateTask(t.id, { title: val.trim() });
      } else {
        setVal(t.title);
      }
    };

    return (
      <div className="flex items-start gap-2">
        {/* indent + caret */}
        <div className="flex items-center" style={{ paddingLeft: `${(t._depth || 0) * 16}px` }}>
          {t._children && t._children.length > 0 ? (
            <button
              onClick={() => toggleCollapse(t.id)}
              className="p-1 rounded hover:bg-white/10"
              title={collapsed.has(t.id) ? 'Expand' : 'Collapse'}
            >
              {collapsed.has(t.id) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          ) : (
            <span className="w-6" />
          )}
        </div>

        {/* couleur (bande/puce) */}
        <div className="mt-1">
          <div className="w-2 h-4 rounded-sm" style={{ background: t.color || '#3f3f46' }} />
        </div>

        {/* titre editable */}
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? onSave() : e.key === 'Escape' ? (setEditing(false), setVal(t.title)) : null)}
                className="bg-black/40 border border-white/10 rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-white/10"
              />
              <button onClick={onSave} className="p-1 rounded bg-white/10 hover:bg-white/20">
                <Check size={14} />
              </button>
              <button onClick={() => { setEditing(false); setVal(t.title); }} className="p-1 rounded hover:bg-white/10">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group text-left w-full inline-flex items-start gap-2 hover:bg-white/5 rounded px-1 py-0.5"
              title="Edit title"
            >
              <span className="text-slate-100">{t.title || 'Untitled'}</span>
              <Pencil size={14} className="opacity-0 group-hover:opacity-60 transition" />
            </button>
          )}

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => insertTask(t)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10"
              title="Add subtask"
            >
              <Plus size={12} /> Subtask
            </button>
            <button
              onClick={() => removeTask(t)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 text-rose-300"
              title="Delete task"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatusCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    return (
      <div className="relative">
        <select
          value={t.status}
          onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/10"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    );
  };

  const PriorityCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    return (
      <select
        value={t.priority}
        onChange={(e) => updateTask(t.id, { priority: e.target.value as TaskPriority })}
        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/10"
      >
        {PRIORITY_OPTIONS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    );
  };

  const ClientCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    return (
      <div className="flex items-center gap-2">
        <Building2 size={14} className="opacity-60" />
        <select
          value={t.client_id || ''}
          onChange={(e) => updateTask(t.id, { client_id: e.target.value || null })}
          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/10 w-full"
        >
          <option value="">—</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    );
  };

  const OrderCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    return (
      <div className="flex items-center gap-2">
        <Package2 size={14} className="opacity-60" />
        <select
          value={t.order_id || ''}
          onChange={(e) => updateTask(t.id, { order_id: e.target.value || null })}
          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/10 w-full"
        >
          <option value="">—</option>
          {orders.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>
      </div>
    );
  };

  const DueCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    return (
      <div className="flex items-center gap-2">
        <CalendarIcon size={14} className="opacity-60" />
        <input
          type="date"
          value={t.due_date || ''}
          onChange={(e) => updateTask(t.id, { due_date: e.target.value || null })}
          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/10"
        />
      </div>
    );
  };

  const CommentsCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    const [open, setOpen] = useState(false);
    const [txt, setTxt] = useState('');
    return (
      <div className="space-y-1">
        <button
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
          title="Comments"
        >
          <MessageSquare size={14} />
          <span>{t.comments_count || 0}</span>
        </button>
        {open && (
          <div className="p-2 bg-black/40 border border-white/10 rounded">
            <textarea
              rows={2}
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Add a comment..."
            />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-2 py-1 rounded hover:bg-white/10 text-slate-300">Close</button>
              <button
                onClick={async () => { await addComment(t, txt); setTxt(''); }}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                <Save size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TagsCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    const [input, setInput] = useState('');
    const labels = t.labels || [];
    const onAdd = async () => {
      const nv = input.trim();
      if (!nv) return;
      const next = Array.from(new Set([...(labels || []), nv]));
      setInput('');
      setRows(prev => prev.map(r => r.id === t.id ? { ...r, labels: next } : r));
      await updateTask(t.id, { labels: next as any });
    };
    const onRemove = async (label: string) => {
      const next = (labels || []).filter(l => l !== label);
      setRows(prev => prev.map(r => r.id === t.id ? { ...r, labels: next } : r));
      await updateTask(t.id, { labels: next as any });
    };
    return (
      <div>
        <div className="flex flex-wrap gap-1">
          {(labels || []).map((l, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10">
              <Tag size={12} /> {l}
              <button onClick={() => onRemove(l)} className="opacity-60 hover:opacity-100"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? onAdd() : null}
            placeholder="Add tag..."
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-white/10"
          />
          <button onClick={onAdd} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs">
            Add
          </button>
        </div>
      </div>
    );
  };

  /** ------------- Header / Toolbar ------------- */
  const Toolbar: React.FC = () => {
    const [showCols, setShowCols] = useState(false);
    const [showColors, setShowColors] = useState(false);

    const toggleCol = (c: ColumnKey) => {
      setVisibleCols(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => insertTask()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
          >
            <Plus size={16} /> New task
          </button>

          <div className="relative">
            <button
              onClick={() => setShowCols(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10"
              title="Columns"
            >
              <SlidersHorizontal size={16} /> Columns
            </button>
            {showCols && (
              <div className="absolute z-10 mt-2 w-56 p-3 rounded-xl bg-black border border-white/10 shadow-xl">
                {DEFAULT_COLUMNS.map(c => (
                  <label key={c} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(c)}
                      onChange={() => toggleCol(c)}
                    />
                    <span className="capitalize">{c}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10" title="Filter (status)">
            <Filter size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-transparent outline-none"
            >
              <option value="all">All status</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColors(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10"
              title="Color palette (task color)"
            >
              <Palette size={16} /> Colors
            </button>
            {showColors && (
              <div className="absolute z-10 mt-2 p-3 rounded-xl bg-black border border-white/10 shadow-xl">
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded" style={{ background: c }} />
                      <span className="text-xs text-slate-400">{c}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-400">Sélecteur global (info) — appliquez la couleur par tâche via l’icône pipette dans la colonne Task.</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pill(`Total: ${rows.length}`, 'bg-white/5')}
          {pill(`Visible: ${visibleRows.length}`, 'bg-white/5')}
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5">
            <Clock size={12} /> Autosave
          </span>
        </div>
      </div>
    );
  };

  /** ------------- Rendu ------------- */
  return (
    <Layout>
      {/* fond noir total (page) */}
      <div className="min-h-[calc(100vh-64px)] w-full bg-black">
        {/* header */}
        <div className="px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10">
                <ListChecks size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">To-Do List</h1>
                <p className="text-sm text-slate-400">Planifie, organise et exécute — subtasks illimitées & colonnes personnalisables.</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Toolbar />
          </div>
        </div>

        {/* table */}
        <div className="px-4 sm:px-6 mt-4 pb-10">
          <div className={`${cardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-300">
                    {visibleCols.includes('task') && (
                      <th className="px-3 py-2 w-[38%]">Task</th>
                    )}
                    {visibleCols.includes('status') && (
                      <th className="px-3 py-2 w-[10%]">Status</th>
                    )}
                    {visibleCols.includes('priority') && (
                      <th className="px-3 py-2 w-[10%]">Priority</th>
                    )}
                    {visibleCols.includes('client') && (
                      <th className="px-3 py-2 w-[12%]">Client</th>
                    )}
                    {visibleCols.includes('order') && (
                      <th className="px-3 py-2 w-[12%]">Order</th>
                    )}
                    {visibleCols.includes('due') && (
                      <th className="px-3 py-2 w-[10%]">Due</th>
                    )}
                    {visibleCols.includes('comments') && (
                      <th className="px-3 py-2 w-[8%]">Comments</th>
                    )}
                    {visibleCols.includes('tags') && (
                      <th className="px-3 py-2 w-[20%]">Tags</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">Loading…</td></tr>
                  ) : visibleRows.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                      Aucune tâche. <button onClick={() => insertTask()} className="underline">Créer une première tâche</button>.
                    </td></tr>
                  ) : (
                    visibleRows.map((t) => (
                      <tr key={t.id} className="hover:bg-white/2">
                        {visibleCols.includes('task') && (
                          <td className={`${CELL_BASE}`}>
                            <TitleCell t={t} />
                            {/* Actions rapides couleurs pour la tâche */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-slate-400">Color:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {COLOR_SWATCHES.slice(0, 8).map(c => (
                                  <button
                                    key={c}
                                    onClick={() => setTaskColor(t, c)}
                                    className="w-4 h-4 rounded ring-1 ring-white/20"
                                    style={{ background: c }}
                                    title={c}
                                  />
                                ))}
                                <button
                                  onClick={() => setTaskColor(t, null)}
                                  className="px-1 text-xs rounded bg-white/5 hover:bg-white/10"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleCols.includes('status') && (
                          <td className={`${CELL_BASE}`}><StatusCell t={t} /></td>
                        )}
                        {visibleCols.includes('priority') && (
                          <td className={`${CELL_BASE}`}><PriorityCell t={t} /></td>
                        )}
                        {visibleCols.includes('client') && (
                          <td className={`${CELL_BASE}`}><ClientCell t={t} /></td>
                        )}
                        {visibleCols.includes('order') && (
                          <td className={`${CELL_BASE}`}><OrderCell t={t} /></td>
                        )}
                        {visibleCols.includes('due') && (
                          <td className={`${CELL_BASE}`}><DueCell t={t} /></td>
                        )}
                        {visibleCols.includes('comments') && (
                          <td className={`${CELL_BASE}`}><CommentsCell t={t} /></td>
                        )}
                        {visibleCols.includes('tags') && (
                          <td className={`${CELL_BASE}`}><TagsCell t={t} /></td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Légende */}
          <div className="mt-3 text-xs text-slate-400 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> P1</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> P2</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> P3</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-500 inline-block" /> P4</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TodoListPage;
