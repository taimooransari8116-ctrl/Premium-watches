import { useEffect, useMemo, useState } from "react";
import { Product, CartItem, Order, Customer } from "./types";
import { fetchProducts, insertOrder, local } from "./api";
import { ProductCard } from "./ProductCard";
import { CartDrawer } from "./CartDrawer";
import { SignInModal } from "./SignInModal";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

interface StoreAppProps {
  onEnterAdmin: () => void;
  onBackToLanding: () => void;
}

export function StoreApp({ onEnterAdmin, onBackToLanding }: StoreAppProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setCart(local.getCart());
    setMyOrders(local.getMyOrders());
    setCustomer(local.getCustomer());
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const rows = useMemo(() => chunk(products, 6), [products]);

  function addToCart(productId: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      const next = existing
        ? prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { productId, qty: 1 }];
      local.saveCart(next);
      return next;
    });
    setToast("Cart mein add ho gaya");
  }

  function updateQty(productId: string, qty: number) {
    setCart((prev) => {
      const next = prev.map((i) => (i.productId === productId ? { ...i, qty } : i));
      local.saveCart(next);
      return next;
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      local.saveCart(next);
      return next;
    });
  }

  function startCheckout() {
    if (!customer) {
      setPendingCheckout(true);
      setSignInOpen(true);
      return;
    }
    placeOrder(customer);
  }

  async function placeOrder(c: Customer) {
    const lines = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product
          ? { productId: product.id, name: product.name, price: product.price, qty: item.qty }
          : null;
      })
      .filter((l): l is { productId: string; name: string; price: number; qty: number } => l !== null);

    if (lines.length === 0) return;

    const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    setPlacingOrder(true);
    const { order, error } = await insertOrder({
      customerName: c.name,
      phone: c.phone,
      address: c.address,
      items: lines,
      total,
    });
    setPlacingOrder(false);

    if (error || !order) {
      setToast("Order fail ho gaya, dobara try karo");
      return;
    }

    setMyOrders(local.addMyOrder(order));
    setCart([]);
    local.saveCart([]);
    setToast("Order place ho gaya!");
  }

  function handleSignedIn(c: Customer) {
    setCustomer(c);
    local.saveCustomer(c);
    setSignInOpen(false);
    if (pendingCheckout) {
      setPendingCheckout(false);
      placeOrder(c);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Navbar */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
          <button onClick={onBackToLanding} className="text-white/50 text-[13px] shrink-0">
            ← Back
          </button>
          <span className="text-white text-[17px] font-semibold tracking-tight shrink-0">Auxoro</span>

          <div className="flex-1 flex items-center h-9 px-3 rounded-full bg-white/5 border border-white/10">
            <span className="text-white/30 text-[13px] mr-2">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search watches"
              className="flex-1 bg-transparent outline-none text-white text-[13px] placeholder:text-white/30"
            />
          </div>

          <button onClick={() => setSignInOpen(true)} className="text-white/60 text-[12px] shrink-0 hidden sm:block">
            {customer ? customer.name.split(" ")[0] : "Sign in"}
          </button>

          <button onClick={() => setCartOpen(true)} className="relative shrink-0 w-9 h-9 flex items-center justify-center">
            <span className="text-[18px]">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero strip */}
      <div className="px-4 sm:px-6 pt-8 pb-6">
        <h1 className="text-[28px] sm:text-[36px] font-light tracking-tight">Watches, built to last.</h1>
        <p className="text-white/40 text-[13px] mt-1">Auxoro — everyday watches, straightforward prices.</p>
      </div>

      {loadingProducts ? (
        <p className="text-white/40 text-[13px] px-4 sm:px-6 pb-16">Loading watches…</p>
      ) : filtered ? (
        <div className="px-4 sm:px-6 pb-16">
          <p className="text-white/40 text-[12px] uppercase tracking-wide mb-3">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      ) : (
        <div className="pb-16 flex flex-col gap-8">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col gap-3">
              <p className="text-white/40 text-[12px] uppercase tracking-wide px-4 sm:px-6">
                {i === 0 ? "New In" : `More Watches ${i + 1}`}
              </p>
              <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-1 snap-x snap-mandatory">
                {row.map((p) => (
                  <div key={p.id} className="snap-start">
                    <ProductCard product={p} onAddToCart={addToCart} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-white/40 text-[13px] px-4 sm:px-6">Abhi koi product nahi hai — admin panel se add karo.</p>
          )}
        </div>
      )}

      {/* Quiet admin entry point */}
      <div className="px-4 sm:px-6 pb-10">
        <button onClick={onEnterAdmin} className="text-white/25 text-[11px]">
          Admin
        </button>
      </div>

      {cartOpen && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          products={products}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={startCheckout}
          myOrders={myOrders}
          customer={customer}
          placing={placingOrder}
        />
      )}

      {signInOpen && (
        <SignInModal
          initial={customer}
          onClose={() => {
            setSignInOpen(false);
            setPendingCheckout(false);
          }}
          onSignedIn={handleSignedIn}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-white text-black text-[13px] font-medium px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default StoreApp;
