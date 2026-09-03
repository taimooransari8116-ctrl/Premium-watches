import { supabase } from "./supabaseClient";
import { Product, Order, Customer, CartItem } from "./types";

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description,
    image: row.image ?? "",
    createdAt: row.created_at,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchProducts:", error.message);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}

export async function insertProduct(input: {
  name: string;
  price: number;
  description: string;
  image: string;
}): Promise<{ product: Product | null; error: string | null }> {
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) return { product: null, error: error.message };
  return { product: rowToProduct(data), error: null };
}

export async function deleteProductRemote(id: string): Promise<string | null> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return error ? error.message : null;
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    items: row.items,
    total: Number(row.total),
    createdAt: row.created_at,
  };
}

export async function insertOrder(order: {
  customerName: string;
  phone: string;
  address: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
}): Promise<{ order: Order | null; error: string | null }> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items,
      total: order.total,
    })
    .select()
    .single();
  if (error) return { order: null, error: error.message };
  return { order: rowToOrder(data), error: null };
}

// Admin-only — succeeds only when a signed-in admin session exists
// (enforced by the admin_read_orders policy in supabase-schema.sql).
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchOrders:", error.message);
    return [];
  }
  return (data ?? []).map(rowToOrder);
}

/* Cart, checkout prefill, and "orders placed from this device" —
   these stay on-device (localStorage). They're personal to whoever
   is browsing, not shared data, so they don't need a database row. */

const KEYS = {
  cart: "auxoro:cart",
  customer: "auxoro:customer",
  myOrders: "auxoro:my-orders",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing / quota — fail silently */
  }
}

export const local = {
  getCart: (): CartItem[] => read(KEYS.cart, []),
  saveCart: (cart: CartItem[]) => write(KEYS.cart, cart),

  getCustomer: (): Customer | null => read(KEYS.customer, null),
  saveCustomer: (c: Customer) => write(KEYS.customer, c),

  getMyOrders: (): Order[] => read(KEYS.myOrders, []),
  addMyOrder: (order: Order): Order[] => {
    const next = [...read<Order[]>(KEYS.myOrders, []), order];
    write(KEYS.myOrders, next);
    return next;
  },
};
