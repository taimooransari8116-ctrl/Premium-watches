import { useEffect, useMemo, useState } from "react";
import { Product, Order } from "./types";
import { fetchProducts, insertProduct, deleteProductRemote, fetchOrders } from "./api";
import { adminSignIn, adminSignOut, getAdminSession } from "./auth";

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

interface AddProductFormProps {
  onClose: () => void;
  onAdd: (input: { name: string; price: number; description: string; image: string }) => void;
  submitting: boolean;
}

function AddProductForm({ onClose, onAdd, submitting }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const priceNum = Number(price);
    if (!name.trim() || !description.trim() || !price.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Naam, price (number), aur description zaroori hain.");
      return;
    }
    onAdd({ name: name.trim(), price: priceNum, description: description.trim(), image: image.trim() });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-[#0a0a0a] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-[17px] font-medium">Add Product</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          className="h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (₹)"
          type="number"
          inputMode="numeric"
          className="h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={3}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30 resize-none"
        />
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL (optional)"
          className="h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30"
        />

        {error && <p className="text-red-400 text-[12px]">{error}</p>}

        <div className="flex gap-3 mt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-lg border border-white/15 text-white/70 text-[13px]">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 h-11 rounded-lg bg-white text-black text-[13px] font-medium disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminPanelProps {
  onExit: () => void;
}

export function AdminPanel({ onExit }: AdminPanelProps) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [tab, setTab] = useState<"products" | "orders" | "analytics">("products");

  useEffect(() => {
    getAdminSession().then((session) => {
      setUnlocked(!!session);
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    setLoadingData(true);
    Promise.all([fetchProducts(), fetchOrders()])
      .then(([p, o]) => {
        setProducts(p);
        setOrders(o);
      })
      .finally(() => setLoadingData(false));
  }, [unlocked]);

  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;

    const salesByProduct = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((i) => salesByProduct.set(i.name, (salesByProduct.get(i.name) ?? 0) + i.qty))
    );
    let bestSeller = "—";
    let bestQty = 0;
    salesByProduct.forEach((qty, name) => {
      if (qty > bestQty) {
        bestQty = qty;
        bestSeller = name;
      }
    });

    return { totalOrders: orders.length, totalRevenue, uniqueCustomers, bestSeller };
  }, [orders]);

  async function handleLogin() {
    setLoggingIn(true);
    setLoginError("");
    const { session, error } = await adminSignIn(email.trim(), password);
    setLoggingIn(false);
    if (error || !session) {
      setLoginError(error ?? "Login fail ho gaya.");
      return;
    }
    setUnlocked(true);
  }

  async function handleLogout() {
    await adminSignOut();
    setUnlocked(false);
    onExit();
  }

  async function handleAddProduct(input: { name: string; price: number; description: string; image: string }) {
    setAddingProduct(true);
    const { product, error } = await insertProduct(input);
    setAddingProduct(false);
    if (error || !product) return;
    setProducts((prev) => [...prev, product]);
    setShowAddForm(false);
  }

  async function handleDeleteProduct(id: string) {
    const prev = products;
    setProducts((p) => p.filter((x) => x.id !== id));
    const error = await deleteProductRemote(id);
    if (error) setProducts(prev);
  }

  const inputStyle =
    "h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30";

  if (checkingSession) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center" style={{ fontFamily: '"Space Mono", monospace' }}>
        <p className="text-white/40 text-[13px]">Checking session…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center px-6" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button onClick={onExit} className="text-white/40 text-[12px] self-start mb-2">
            ← Back to store
          </button>
          <h1 className="text-white text-[20px] font-medium mb-1">Admin login</h1>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Admin email"
            className={inputStyle}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            type="password"
            placeholder="Password"
            className={inputStyle}
          />
          {loginError && <p className="text-red-400 text-[12px]">{loginError}</p>}
          <button
            onClick={handleLogin}
            disabled={loggingIn}
            className="h-11 rounded-lg bg-white text-black text-[13px] font-medium disabled:opacity-60"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-white/25 text-[11px] mt-2">
            Ye ek real Supabase login hai. Admin user Supabase dashboard → Authentication → Users → Add user se banao.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white pb-24" style={{ fontFamily: '"Space Mono", monospace' }}>
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={onExit} className="text-white/50 text-[13px]">
          ← Store
        </button>
        <span className="text-white text-[15px] font-medium">Admin — Auxoro</span>
        <button onClick={handleLogout} className="text-white/40 text-[12px]">
          Sign out
        </button>
      </div>

      <div className="flex gap-2 px-4 sm:px-6 pt-5">
        {(["products", "orders", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 h-9 rounded-full text-[12px] capitalize ${
              tab === t ? "bg-white text-black font-medium" : "bg-white/5 text-white/60 border border-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loadingData && <p className="text-white/40 text-[13px] px-4 sm:px-6 pt-5">Loading…</p>}

      {!loadingData && tab === "products" && (
        <div className="px-4 sm:px-6 pt-5 flex flex-col gap-3">
          {products.length === 0 && <p className="text-white/40 text-[13px]">Koi product nahi hai abhi.</p>}
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="opacity-40">⌚</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-medium truncate">{p.name}</p>
                <p className="text-white/40 text-[11px] truncate">{p.description}</p>
              </div>
              <span className="text-white text-[13px] font-medium shrink-0">{formatPrice(p.price)}</span>
              <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400/70 text-[12px] shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {!loadingData && tab === "orders" && (
        <div className="px-4 sm:px-6 pt-5 flex flex-col gap-3">
          {orders.length === 0 && <p className="text-white/40 text-[13px]">Abhi koi order nahi aaya.</p>}
          {orders
            .slice()
            .reverse()
            .map((o) => (
              <div key={o.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <p className="text-white text-[14px] font-medium">{o.customerName}</p>
                  <span className="text-white text-[14px] font-medium">{formatPrice(o.total)}</span>
                </div>
                <p className="text-white/50 text-[12px]">{o.phone}</p>
                <p className="text-white/50 text-[12px]">{o.address}</p>
                <p className="text-white/35 text-[11px] mt-1">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
                <p className="text-white/25 text-[10px]">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
              </div>
            ))}
        </div>
      )}

      {!loadingData && tab === "analytics" && (
        <div className="px-4 sm:px-6 pt-5 grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-[11px] uppercase">Orders</p>
            <p className="text-white text-[24px] font-light mt-1">{analytics.totalOrders}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-[11px] uppercase">Revenue</p>
            <p className="text-white text-[24px] font-light mt-1">{formatPrice(analytics.totalRevenue)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-[11px] uppercase">Customers</p>
            <p className="text-white text-[24px] font-light mt-1">{analytics.uniqueCustomers}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-[11px] uppercase">Best Seller</p>
            <p className="text-white text-[15px] font-medium mt-1 truncate">{analytics.bestSeller}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-white text-black text-[28px] leading-none flex items-center justify-center shadow-xl z-50"
        aria-label="Add product"
      >
        +
      </button>

      {showAddForm && (
        <AddProductForm onClose={() => setShowAddForm(false)} onAdd={handleAddProduct} submitting={addingProduct} />
      )}
    </div>
  );
}

export default AdminPanel;
