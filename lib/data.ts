import { createClient } from './supabase/client';

const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID!;

// DASHBOARD
export async function getRevenueAnalytics(range: string = "This Week") {
  const supabase = createClient();
  
  // 1. Determine Date Range
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 is Mon, 6 is Sun
  
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date;

  if (range === "Last Week") {
    startDate = new Date(startOfThisWeek);
    startDate.setDate(startOfThisWeek.getDate() - 7);
    endDate = new Date(startOfThisWeek);
  } else {
    startDate = new Date(startOfThisWeek);
    endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 1); // Up to start of next day
    endDate.setHours(0, 0, 0, 0);
  }

  // 2. Fetch Real Orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('restaurant_id', RID)
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString())
    .neq('status', 'cancelled');

  if (error) throw error;

  // 3. Aggregate Data by Day
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const revenueMap: Record<string, number> = {};
  days.forEach(day => revenueMap[day] = 0);

  orders?.forEach(order => {
    const date = new Date(order.created_at);
    const d = (date.getDay() + 6) % 7;
    const dayName = days[d];
    revenueMap[dayName] += Number(order.total_amount) || 0;
  });

  return days.map(day => ({
    day,
    total: Math.floor(revenueMap[day])
  }));
}

export async function getLiveOrders() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, table_label, status, item_count, is_urgent, duration')
    .eq('restaurant_id', RID)
    .in('status', ['pending', 'preparing', 'ready', 'served'])
    .order('created_at', { ascending: true });
  if (error) throw error;

  return (data ?? []).map(o => ({
    id: o.id,
    orderNumber: o.order_number,
    table: o.table_label,
    status: o.status,
    itemCount: o.item_count,
    isUrgent: o.is_urgent,
    duration: o.duration,
  }));
}

export async function getTableStatus() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tables')
    .select('id, display_id, seats, status, time, zone')
    .eq('restaurant_id', RID)
    .order('display_id');
  if (error) throw error;

  return (data ?? []).map(t => ({
    id: t.id,
    display_id: t.display_id,
    seats: t.seats,
    status: t.status,
    time: t.time,
    zone: t.zone,
  }));
}

export async function getInventoryAlerts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, qty, unit, status')
    .eq('restaurant_id', RID)
    .in('status', ['critical', 'low'])
    .order('status');
  if (error) throw error;

  return (data ?? []).map(item => ({
    id: item.id,
    name: item.name,
    quantity: `${item.qty} ${item.unit}`,
    isCritical: item.status === 'critical',
    action: item.status === 'critical' ? 'Order Now' : 'Check',
  }));
}

// MENU
export async function getMenuItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', RID)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addMenuItem(item: { name: string; price: number; category: string; description: string; }) {
  const supabase = createClient();
  const display_id = `MN-${Math.floor(Math.random() * 900) + 100}`;
  const { data, error } = await supabase
    .from('menu_items').insert({ ...item, restaurant_id: RID, display_id, status: 'active' }).select();

  if (error) {
    if (error.code === '42501') throw new Error('PERMISSION DENIED (RLS): Your database is blocking this action. Please follow the instructions in the Implementation Plan to run the SQL fix.');
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function updateMenuItem(id: string, updates: { name?: string; price?: number; category?: string; description?: string; }) {
  const supabase = createClient();
  const { error } = await supabase
    .from('menu_items')
    .update({ ...updates })
    .eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function deleteMenuItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('menu_items').delete().eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

// INVENTORY
export async function getInventory() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('restaurant_id', RID)
    .order('status')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function addInventoryItem(item: { name: string; qty: number; unit: string; min_stock: number; supplier?: string; category?: string; }) {
  const status = item.qty <= item.min_stock * 0.2 ? 'critical' : item.qty <= item.min_stock ? 'low' : 'optimal';
  const display_id = `INV-${Math.floor(Math.random() * 900) + 100}`;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inventory').insert({ ...item, restaurant_id: RID, display_id, status }).select();

  if (error) {
    if (error.code === '42501') throw new Error('PERMISSION DENIED (RLS): Your database is blocking this action. Please follow the instructions in the Implementation Plan to run the SQL fix.');
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function updateInventoryItem(id: string, updates: Partial<{ name: string; qty: number; unit: string; min_stock: number; supplier: string; category: string; }>) {
  const supabase = createClient();
  const updatePayload: any = { ...updates };
  
  if (updates.qty !== undefined || updates.min_stock !== undefined) {
    const { data: current } = await supabase.from('inventory').select('qty, min_stock').eq('id', id).single();
    const qty = updates.qty ?? current?.qty ?? 0;
    const min_stock = updates.min_stock ?? current?.min_stock ?? 0;
    updatePayload.status = qty <= min_stock * 0.2 ? 'critical' : qty <= min_stock ? 'low' : 'optimal';
  }

  const { error } = await supabase
    .from('inventory')
    .update(updatePayload)
    .eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function deleteInventoryItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('inventory').delete().eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function createPurchaseOrder(po: { supplier: string; requirements: string; }) {
  const supabase = createClient();
  const { error } = await supabase
    .from('purchase_orders')
    .insert({ ...po, restaurant_id: RID });
  if (error) throw error;
}

// STAFF
export async function getStaff() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('*, shifts(shift_date, shift_type, station)')
    .eq('restaurant_id', RID)
    .order('name');
  if (error) throw error;

  return (data ?? []).map(member => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Include shifts from today onwards
    const upcomingShift = (member.shifts || [])
      .filter((s: any) => new Date(s.shift_date) >= now)
      .sort((a: any, b: any) => new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime())[0];
    
    return { ...member, upcomingShift };
  });
}

export async function addStaffMember(member: { name: string; role: string; phone?: string; status?: string }) {
  const supabase = createClient();
  const display_id = `EMP-${Math.floor(Math.random() * 900) + 100}`;
  const payload = {
    ...member,
    restaurant_id: RID,
    display_id,
    status: member.status || 'clocked_out',
    rating: 5.0,
    hours_this_week: 0
  };
  const { data, error } = await supabase
    .from('staff')
    .insert(payload).select();

  if (error) {
    if (error.code === '42501') throw new Error('PERMISSION DENIED (RLS): Your database is blocking this action. Please follow the instructions in the Implementation Plan to run the SQL fix.');
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function updateStaffMember(id: string, updates: Partial<{ name: string; role: string; phone: string; status: string; avatar_url: string; }>) {
  const supabase = createClient();
  // REMOVED updated_at as it doesn't exist in the 'staff' schema cache
  const safeUpdates: any = {};
  if (updates.name) safeUpdates.name = updates.name;
  if (updates.role) safeUpdates.role = updates.role;
  if (updates.phone) safeUpdates.phone = updates.phone;
  if (updates.status) safeUpdates.status = updates.status;
  if (updates.avatar_url) safeUpdates.avatar_url = updates.avatar_url;

  const { error } = await supabase
    .from('staff')
    .update(safeUpdates)
    .eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function deleteStaffMember(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('staff').delete().eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function assignShift(shift: { staff_id: string; shift_date: string; shift_type: string; station?: string; }) {
  const supabase = createClient();
  const payload = {
    staff_id: shift.staff_id,
    shift_date: shift.shift_date,
    shift_type: shift.shift_type,
    station: shift.station || 'General',
    restaurant_id: RID
  };
  const { error } = await supabase
    .from('shifts').insert(payload);
  if (error) throw error;
}

// ORDERS
export async function getOrders(statusFilter?: string[]) {
  const supabase = createClient();
  let query = supabase
    .from('orders')
    .select('id, order_number, table_label, status, urgency, is_urgent, item_count, duration, total_amount, notes, created_at, order_items (id, name, quantity, unit_price, is_done, order_item_mods (modifier))')
    .eq('restaurant_id', RID)
    .order('created_at', { ascending: false });

  if (statusFilter?.length) {
    query = query.in('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(o => ({
    ...o,
    total_amount: Number(o.total_amount) || 0
  }));
}

export async function createOrder(order: { 
  table_label: string; 
  notes?: string; 
  status?: string; 
  is_urgent?: boolean;
  total_amount?: number;
  item_count?: number;
  items?: Array<{ name: string; quantity: number; price: number; }>;
}) {
  const supabase = createClient();
  const order_number = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const { data: mainData, error: mainError } = await supabase
    .from('orders')
    .insert({ 
      restaurant_id: RID, 
      order_number, 
      table_label: order.table_label,
      notes: order.notes,
      status: order.status || 'pending',
      total_amount: order.total_amount || 0,
      item_count: order.item_count || 0,
      is_urgent: order.is_urgent || false
    })
    .select().single();
    
  if (mainError) throw mainError;

  if (order.items && order.items.length > 0) {
    const itemsToInsert = order.items.map(item => ({
      order_id: mainData.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);
      
    if (itemsError) throw itemsError;
  }


  // Sync Table Status to 'occupied' when order is created
  if (order.table_label) {
    await supabase.from('tables')
      .update({ status: 'occupied' })
      .eq('display_id', order.table_label)
      .eq('restaurant_id', RID);
  }

  return mainData;
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient();

  if (status === 'served') {
    const { data: ord } = await supabase.from('orders').select('table_label').eq('id', id).single();
    if (ord?.table_label) {
      await supabase.from('tables').update({ status: 'free' }).eq('display_id', ord.table_label).eq('restaurant_id', RID);
    }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const supabase = createClient();

  const { data: ord } = await supabase.from('orders').select('table_label').eq('id', id).single();
  if (ord?.table_label) {
    await supabase.from('tables').update({ status: 'free' }).eq('display_id', ord.table_label).eq('restaurant_id', RID);
  }

  const { error } = await supabase
    .from('orders').delete().eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function toggleOrderItemDone(itemId: string, isDone: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('order_items').update({ is_done: isDone }).eq('id', itemId);
  if (error) throw error;
}

// TABLES
export async function getTables() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', RID)
    .order('display_id');
  if (error) throw error;
  return data ?? [];
}

export async function addTable(table: { display_id: string; seats: number; zone: string; }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tables')
    .insert({ ...table, restaurant_id: RID, status: 'free' })
    .select();
    
  if (error) {
    console.error('Supabase Add Table Error:', error);
    if (error.code === '42501') {
      throw new Error('PERMISSION DENIED (RLS): Your database is blocking this action. Please follow the instructions in the Implementation Plan to run the SQL fix.');
    }
    throw error;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function deleteTable(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tables').delete().eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function updateTableStatus(id: string, status: string, time?: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tables')
    .update({ status, time: time ?? null })
    .eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

// RESERVATIONS
export async function getReservations(date?: string) {
  const supabase = createClient();
  let query = supabase
    .from('reservations')
    .select('*, tables(display_id, seats)')
    .eq('restaurant_id', RID)
    .order('reservation_date', { ascending: true })
    .order('reservation_time', { ascending: true });

  if (date) {
    query = query.eq('reservation_date', date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createReservation(res: { customer_name: string; party_size: number; reservation_date: string; reservation_time: string; table_id?: string; phone?: string; email?: string; notes?: string; status?: string; }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations').insert({ ...res, restaurant_id: RID }).select();

  if (error) {
    if (error.code === '42501') throw new Error('PERMISSION DENIED (RLS): Your database is blocking this action. Please follow the instructions in the Implementation Plan to run the SQL fix.');
    throw error;
  }

  // Sync Table Status to 'reserved' when reservation is created
  if (res.table_id) {
    await supabase.from('tables')
      .update({ status: 'reserved' })
      .eq('id', res.table_id)
      .eq('restaurant_id', RID);
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function updateReservation(id: string, updates: Partial<{ customer_name: string; party_size: number; reservation_date: string; reservation_time: string; table_id: string; phone: string; email: string; notes: string; status: string; }>) {
  const supabase = createClient();
  const { error } = await supabase
    .from('reservations')
    .update({ ...updates })
    .eq('id', id)
    .eq('restaurant_id', RID);
  if (error) throw error;
}

export async function deleteReservation(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('reservations').delete().eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

// REPORTS & OTHERS
export async function getReportsSummary(range: string = "Last 7 Days") {
  const supabase = createClient();
  
  // 1. Determine Date Range
  const endDate = new Date();
  const startDate = new Date();
  
  if (range === "Last 24 Hours") {
    startDate.setHours(endDate.getHours() - 24);
  } else if (range === "Last 7 Days") {
    startDate.setDate(endDate.getDate() - 7);
  } else if (range === "Last 30 Days") {
    startDate.setDate(endDate.getDate() - 30);
  }

  // 2. Fetch Data
  const [ordersRes, topItemsRes, todayRevenue] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('restaurant_id', RID)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false }),
    supabase
      .from('order_items')
      .select('name, quantity')
      .order('quantity', { ascending: false })
      .limit(10),
    getTodayRevenue()
  ]);

  if (ordersRes.error) throw ordersRes.error;

  // 3. Aggregate Revenue for Trend
  const revenueTrend: any[] = [];
  const orders = ordersRes.data || [];
  
  if (range === "Last 24 Hours") {
    // Group by hour
    for (let i = 0; i < 24; i++) {
        const hourDate = new Date(startDate);
        hourDate.setHours(startDate.getHours() + i + 1);
        const label = hourDate.getHours() + ":00";
        const total = orders
          .filter(o => {
            const d = new Date(o.created_at);
            return d.getHours() === hourDate.getHours() && d.getDate() === hourDate.getDate();
          })
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        revenueTrend.push({ day: label, total: Math.floor(total) });
    }
  } else {
    // Group by day for 7d or 30d
    const dayCount = range === "Last 7 Days" ? 7 : 30;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 0; i < dayCount; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i + 1);
        const label = days[dayDate.getDay()];
        const total = orders
          .filter(o => {
            const d = new Date(o.created_at);
            return d.getDate() === dayDate.getDate() && d.getMonth() === dayDate.getMonth();
          })
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        revenueTrend.push({ day: dayCount === 30 ? dayDate.toLocaleDateString('en-US', {day: 'numeric', month: 'short'}) : label, total: Math.floor(total) });
    }
  }

  return { 
    revenue: revenueTrend, 
    orders: orders,
    topItems: topItemsRes.data ?? [],
    todayRevenue 
  };
}


export async function getRestaurantSettings() {
  const supabase = createClient();
  const { data, error } = await supabase.from('restaurants').select('*').eq('id', RID).single();
  if (error) throw error;
  return data;
}

export async function updateRestaurantSettings(updates: any) {
  const supabase = createClient();
  const { error } = await supabase.from('restaurants').update({ ...updates }).eq('id', RID);
  if (error) throw error;
}


export async function getTodayRevenue() {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('restaurant_id', RID)
    .gte('created_at', today.toISOString())
    .neq('status', 'cancelled');
    
  if (error) throw error;
  
  const total = (data ?? []).reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);
  return total;
}
