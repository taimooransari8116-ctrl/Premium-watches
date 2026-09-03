import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="flex-shrink-0 w-[170px] sm:w-[200px] flex flex-col bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
      <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-40">⌚</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="text-white text-[14px] font-medium leading-tight">{product.name}</h3>
        <p className="text-white/45 text-[11px] leading-snug line-clamp-2">{product.description}</p>
        <p className="text-white text-[15px] font-semibold mt-1">{formatPrice(product.price)}</p>
        <button
          onClick={() => onAddToCart(product.id)}
          className="mt-1.5 w-full h-9 rounded-lg bg-white text-black text-[12px] font-medium hover:bg-white/90 active:scale-[0.98] transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
