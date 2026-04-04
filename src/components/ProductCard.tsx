import { Product } from "../lib/data";
import { Camera, Plus, Star, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ProductCardProps {
  product: Product;
  onAddToTrial: (product: Product) => void;
  delay?: number;
  highlight?: boolean;
}

interface UserReview {
  rating: number;
  opinion: string;
}

function getReviewCount(id: string): number {
  const n = parseInt(id, 10) || id.charCodeAt(0);
  return 12 + (n * 7) % 88;
}

function getSavedReview(productId: string): UserReview | null {
  try {
    const saved = localStorage.getItem(`review-${productId}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const OPINION_TAGS = ["Love it!", "Great quality", "Good value", "True to size", "Runs small", "Runs large", "Disappointing", "Not as shown"];

const RatingModal = ({
  product,
  onClose,
  onSubmit,
  existing,
}: {
  product: Product;
  onClose: () => void;
  onSubmit: (review: UserReview) => void;
  existing: UserReview | null;
}) => {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [opinion, setOpinion] = useState(existing?.opinion ?? "");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, opinion });
    onClose();
  };

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        ref={modalRef}
        className="w-full max-w-sm bg-background border border-border shadow-xl rounded-none p-6 relative animate-fade-in"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-display text-lg font-medium">{product.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Share your experience</p>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-125 focus:outline-none"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  s <= (hover || rating) ? "fill-accent text-accent" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {(hover || rating) > 0 && (
            <span className="text-xs text-accent font-medium ml-1">{labels[hover || rating]}</span>
          )}
        </div>
        {rating === 0 && <p className="text-[11px] text-muted-foreground mb-4">Tap to rate</p>}
        {rating > 0 && <div className="mb-4" />}

        {/* Quick tags */}
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Quick tags</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {OPINION_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setOpinion((prev) => prev === tag ? "" : tag)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                opinion === tag
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Free text */}
        <textarea
          value={opinion}
          onChange={(e) => setOpinion(e.target.value)}
          placeholder="Or write your own opinion..."
          maxLength={120}
          rows={2}
          className="w-full text-xs border border-border bg-secondary px-3 py-2 resize-none focus:outline-none focus:border-accent placeholder:text-muted-foreground/50 text-foreground"
        />
        <p className="text-right text-[10px] text-muted-foreground mb-4">{opinion.length}/120</p>

        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full bg-primary text-primary-foreground py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToTrial, delay = 0, highlight = false }: ProductCardProps) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [review, setReview] = useState<UserReview | null>(() => getSavedReview(product.id));
  const [showModal, setShowModal] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const reviewCount = getReviewCount(product.id);

  const handleSubmit = (r: UserReview) => {
    setReview(r);
    try {
      localStorage.setItem(`review-${product.id}`, JSON.stringify(r));
    } catch {}
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 2000);
  };

  return (
    <>
      {showModal && (
        <RatingModal
          product={product}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          existing={review}
        />
      )}

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
            onError={(e) => {
              const t = e.currentTarget;
              const seed = parseInt(product.id, 10) || product.id.charCodeAt(0);
              t.src = `https://picsum.photos/seed/${seed}/400/500`;
              t.onerror = null;
            }}
          />

          {/* Wishlist */}
          <button
            onClick={(e) => { e.stopPropagation(); setWishlisted((w) => !w); }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Wishlist"
          >
            <Star className={`h-4 w-4 transition-colors ${wishlisted ? "fill-accent text-accent" : "text-muted-foreground"}`} />
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

            {/* Stars — click to open modal */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 group/stars focus:outline-none"
              title={review ? "Edit your review" : "Rate this product"}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 transition-colors group-hover/stars:text-accent ${
                    review && s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="ml-1 text-[10px] text-muted-foreground">
                {showThanks ? "✓ Thanks!" : `(${reviewCount})`}
              </span>
            </button>
          </div>

          {/* Show user's opinion if submitted */}
          {review?.opinion ? (
            <p className="text-[11px] text-accent/80 italic truncate">"{review.opinion}"</p>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Tap stars to rate & review
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCard;
