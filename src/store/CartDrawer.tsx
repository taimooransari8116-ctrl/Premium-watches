import { CartItem, Product, Order, Customer } from "./types";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  myOrders: Order[];
  customer: Customer | null;
  placing?: boolean;
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function CartDrawer({
  open,
  onClose,
  cart,
  products,
  onUpdateQty,
  onRemove,
  onCheckout,
  myOrders,
  customer,
  placing = false,
}: CartDrawerProps) {
  if (!open) return null;

  const lines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { product, qty: item.qty } : null;
    })
    .filter((l): l is { product: Product; qty: number } => l !== null);

  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white text-[16px] font-medium">Your Cart</h2>
          <button onClick={onClose} className="text-white/50 text-[20px] leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {lines.length === 0 ? (
            <p className="text-white/40 text-[13px]">Cart khaali hai. Kuch watches add karo.</p>
          ) : (
            lines.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3 items-center">
                <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl opacity-40">⌚</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-medium truncate">{product.name}</p>
                  <p className="text-white/40 text-[12px]">{formatPrice(product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(product.id, Math.max(1, qty - 1))}
                    className="w-7 h-7 rounded-md border border-white/15 text-white/70 text-[14px]"
                  >
                    −
                  </button>
                  <span className="text-white text-[13px] w-4 text-center">{qty}</span>
                  <button
                    onClick={() => onUpdateQty(product.id, qty + 1)}
                    className="w-7 h-7 rounded-md border border-white/15 text-white/70 text-[14px]"
                  >
                    +
                  </button>
                </div>
                <button onClick={() => onRemove(product.id)} className="text-white/30 text-[12px] ml-1">
                  Remove
                </button>
              </div>
            ))
          )}

          {myOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-white/60 text-[12px] uppercase tracking-wide mb-3">Your Orders</h3>
              <div className="flex flex-col gap-2">
                {myOrders
                  .slice()
                  .reverse()
                  .map((order) => (
                    <div key={order.id} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/50">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </span>
                        <span className="text-white font-medium">{formatPrice(order.total)}</span>
                      </div>
                      <p className="text-white/40 text-[11px] mt-1">
                        {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="p-5 border-t border-white/10 flex flex-col gap-3">
            <div className="flex justify-between text-white text-[15px] font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={placing}
              className="w-full h-12 rounded-lg bg-white text-black text-[14px] font-medium disabled:opacity-60"
            >
              {placing ? "Placing…" : customer ? "Place Order" : "Sign in & Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
