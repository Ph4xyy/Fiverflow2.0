import { createClient } from 'npm:@supabase/supabase-js@2.52.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface Order {
  id: string;
  title: string;
  deadline: string;
  status: string;
  payment_status: string;
  amount: number;
  clients: {
    name: string;
    user_id: string;
  };
}

interface ExistingNotification {
  id: string;
  type: string;
  related_id: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🔔 Starting notification scheduler...');
    
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date ranges
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nowISO = now.toISOString();
    const tomorrowISO = tomorrow.toISOString();

    console.log(`📅 Checking for tasks due between now (${nowISO}) and tomorrow (${tomorrowISO})`);

    // 1. Get all orders that are overdue or due within 24 hours
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        title,
        deadline,
        status,
        payment_status,
        amount,
        clients!inner(name, user_id)
      `)
      .in('status', ['Pending', 'In Progress'])
      .lte('deadline', tomorrowISO)
      .order('deadline', { ascending: true });

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      throw ordersError;
    }

    console.log(`📦 Found ${orders?.length || 0} orders to check`);

    if (!orders || orders.length === 0) {
      console.log('✅ No orders found that need notifications');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No orders found that need notifications',
          processed: 0 
        }),
        {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    // 2. Get existing notifications to avoid duplicates
    const orderIds = orders.map(order => order.id);
    const { data: existingNotifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, type, related_id')
      .in('related_id', orderIds)
      .in('type', ['task_due', 'invoice_pending']);

    if (notificationsError) {
      console.error('❌ Error fetching existing notifications:', notificationsError);
      throw notificationsError;
    }

    console.log(`📋 Found ${existingNotifications?.length || 0} existing notifications`);

    // Create a Set for quick lookup of existing notifications
    const existingNotificationKeys = new Set(
      existingNotifications?.map(n => `${n.type}-${n.related_id}`) || []
    );

    // 3. Process each order and create notifications if needed
    const notificationsToCreate = [];
    let processedCount = 0;

    for (const order of orders) {
      const orderDeadline = new Date(order.deadline);
      const isOverdue = orderDeadline < now;
      const isDueSoon = orderDeadline <= tomorrow && orderDeadline >= now;
      
      // Determine notification type and content
      let notificationType: string;
      let notificationContent: string;
      
      if (order.payment_status === 'pending' || order.payment_status === 'overdue') {
        notificationType = 'invoice_pending';
        if (isOverdue) {
          notificationContent = `Payment overdue: $${order.amount} from ${order.clients.name} for "${order.title}"`;
        } else {
          notificationContent = `Payment due soon: $${order.amount} from ${order.clients.name} for "${order.title}"`;
        }
      } else {
        notificationType = 'task_due';
        if (isOverdue) {
          const daysOverdue = Math.ceil((now.getTime() - orderDeadline.getTime()) / (1000 * 60 * 60 * 24));
          notificationContent = `Task overdue: "${order.title}" for ${order.clients.name} (${daysOverdue} day(s) overdue)`;
        } else {
          const hoursLeft = Math.ceil((orderDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));
          notificationContent = `Task due soon: "${order.title}" for ${order.clients.name} (${hoursLeft} hour(s) remaining)`;
        }
      }

      // Check if notification already exists
      const notificationKey = `${notificationType}-${order.id}`;
      if (existingNotificationKeys.has(notificationKey)) {
        console.log(`⏭️ Skipping duplicate notification for order ${order.id}`);
        continue;
      }

      // Add to notifications to create
      notificationsToCreate.push({
        user_id: order.clients.user_id,
        type: notificationType,
        content: notificationContent,
        related_id: order.id,
        is_read: false
      });

      processedCount++;
      console.log(`📝 Prepared ${notificationType} notification for order: ${order.title}`);
    }

    // 4. Bulk insert notifications
    if (notificationsToCreate.length > 0) {
      console.log(`💾 Creating ${notificationsToCreate.length} new notifications...`);
      
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (insertError) {
        console.error('❌ Error creating notifications:', insertError);
        throw insertError;
      }

      console.log('✅ Notifications created successfully');
    } else {
      console.log('ℹ️ No new notifications needed');
    }

    // 5. Clean up old read notifications (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { error: cleanupError } = await supabase
      .from('notifications')
      .delete()
      .eq('is_read', true)
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (cleanupError) {
      console.error('⚠️ Error cleaning up old notifications:', cleanupError);
      // Don't throw here, cleanup is not critical
    } else {
      console.log('🧹 Cleaned up old read notifications');
    }

    const response = {
      success: true,
      message: `Notification scheduler completed successfully`,
      processed: processedCount,
      created: notificationsToCreate.length,
      timestamp: nowISO
    };

    console.log('✅ Notification scheduler completed:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error('💥 Notification scheduler error:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});