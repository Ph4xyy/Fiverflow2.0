// src/pages/OrderEditPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import ModernButton from '@/components/ModernButton';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// Types
interface Client {
  id: string;
  name: string;
  platform: string;
}

interface OrderData {
  id: string;
  title: string;
  description?: string;
  budget: number;
  status: string;
  due_date: string;
  created_at: string;
  start_date?: string;
  completed_date?: string;
  platform?: string;
  client_name?: string;
  client_email?: string;
  client_id?: string;
  clients?: {
    id: string;
    name: string;
    platform: string | null;
  };
}

const OrderEditPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    budget: '',
    status: 'pending',
    due_date: '',
    start_date: '',
    completed_date: '',
    platform: '',
    client_name: '',
    client_email: '',
  });

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !user) return;

      try {
        setLoading(true);
        setError(null);

        if (!isSupabaseConfigured || !supabase) {
          // Demo mode
          const demoOrder: OrderData = {
            id: orderId,
            title: 'Demo Order',
            description: 'This is a demo order for testing',
            budget: 500,
            status: 'in_progress',
            due_date: '2025-12-31',
            created_at: new Date().toISOString(),
            start_date: '2025-01-01',
            platform: 'Fiverr',
            client_name: 'Demo Client',
            client_email: 'demo@client.com',
            client_id: 'demo-client-id',
            clients: {
              id: 'demo-client-id',
              name: 'Demo Client',
              platform: 'Fiverr'
            }
          };
          setOrder(demoOrder);
          setFormData({
            title: demoOrder.title,
            description: demoOrder.description || '',
            client_id: demoOrder.client_id || '',
            budget: demoOrder.budget.toString(),
            status: demoOrder.status,
            due_date: demoOrder.due_date,
            start_date: demoOrder.start_date || '',
            completed_date: demoOrder.completed_date || '',
            platform: demoOrder.platform || '',
            client_name: demoOrder.client_name || '',
            client_email: demoOrder.client_email || '',
          });
          return;
        }

        // Fetch order from Supabase
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,title,description,budget,status,due_date,created_at,
            start_date,completed_date,platform,client_name,client_email,
            client_id,
            clients!inner(id,name,platform,user_id)
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (orderError) throw orderError;

        if (orderData) {
          setOrder(orderData);
          setFormData({
            title: orderData.title || '',
            description: orderData.description || '',
            client_id: orderData.client_id || '',
            budget: orderData.budget?.toString() || '',
            status: orderData.status || 'pending',
            due_date: orderData.due_date || '',
            start_date: orderData.start_date || '',
            completed_date: orderData.completed_date || '',
            platform: orderData.platform || '',
            client_name: orderData.client_name || '',
            client_email: orderData.client_email || '',
          });
        }
      } catch (err: any) {
        console.error('Error loading order:', err);
        setError(err.message || 'Failed to load order');
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, user]);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;

      try {
        if (!isSupabaseConfigured || !supabase) {
          // Demo clients
          setClients([
            { id: '1', name: 'Demo Client 1', platform: 'Fiverr' },
            { id: '2', name: 'Demo Client 2', platform: 'Upwork' }
          ]);
          return;
        }

        const { data, error } = await supabase
          .from('clients')
          .select('id,name,platform')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Error loading clients:', err);
        toast.error('Failed to load clients');
      }
    };

    loadClients();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !user) return;

    try {
      setSaving(true);

      if (!isSupabaseConfigured || !supabase) {
        // Demo mode
        toast.success('Order updated successfully!');
        navigate(`/orders/${orderId}`);
        return;
      }

      // Convert status for database
      const getStatusForDB = (status: string) => {
        switch (status) {
          case 'Pending': return 'pending';
          case 'In Progress': return 'in_progress';
          case 'Completed': return 'completed';
          default: return 'pending';
        }
      };

      const orderData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        budget: parseFloat(formData.budget) || 0,
        status: getStatusForDB(formData.status),
        due_date: formData.due_date || null,
        start_date: formData.start_date || null,
        completed_date: formData.completed_date || null,
        platform: formData.platform || null,
        client_name: formData.client_name || null,
        client_email: formData.client_email || null,
        client_id: formData.client_id || null,
      };

      const { error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Order updated successfully!');
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      console.error('Error updating order:', err);
      toast.error(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#9c68f2]" />
            <p className="text-gray-300">Loading order...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <ModernButton onClick={() => navigate('/orders')}>
              Back to Orders
            </ModernButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0B0E14]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 rounded-lg hover:bg-[#35414e] text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Order</h1>
              <p className="text-gray-400">Modify order details and settings</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#1e2938] rounded-xl border border-[#35414e] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                    placeholder="Enter order title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                    placeholder="Enter order description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.platform})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Status & Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Status & Timeline</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    name="completed_date"
                    value={formData.completed_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-[#35414e]">
                <ModernButton
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </ModernButton>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderEditPage;
