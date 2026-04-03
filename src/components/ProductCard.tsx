import { Product } from "@/lib/data";
import { Camera, Plus, Star } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToTrial: (product: Product) => void;
  delay?: number;
  highlight?: boolean;
}

// Deterministic pseudo-random rating based on product id
function getRating(id: string): number {
  const n = parseInt(id, 10) || id.charCodeAt(0);
  const ratings = [4, 5, 4, 3, 5, 4, 5, 4, 3, 5];
  return ratings[n % ratings.length];
}

function getReviewCount(id: string): number {
  const n = parseInt(id, 10) || id.charCodeAt(0);
  return 12 + (n * 7) % 88;
}

const ProductCard = ({ product, onAddToTrial, delay = 0, highlight = false }: ProductCardProps) => {
  const [wishlisted, setWishlisted] = useState(false);
  const rating = getRating(product.id);
  const reviewCount = getReviewCount(product.id);

  return (
    <div
      id={`product-${product.id}`}
      className="group animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`relative aspect-[4/5] overflow-hidden bg-secondary transition-all ${highlight ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted((w) => !w); }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Wishlist"
        >
          <Star
            className={`h-4 w-4 transition-colors ${wishlisted ? "fill-accent text-accent" : "text-muted-foreground"}`}
          />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3 rounded bg-background/75 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          {product.label}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => onAddToTrial(product)}
            className="flex flex-1 items-center justify-center gap-2 bg-primary py-2.5 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add to Trial
          </button>
          <button
            onClick={() => onAddToTrial(product)}
            title="Try on with camera"
            className="flex items-center justify-center bg-primary px-3 py-2.5 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1.5">
        <h3 className="text-sm font-medium tracking-wide">{product.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">₹{product.price.toLocaleString("en-IN")}</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${s <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
              />
            ))}
            <span className="ml-1 text-[10px] text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
