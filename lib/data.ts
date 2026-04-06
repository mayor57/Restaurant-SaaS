import { createClient } from './supabase/client';

const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID!;

// DASHBOARD
export async function getRevenueAnalytics() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('revenue_snapshots')
    .select('day, total')
    .eq('restaurant_id', RID)
    .order('snapshot_date', { ascending: true })
    .limit(7);
  if (error) throw error;
  return data ?? [];
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
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id).eq('restaurant_id', RID);
  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const supabase = createClient();
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
export async function getReportsSummary() {
  const supabase = createClient();
  const [revenueRes, ordersRes, topItemsRes, todayRevenue] = await Promise.all([
    supabase.from('revenue_snapshots').select('day, total, order_count').eq('restaurant_id', RID).order('snapshot_date', { ascending: true }).limit(30),
    supabase.from('orders').select('id, status, total_amount, created_at').eq('restaurant_id', RID).order('created_at', { ascending: false }).limit(100),
    supabase.from('order_items').select('name, quantity').order('quantity', { ascending: false }).limit(10),
    getTodayRevenue()
  ]);
  
  return { 
    revenue: revenueRes.data ?? [], 
    orders: ordersRes.data ?? [], 
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




