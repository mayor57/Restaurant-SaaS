"use server";

import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';

async function verifySession(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }
  
  // For multi-tenant support, we prioritize the restaurant_id stored in user metadata.
  // We fall back to the user.id if no explicit restaurant cluster is assigned yet.
  const restaurantId = user.user_metadata?.restaurant_id || user.id;
  
  return { user, restaurantId };
}

/**
 * Ensures that a restaurant record exists for the current user.
 * This is effectively an "on-demand" initialization for new accounts.
 */
async function ensureRestaurantRecord(supabase: any, restaurantId: string, user: any) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', restaurantId)
    .single();

  if (error && error.code === 'PGRST116') { // Record not found
    const restaurantName = user.user_metadata?.restaurant_name || "New Restaurant";
    await supabase.from('restaurants').insert({
      id: restaurantId,
      name: restaurantName,
      email: user.email,
      currency: 'USD',
      timezone: 'UTC',
      tax_rate: 0
    });
  }
}

// DASHBOARD
export async function getRevenueAnalytics(range: string = "This Week") {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; 
  
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
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('restaurant_id', restaurantId)
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString())
    .neq('status', 'cancelled');

  if (error) return [];

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
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, table_label, status, item_count, is_urgent, duration')
    .eq('restaurant_id', restaurantId)
    .in('status', ['pending', 'preparing', 'ready', 'served'])
    .order('created_at', { ascending: true });
  
  if (error) return [];

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
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('tables')
    .select('id, display_id, seats, status, time, zone')
    .eq('restaurant_id', restaurantId)
    .order('display_id');
  
  if (error) throw error; // Re-throw to show error state in UI

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
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, qty, unit, status')
    .eq('restaurant_id', restaurantId)
    .in('status', ['critical', 'low'])
    .order('status');
  
  if (error) return [];

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
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data ?? [];
}

export async function addMenuItem(item: { name: string; price: number; category: string; description: string; }) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const display_id = `MN-${Math.floor(Math.random() * 900) + 100}`;
  const { data, error } = await supabase
    .from('menu_items').insert({ ...item, restaurant_id: restaurantId, display_id, status: 'active' }).select();

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

// INVENTORY
export async function getInventory() {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('status')
    .order('name');
  
  if (error) return [];
  return data ?? [];
}

// STAFF
export async function getStaff() {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('staff')
    .select('*, shifts(shift_date, shift_type, station)')
    .eq('restaurant_id', restaurantId)
    .order('name');
  
  if (error) return [];

  return (data ?? []).map(member => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    const upcomingShift = (member.shifts || [])
      .filter((s: any) => new Date(s.shift_date) >= now)
      .sort((a: any, b: any) => new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime())[0];
    
    return { ...member, upcomingShift };
  });
}

// ORDERS
export async function getOrders(statusFilter?: string[]) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  let query = supabase
    .from('orders')
    .select('id, order_number, table_label, status, urgency, is_urgent, item_count, duration, total_amount, notes, created_at, order_items (id, name, quantity, unit_price, is_done, order_item_mods (modifier))')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (statusFilter?.length) {
    query = query.in('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) return [];

  return (data ?? []).map(o => ({
    ...o,
    total_amount: Number(o.total_amount) || 0
  }));
}

// TABLES
export async function getTables() {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_id');
  
  if (error) throw error;
  return data ?? [];
}

export async function addTable(table: { display_id: string; seats: number; zone: string; }) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { data, error } = await supabase
    .from('tables')
    .insert({ ...table, restaurant_id: restaurantId, status: 'free' })
    .select();
    
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function deleteTable(id: string) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { error } = await supabase
    .from('tables').delete().eq('id', id).eq('restaurant_id', restaurantId);
  if (error) throw error;
}

export async function updateTableStatus(id: string, status: string, time?: string) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { error } = await supabase
    .from('tables')
    .update({ status, time: time ?? null })
    .eq('id', id).eq('restaurant_id', restaurantId);
  if (error) throw error;
}

// RESERVATIONS
export async function getReservations(date?: string) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  let query = supabase
    .from('reservations')
    .select('*, tables(display_id, seats)')
    .eq('restaurant_id', restaurantId)
    .order('reservation_date', { ascending: true })
    .order('reservation_time', { ascending: true });

  if (date) {
    query = query.eq('reservation_date', date);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getRestaurantSettings() {
  const supabase = await createClient(); 
  const { user, restaurantId } = await verifySession(supabase);
  
  // Ensure the record exists for new users
  await ensureRestaurantRecord(supabase, restaurantId, user);

  const { data, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
  if (error) throw error;
  return data;
}

export async function updateRestaurantSettings(updates: any) {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const { error } = await supabase.from('restaurants').update({ ...updates }).eq('id', restaurantId);
  if (error) throw error;
}

export async function getTodayRevenue() {
  const supabase = await createClient(); 
  const { restaurantId } = await verifySession(supabase);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('restaurant_id', restaurantId)
    .gte('created_at', today.toISOString())
    .neq('status', 'cancelled');
    
  if (error) return 0;
  
  const total = (data ?? []).reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);
  return total;
}

export async function getCurrentRestaurantId() {
  const supabase = await createClient();
  const { restaurantId } = await verifySession(supabase);
  return restaurantId;
}