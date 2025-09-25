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
  Search as SearchIcon,
  PlusCircle,
} from 'lucide-react';
import { AdvancedColorPicker } from '../components/ui/AdvancedColorPicker';

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
  comments_count?: number | null;
  color?: string | null;      // optionnel en DB
  labels?: string[] | null;   // optionnel en DB
  position?: number | null;   // optionnel en DB
  collapsed?: boolean | null; // optionnel en DB

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

/* ===========================
   UI Tokens / Classes
   =========================== */
const PAGE_BG = 'bg-[#0B0E14]'; // gris foncé du dashboard
const HEADER_CARD =
  'rounded-3xl border border-[#1C2230] bg-[#0F141C]/90 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]';

const BTN_PRIMARY =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-95 transition';
const BTN_SOFT =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-slate-200 bg-[#111722] hover:bg-[#141B27] ring-1 ring-inset ring-[#20293C] transition';
const CHIP_SOFT = 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300';

const TABLE_HEAD =
  'bg-white/5 text-left text-[11px] uppercase tracking-[0.08em] text-slate-300';

const CELL_BASE =
  'px-4 py-3 text-[15px] text-slate-200 border-b border-white/5 align-top';

/* Select moderne (wrappé) */
const SELECT_WRAPPER =
  'relative inline-flex items-center w-full';
const SELECT_BASE =
  'appearance-none w-full px-3.5 py-2.5 rounded-2xl bg-[#0F141C] text-slate-100 ' +
  'border border-[#1C2230] hover:border-[#2A3347] focus:outline-none focus:ring-2 focus:ring-[#2A3347] text-[15px]';
const SELECT_CHEVRON =
  'pointer-events-none absolute right-3 text-slate-400';

/* ===========================
   Helpers
   =========================== */
const DEFAULT_COLUMNS: ColumnKey[] = [
  'task', 'status', 'priority', 'client', 'order', 'due', 'comments', 'tags'
];

const COLOR_SWATCHES = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#22C55E', '#A855F7', '#F97316', '#06B6D4', '#EAB308',
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',         label: 'To do' },
  { value: 'in_progress',  label: 'In progress' },
  { value: 'blocked',      label: 'Blocked' },
  { value: 'done',         label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string; bgColor: string }[] = [
  { value: 'urgent', label: 'P1 Urgent', color: '#EF4444', bgColor: '#FEE2E2' },
  { value: 'high',   label: 'P2 High',   color: '#F59E0B', bgColor: '#FEF3C7' },
  { value: 'medium', label: 'P3 Medium', color: '#10B981', bgColor: '#D1FAE5' },
  { value: 'low',    label: 'P4 Low',    color: '#6B7280', bgColor: '#F3F4F6' },
];

const byPositionThenCreated = (a: TaskRow, b: TaskRow) => {
  const pa = a.position ?? 0;
  const pb = b.position ?? 0;
  if (pa !== pb) return pa - pb;
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
  <span className={`${CHIP_SOFT} ${extra}`}>{text}</span>;

/* Popover util (click-outside close) */
const usePopover = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  return { open, setOpen, ref };
};

/* ===========================
   Page
   =========================== */
const TodoListPage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [query, setQuery] = useState<string>('');

  // 👉 États pour le sélecteur de couleurs avancé
  const [showAdvancedColorPicker, setShowAdvancedColorPicker] = useState(false);
  const [selectedTaskForColor, setSelectedTaskForColor] = useState<TaskRow | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // devient false si la DB n'a pas les colonnes avancées (color/labels/position/collapsed/comments_count)
  const colorPersistSupportedRef = useRef<boolean>(true);

  const tree = useMemo(() => buildTree(rows), [rows]);

  const visibleRows = useMemo(() => {
    const flat = flattenTree(tree, collapsed);
    const byStatus = filterStatus === 'all' ? flat : flat.filter(r => r.status === filterStatus);
    const q = query.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter(r => {
      const hay = [
        r.title,
        r.description || '',
        ...(r.labels || []),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [tree, collapsed, filterStatus, query]);

  /* ----------- LOAD (fallback intelligent) ----------- */
  const loadAll = useCallback(async () => {
    if (!user) return;
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Base de données non configurée');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const cPromise = supabase
        .from('clients')
        .select('id,name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      // Orders → tente user_id, fallback sans si absent
      let oRes = await supabase
        .from('orders')
        .select('id,title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (oRes.error && String(oRes.error.code) === '42703') {
        oRes = await supabase
          .from('orders')
          .select('id,title')
          .order('id', { ascending: true });
      }

      // Tasks → essai étendu, fallback base si colonnes manquent
      let tRes = await supabase
        .from('tasks')
        .select(`
          id, user_id, title, description, status, priority, due_date,
          client_id, order_id, parent_id, list_id, comments_count,
          color, labels, "position", collapsed
        `)
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (tRes.error && String(tRes.error.code) === '42703') {
        colorPersistSupportedRef.current = false;
        tRes = await supabase
          .from('tasks')
          .select(`
            id, user_id, title, description, status, priority, due_date,
            client_id, order_id, parent_id, list_id
          `)
          .eq('user_id', user.id)
          .order('id', { ascending: true });
      }

      const cRes = await cPromise;

      if (cRes.error) throw cRes.error;
      if (oRes.error) throw oRes.error;
      if (tRes.error) throw tRes.error;

      setClients(cRes.data || []);
      setOrders(oRes.data || []);

      const raw = (tRes.data || []) as TaskRow[];
      const normalized = raw.map(r => ({
        ...r,
        comments_count: r.comments_count ?? 0,
        labels: r.labels ?? [],
        collapsed: r.collapsed ?? false,
      }));
      setRows(normalized);

      // Backfill calendrier (si due_date existe mais pas d’event lié)
      await ensureCalendarSync(normalized);
    } catch (e: any) {
      toast.error(`Erreur lors du chargement des données: ${e?.message || 'inconnue'}${e?.code ? ` [${e.code}]` : ''}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ----------- CALENDAR UPSERT ----------- */
  const upsertCalendar = useCallback(async (task: TaskRow) => {
    if (!user || !task.due_date || !supabase) return;
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
      console.warn('[calendar upsert]', e);
    }
  }, [user]);

  const ensureCalendarSync = useCallback(async (tasks: TaskRow[]) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    const withDue = tasks.filter(t => t.due_date);
    if (withDue.length === 0) return;
    try {
      const rows = withDue.map(t => ({
        user_id: user.id,
        title: t.title || 'Task',
        start: t.due_date!,
        end: t.due_date!,
        all_day: true,
        related_task_id: t.id,
      }));
      const { error } = await supabase.from('calendar_events').upsert(rows, { onConflict: 'related_task_id' });
      if (error) console.warn('[ensureCalendarSync]', error);
    } catch (e) {
      console.warn('[ensureCalendarSync]', e);
    }
  }, [user]);

  /* ----------- UPDATE / INSERT / DELETE ----------- */
  const updateTask = useCallback(async (id: UUID, patch: Partial<TaskRow>) => {
    if (!user) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    if (!isSupabaseConfigured || !supabase) return;

    const payload: Record<string, any> = { ...patch };
    if (!colorPersistSupportedRef.current) {
      delete payload.color;
      delete payload.labels;
      delete payload.position;
      delete payload.collapsed;
      delete payload.comments_count;
    }

    try {
      const { error } = await supabase.from('tasks').update(payload).eq('id', id);
      if (error) {
        const msg = String(error?.message || '');
        if (/column .* does not exist/i.test(msg)) {
          colorPersistSupportedRef.current = false;
          toast((t) => (
            <div className="text-sm">
              <div className="font-semibold">Options avancées non activées</div>
              <div className="opacity-80">Exécute le patch SQL (color, labels, position, collapsed, comments_count) pour la persistance complète.</div>
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
      if (typeof patch.due_date !== 'undefined') {
        const task = rows.find(r => r.id === id);
        const merged = { ...(task || {}), ...patch } as TaskRow;
        if (merged.due_date) await upsertCalendar(merged);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    } catch (e: any) {
      console.error('[updateTask]', e);
      toast.error(`Sauvegarde impossible: ${e?.message || 'erreur inconnue'}`);
    }
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
      if (colorPersistSupportedRef.current) {
        payload.color = optimistic.color;
        payload.labels = optimistic.labels;
        payload.collapsed = optimistic.collapsed;
        payload.comments_count = optimistic.comments_count ?? 0;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select('id, title, due_date')
        .single();

      if (error) {
        console.error('[insertTask] error:', error);
        throw error;
      }

      if (data?.id) {
        setRows(prev => prev.map(r => r.id === optimistic.id ? { ...r, id: data.id } : r));
        // sync calendrier si due_date déjà définie (peu probable à la création)
        if (data?.due_date) await upsertCalendar({ ...optimistic, id: data.id, due_date: data.due_date });
      }
      toast.success('Tâche créée');
    } catch (e: any) {
      console.error('[insertTask] catch:', e);
      toast.error(`Création impossible: ${e?.message || 'erreur inconnue'}`);
      setRows(prev => prev.filter(r => r.id !== optimistic.id));
    }
  }, [user, rows, upsertCalendar]);

  const removeTask = useCallback(async (task: TaskRow) => {
    setRows(prev => prev.filter(r => r.id !== task.id && r.parent_id !== task.id));
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      toast('Tâche supprimée', { icon: '🗑️' });
    } catch (e: any) {
      console.error('[removeTask]', e);
      toast.error(`Suppression impossible: ${e?.message || 'erreur inconnue'}`);
    }
  }, []);

  /* ----------- UI helpers ----------- */
  const toggleCollapse = (id: string) => {
    const next = new Set(collapsed);
    next.has(id) ? next.delete(id) : next.add(id);
    setCollapsed(next);
    if (colorPersistSupportedRef.current) {
      updateTask(id, { collapsed: next.has(id) });
    }
  };

  const setTaskColor = (task: TaskRow, color: string | null) => {
    setRows(prev => prev.map(r => r.id === task.id ? { ...r, color } : r));
    updateTask(task.id, { color });
  };

  // 👉 Fonctions pour le sélecteur de couleurs avancé
  const addToRecentColors = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 12); // Garde 12 couleurs récentes max
    });
  }, []);

  const openAdvancedColorPicker = (task: TaskRow) => {
    setSelectedTaskForColor(task);
    setShowAdvancedColorPicker(true);
  };

  const closeAdvancedColorPicker = () => {
    setShowAdvancedColorPicker(false);
    setSelectedTaskForColor(null);
  };

  const handleAdvancedColorChange = (color: string | null) => {
    if (selectedTaskForColor) {
      setTaskColor(selectedTaskForColor, color);
      if (color) {
        addToRecentColors(color);
      }
    }
    closeAdvancedColorPicker();
  };

  /* ----------- Cells (modernisées) ----------- */
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
      <div className="flex items-start gap-3">
        <div className="flex items-center" style={{ paddingLeft: `${(t._depth || 0) * 18}px` }}>
          {t._children && t._children.length > 0 ? (
            <button
              onClick={() => toggleCollapse(t.id)}
              className="p-1.5 rounded-xl hover:bg-white/10"
              title={collapsed.has(t.id) ? 'Expand' : 'Collapse'}
            >
              {collapsed.has(t.id) ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </button>
          ) : (
            <span className="w-7" />
          )}
        </div>

        <div className="mt-1.5">
          <div className="w-2 h-5 rounded-sm" style={{ background: t.color || '#3f3f46' }} />
        </div>

        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? onSave() : e.key === 'Escape' ? (setEditing(false), setVal(t.title)) : null)}
                className="bg-[#0F141C] border border-[#1C2230] rounded-2xl px-3.5 py-2.5 w-full outline-none focus:ring-2 focus:ring-[#2A3347] text-[15px]"
              />
              <button onClick={onSave} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <Check size={16} />
              </button>
              <button onClick={() => { setEditing(false); setVal(t.title); }} className="p-2 rounded-xl hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group text-left w-full inline-flex items-start gap-2 hover:bg-white/5 rounded-xl px-1.5 py-1"
              title="Edit title"
            >
              <span className="text-[15px] text-slate-100">{t.title || 'Untitled'}</span>
              <Pencil size={16} className="opacity-0 group-hover:opacity-60 transition" />
            </button>
          )}

          {/* Actions de la tâche */}
          <div className="mt-2.5 flex items-center justify-between">
            {/* Choix rapide des couleurs */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Color:</span>
              <div className="flex items-center gap-1.5">
                {/* Aperçu de la couleur actuelle */}
                <button
                  onClick={() => openAdvancedColorPicker(t)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1C2230] hover:bg-[#2A3347] transition-colors"
                  title="Advanced color picker"
                >
                  <div 
                    className="w-4 h-4 rounded ring-1 ring-white/20" 
                    style={{ background: t.color || '#3f3f46' }}
                  />
                  <Palette size={12} className="text-slate-400" />
                </button>
                
                {/* Couleurs rapides */}
                {COLOR_SWATCHES.slice(0, 4).map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setTaskColor(t, c);
                      addToRecentColors(c);
                    }}
                    className="w-4 h-4 rounded ring-1 ring-white/20 hover:scale-110 transition-transform"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <button
                  onClick={() => setTaskColor(t, null)}
                  className="px-1.5 text-[11px] rounded bg-white/5 hover:bg-white/10 text-slate-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Bouton d'ajout de sous-tâche */}
            <button
              onClick={() => insertTask(t)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 transition-colors text-xs"
              title="Add subtask"
            >
              <PlusCircle size={12} />
              <span>Add Subtask</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatusCell: React.FC<{ t: TaskRow }> = ({ t }) => (
    <div className={SELECT_WRAPPER}>
      <select
        value={t.status}
        onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
        className={SELECT_BASE}
      >
        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <ChevronDown size={16} className={SELECT_CHEVRON} />
    </div>
  );

  const PriorityCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    const currentPriority = PRIORITY_OPTIONS.find(p => p.value === t.priority);
    
    return (
      <div className={SELECT_WRAPPER}>
        <select
          value={t.priority}
          onChange={(e) => updateTask(t.id, { priority: e.target.value as TaskPriority })}
          className={`${SELECT_BASE} font-medium`}
          style={{
            color: currentPriority?.color || '#6B7280',
            backgroundColor: currentPriority?.bgColor ? `${currentPriority.bgColor}20` : 'transparent',
            borderColor: currentPriority?.color ? `${currentPriority.color}40` : undefined
          }}
        >
          {PRIORITY_OPTIONS.map(p => (
            <option key={p.value} value={p.value} style={{ color: p.color }}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className={SELECT_CHEVRON} />
      </div>
    );
  };

  const ClientCell: React.FC<{ t: TaskRow }> = ({ t }) => (
    <div className="flex items-center gap-2">
      <div className="shrink-0 p-2 rounded-2xl bg-[#111722] ring-1 ring-inset ring-[#20293C]">
        <Building2 size={16} className="text-slate-300" />
      </div>
      <div className={SELECT_WRAPPER}>
        <select
          value={t.client_id || ''}
          onChange={(e) => updateTask(t.id, { client_id: e.target.value || null })}
          className={SELECT_BASE}
        >
          <option value="">—</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <ChevronDown size={16} className={SELECT_CHEVRON} />
      </div>
    </div>
  );

  const OrderCell: React.FC<{ t: TaskRow }> = ({ t }) => (
    <div className="flex items-center gap-2">
      <div className="shrink-0 p-2 rounded-2xl bg-[#111722] ring-1 ring-inset ring-[#20293C]">
        <Package2 size={16} className="text-slate-300" />
      </div>
      <div className={SELECT_WRAPPER}>
        <select
          value={t.order_id || ''}
          onChange={(e) => updateTask(t.id, { order_id: e.target.value || null })}
          className={SELECT_BASE}
        >
          <option value="">—</option>
          {orders.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>
        <ChevronDown size={16} className={SELECT_CHEVRON} />
      </div>
    </div>
  );

  const DueCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
      setShowDatePicker(true);
      // Focus sur l'input après un petit délai pour s'assurer qu'il est rendu
      setTimeout(() => {
        dateInputRef.current?.focus();
        dateInputRef.current?.showPicker?.();
      }, 100);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTask(t.id, { due_date: e.target.value || null });
      setShowDatePicker(false);
    };

    const handleBlur = () => {
      setShowDatePicker(false);
    };

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleIconClick}
          className="shrink-0 p-2 rounded-2xl bg-[#111722] ring-1 ring-inset ring-[#20293C] hover:bg-[#1A2332] hover:ring-[#2A3347] transition-colors"
          title="Set due date"
        >
          <CalendarIcon size={16} className="text-slate-300" />
        </button>
        {showDatePicker ? (
          <input
            ref={dateInputRef}
            type="date"
            value={t.due_date || ''}
            onChange={handleDateChange}
            onBlur={handleBlur}
            className="px-3.5 py-2.5 rounded-2xl bg-[#0F141C] text-slate-100 border border-[#1C2230] hover:border-[#2A3347] focus:outline-none focus:ring-2 focus:ring-[#2A3347] text-[15px]"
            autoFocus
          />
        ) : (
          <div className="px-3.5 py-2.5 rounded-2xl bg-[#0F141C] text-slate-100 border border-[#1C2230] text-[15px] min-h-[44px] flex items-center">
            {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No due date'}
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
        <div className="flex flex-wrap gap-1.5">
          {(labels || []).map((l, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-[#111722] ring-1 ring-inset ring-[#20293C] text-slate-200">
              <Tag size={12} /> {l}
              <button onClick={() => onRemove(l)} className="opacity-60 hover:opacity-100"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? onAdd() : null}
            placeholder="Add tag..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#0F141C] text-slate-100 border border-[#1C2230] hover:border-[#2A3347] focus:outline-none focus:ring-2 focus:ring-[#2A3347] text-[13px]"
          />
          <button onClick={onAdd} className={BTN_SOFT + ' text-[13px] py-2 px-3'}>
            Add
          </button>
        </div>
      </div>
    );
  };

  const CommentsCell: React.FC<{ t: TaskRow }> = ({ t }) => {
    const [open, setOpen] = useState(false);
    const [txt, setTxt] = useState('');
    return (
      <div className="space-y-2">
        <button
          onClick={() => setOpen(v => !v)}
          className={`${BTN_SOFT} px-3 py-2 rounded-2xl text-[13px]`}
          title="Comments"
        >
          <MessageSquare size={16} />
          <span>{t.comments_count ?? 0}</span>
        </button>
        {open && (
          <div className="p-3 rounded-2xl bg-[#0F141C] border border-[#1C2230]">
            <textarea
              rows={3}
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
              className="w-full bg-[#0F141C] border border-[#1C2230] rounded-2xl px-3.5 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-[#2A3347]"
              placeholder="Add a comment..."
            />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className={`${BTN_SOFT} px-3 py-2 text-[13px]`}>Close</button>
              <button
                onClick={async () => { if (txt.trim()) { await addComment(t, txt); setTxt(''); } }}
                className={`${BTN_PRIMARY} px-3 py-2 text-[13px]`}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
    } catch (e: any) {
      console.error('[addComment]', e);
      toast.error(`Commentaire non sauvegardé: ${e?.message || 'erreur inconnue'}`);
    }
  }, [user]);

  /* ----------- Toolbar (modernisée + recherche + popovers stables) ----------- */
  const Toolbar: React.FC = () => {
    const colsPop = usePopover();
    const statusPop = usePopover();
    const colorsPop = usePopover();

    const toggleCol = (c: ColumnKey) => {
      setVisibleCols(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const statusLabel = useMemo(() => {
      if (filterStatus === 'all') return 'All status';
      return STATUS_OPTIONS.find(s => s.value === filterStatus)?.label || 'Status';
    }, [filterStatus]);

    return (
      <div className={`${HEADER_CARD} px-4 sm:px-6 py-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => insertTask()}
              className={BTN_PRIMARY}
            >
              <Plus size={18} /> New task
            </button>

            {/* Columns */}
            <div className="relative" ref={colsPop.ref}>
              <button
                onClick={() => colsPop.setOpen(v => !v)}
                className={BTN_SOFT}
                title="Columns"
              >
                <SlidersHorizontal size={18} /> Columns
              </button>
              {colsPop.open && (
                <div className="absolute z-20 mt-2 w-64 p-3 rounded-2xl bg-[#0F141C] border border-[#1C2230] shadow-xl">
                  {DEFAULT_COLUMNS.map(c => (
                    <label key={c} className="flex items-center justify-between gap-2 py-1.5 text-[14px]">
                      <span className="capitalize text-slate-200">{c}</span>
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={visibleCols.includes(c)}
                        onChange={() => toggleCol(c)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter (custom dropdown propre) */}
            <div className="relative" ref={statusPop.ref}>
              <button
                onClick={() => statusPop.setOpen(v => !v)}
                className={BTN_SOFT + ' min-w-[160px] justify-between'}
                title="Filter by status"
              >
                <span className="inline-flex items-center gap-2">
                  <Filter size={18} />
                  {statusLabel}
                </span>
                <ChevronDown size={16} />
              </button>

              {statusPop.open && (
                <div className="absolute z-20 mt-2 w-56 p-2 rounded-2xl bg-[#0F141C] border border-[#1C2230] shadow-xl">
                  <button
                    onClick={() => { setFilterStatus('all'); statusPop.setOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-slate-200 text-[14px]"
                  >
                    All status
                  </button>
                  <div className="my-1 h-px bg-white/5" />
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => { setFilterStatus(s.value); statusPop.setOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-[14px] ${filterStatus === s.value ? 'bg-white/5' : ''}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors popover (look & close fix) */}
            <div className="relative" ref={colorsPop.ref}>
              <button
                onClick={() => colorsPop.setOpen(v => !v)}
                className={BTN_SOFT}
                title="Color palette"
              >
                <Palette size={18} /> Colors
              </button>
              {colorsPop.open && (
                <div className="absolute z-20 mt-2 p-3 rounded-2xl bg-[#0F141C] border border-[#1C2230] shadow-xl min-w-[260px]">
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_SWATCHES.map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded ring-1 ring-white/10" style={{ background: c }} />
                        <span className="text-xs text-slate-400">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Apply per task from the <span className="text-slate-300">Task</span> column.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 min-w-[260px] w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[320px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, tags, descriptions…"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#0F141C] text-slate-100 border border-[#1C2230] hover:border-[#2A3347] focus:outline-none focus:ring-2 focus:ring-[#2A3347] text-[15px]"
              />
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {pill(`Total: ${rows.length}`)}
              {pill(`Visible: ${visibleRows.length}`)}
              <span className={`${CHIP_SOFT} gap-1.5`}>
                <Clock size={12} /> Autosave
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ----------- Render ----------- */
  return (
    <Layout>
      <div className={`min-h-[calc(100vh-64px)] w-full ${PAGE_BG}`}>
        {/* Header */}
        <div className="px-4 sm:px-6 pt-6">
          <div className={`${HEADER_CARD} px-5 sm:px-7 py-5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-md">
                  <ListChecks size={22} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 leading-tight">To-Do List</h1>
                  <p className="text-[13px] text-slate-400 mt-1">
                    Planifie, organise et exécute — subtasks illimitées, sélecteur de couleurs avancé & colonnes personnalisables.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Toolbar />
          </div>
        </div>

        {/* Table */}
        <div className="px-4 sm:px-6 mt-5 pb-12">
          <div className={`${cardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className={TABLE_HEAD}>
                    {visibleCols.includes('task') && <th className="px-4 py-3 w-[38%]">Task</th>}
                    {visibleCols.includes('status') && <th className="px-4 py-3 w-[12%]">Status</th>}
                    {visibleCols.includes('priority') && <th className="px-4 py-3 w-[12%]">Priority</th>}
                    {visibleCols.includes('client') && <th className="px-4 py-3 w-[14%]">Client</th>}
                    {visibleCols.includes('order') && <th className="px-4 py-3 w-[14%]">Order</th>}
                    {visibleCols.includes('due') && <th className="px-4 py-3 w-[12%]">Due</th>}
                    {visibleCols.includes('comments') && <th className="px-4 py-3 w-[8%]">Comments</th>}
                    {visibleCols.includes('tags') && <th className="px-4 py-3 w-[20%]">Tags</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-[15px]">Loading…</td></tr>
                  ) : visibleRows.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-300 text-[15px]">
                      Aucune tâche.{' '}
                      <button onClick={() => insertTask()} className="underline decoration-slate-400 hover:decoration-slate-200">
                        Créer une première tâche
                      </button>.
                    </td></tr>
                  ) : (
                    visibleRows.map((t) => (
                      <tr key={t.id} className="hover:bg-white/3">
                        {visibleCols.includes('task') && (
                          <td className={`${CELL_BASE}`}>
                            <TitleCell t={t} />
                          </td>
                        )}
                        {visibleCols.includes('status') && <td className={`${CELL_BASE}`}><StatusCell t={t} /></td>}
                        {visibleCols.includes('priority') && <td className={`${CELL_BASE}`}><PriorityCell t={t} /></td>}
                        {visibleCols.includes('client') && <td className={`${CELL_BASE}`}><ClientCell t={t} /></td>}
                        {visibleCols.includes('order') && <td className={`${CELL_BASE}`}><OrderCell t={t} /></td>}
                        {visibleCols.includes('due') && <td className={`${CELL_BASE}`}><DueCell t={t} /></td>}
                        {visibleCols.includes('comments') && <td className={`${CELL_BASE}`}><CommentsCell t={t} /></td>}
                        {visibleCols.includes('tags') && <td className={`${CELL_BASE}`}><TagsCell t={t} /></td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* (Légende P1/P2/P3/P4 retirée comme demandé) */}
        </div>
      </div>

      {/* 👉 Sélecteur de couleurs avancé */}
      {showAdvancedColorPicker && selectedTaskForColor && (
        <AdvancedColorPicker
          currentColor={selectedTaskForColor.color || null}
          onColorChange={handleAdvancedColorChange}
          onClose={closeAdvancedColorPicker}
          recentColors={recentColors}
          onAddToHistory={addToRecentColors}
        />
      )}
    </Layout>
  );
};

export default TodoListPage;
