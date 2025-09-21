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

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'urgent', label: 'P1 Urgent' },
  { value: 'high',   label: 'P2 High'   },
  { value: 'medium', label: 'P3 Medium' },
  { value: 'low',    label: 'P4 Low'    },
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

  // devient false si la DB n’a pas les colonnes avancées (color/labels/position/collapsed/comments_count)
  const colorPersistSupportedRef = useRef<boolean>(true);

  const tree = useMemo(() => buildTree(rows), [rows]);
  const visibleRows = useMemo(() => {
    const flat = flattenTree(tree, collapsed);
    return filterStatus === 'all' ? flat : flat.filter(r => r.status === filterStatus);
  }, [tree, collapsed, filterStatus]);

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
      console.warn('[calendar upsert]', e);
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
    } catch (e: any) {
      console.error('[updateTask]', e);
      toast.error(`Sauvegarde impossible: ${e?.message || 'erreur inconnue'}`);
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
      if (colorPersistSupportedRef.current) {
        payload.color = optimistic.color;
        payload.labels = optimistic.labels;
        payload.collapsed = optimistic.collapsed;
        payload.comments_count = optimistic.comments_count ?? 0;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('[insertTask] error:', error);
        throw error;
      }

      if (data?.id) {
        setRows(prev => prev.map(r => r.id === optimistic.id ? { ...r, id: data.id } : r));
      }
      toast.success('Tâche créée');
    } catch (e: any) {
      console.error('[insertTask] catch:', e);
      toast.error(`Création impossible: ${e?.message || 'erreur inconnue'}`);
      setRows(prev => prev.filter(r => r.id !== optimistic.id));
    }
  }, [user, rows]);

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
          <div className="w-2.5 h-5 rounded-sm" style={{ background: t.color || '#3f3f46' }} />
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

          <div className="mt-1.5 flex items-center gap-2 text-[12px] text-slate-400">
            <button
              onClick={() => insertTask(t)}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-white/10"
              title="Add subtask"
            >
              <Plus size={13} /> Subtask
            </button>
            <button
              onClick={() => removeTask(t)}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-white/10 text-rose-300"
              title="Delete task"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>

          {/* Choix rapide des couleurs */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-slate-400">Color:</span>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_SWATCHES.slice(0, 8).map(c => (
                <button
                  key={c}
                  onClick={() => setTaskColor(t, c)}
                  className="w-4.5 h-4.5 rounded ring-1 ring-white/20"
                  style={{ background: c }}
                  title={c}
                />
              ))}
              <button
                onClick={() => setTaskColor(t, null)}
                className="px-1.5 text-[11px] rounded bg-white/5 hover:bg-white/10"
              >
                Clear
              </button>
            </div>
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

  const PriorityCell: React.FC<{ t: TaskRow }> = ({ t }) => (
    <div className={SELECT_WRAPPER}>
      <select
        value={t.priority}
        onChange={(e) => updateTask(t.id, { priority: e.target.value as TaskPriority })}
        className={SELECT_BASE}
      >
        {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <ChevronDown size={16} className={SELECT_CHEVRON} />
    </div>
  );

  const ClientCell: React.FC<{ t: TaskRow }> = ({ t }) => (
    <div className="flex items-center gap-2">
      <div className="shrink-0 p-2 rounded-xl bg-[#111722] ring-1 ring-inset ring-[#20293C]">
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
      <div className="shrink-0 p-2 rounded-xl bg-[#111722] ring-1 ring-inset ring-[#20293C]">
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

  const DueCell: React.FC<{ t: TaskRow }> = ({ t }) => (
    <div className="flex items-center gap-2">
      <div className="shrink-0 p-2 rounded-xl bg-[#111722] ring-1 ring-inset ring-[#20293C]">
        <CalendarIcon size={16} className="text-slate-300" />
      </div>
      <input
        type="date"
        value={t.due_date || ''}
        onChange={(e) => updateTask(t.id, { due_date: e.target.value || null })}
        className="px-3.5 py-2.5 rounded-2xl bg-[#0F141C] text-slate-100 border border-[#1C2230] hover:border-[#2A3347] focus:outline-none focus:ring-2 focus:ring-[#2A3347] text-[15px]"
      />
    </div>
  );

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

  /* ----------- Toolbar (modernisée) ----------- */
  const Toolbar: React.FC = () => {
    const [showCols, setShowCols] = useState(false);
    const [showColors, setShowColors] = useState(false);

    const toggleCol = (c: ColumnKey) => {
      setVisibleCols(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    return (
      <div className={`${HEADER_CARD} px-4 sm:px-6 py-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => insertTask()}
              className={BTN_PRIMARY}
            >
              <Plus size={18} /> New task
            </button>

            <div className="relative">
              <button
                onClick={() => setShowCols(v => !v)}
                className={BTN_SOFT}
                title="Columns"
              >
                <SlidersHorizontal size={18} /> Columns
              </button>
              {showCols && (
                <div className="absolute z-10 mt-2 w-64 p-3 rounded-2xl bg-[#0F141C] border border-[#1C2230] shadow-xl">
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

            <div className={`${BTN_SOFT} gap-3`}>
              <Filter size={18} />
              <div className={SELECT_WRAPPER + ' w-48'}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent text-[14px] outline-none"
                >
                  <option value="all">All status</option>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowColors(v => !v)}
                className={BTN_SOFT}
                title="Color palette"
              >
                <Palette size={18} /> Colors
              </button>
              {showColors && (
                <div className="absolute z-10 mt-2 p-3 rounded-2xl bg-[#0F141C] border border-[#1C2230] shadow-xl">
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_SWATCHES.map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded ring-1 ring-white/10" style={{ background: c }} />
                        <span className="text-xs text-slate-400">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">Applique la couleur par tâche depuis la colonne Task.</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pill(`Total: ${rows.length}`)}
            {pill(`Visible: ${visibleRows.length}`)}
            <span className={`${CHIP_SOFT} gap-1.5`}>
              <Clock size={12} /> Autosave
            </span>
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
                    Planifie, organise et exécute — subtasks illimitées & colonnes personnalisables.
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

          {/* Légende */}
          <div className="mt-4 text-[12px] text-slate-400 flex flex-wrap items-center gap-3">
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
