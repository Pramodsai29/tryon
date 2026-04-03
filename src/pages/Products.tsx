import { useEffect, useState } from "react";
import { products, categories, skinTypes, priceRanges, Product } from "@/lib/data";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const Products = () => {
  const [searchParams] = useSearchParams();
  const linkedProductId = searchParams.get("product");
  const [category, setCategory] = useState("all");
  const [skinType, setSkinType] = useState("all");
  const [priceRange, setPriceRange] = useState(0);

  useEffect(() => {
    if (!linkedProductId) return;
    const el = document.getElementById(`product-${linkedProductId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [linkedProductId]);

  const filtered = products.filter((p) => {
    const catMatch = category === "all" || p.label === category;
    const skinMatch = skinType === "all" || p.skinType === skinType || p.skinType === "all";
    const range = priceRanges[priceRange];
    const priceMatch = p.price >= range.min && p.price < range.max;
    return catMatch && skinMatch && priceMatch;
  });

  const handleAddToTrial = (product: Product) => {
    const existing = JSON.parse(localStorage.getItem("trialItems") || "[]");
    if (!existing.find((p: Product) => p.id === product.id)) {
      localStorage.setItem("trialItems", JSON.stringify([...existing, product]));
      toast.success(`${product.name} added to trial room`);
    } else {
      toast.info("Already in your trial room");
    }
  };

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-light">Shop</h1>
        <p className="mt-2 text-sm text-muted-foreground">Curated fashion & beauty essentials</p>

        {/* Filters */}
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={filterBtn(category === c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Skin Type</p>
              <div className="flex flex-wrap gap-2">
                {skinTypes.map((s) => (
                  <button key={s} onClick={() => setSkinType(s)} className={filterBtn(skinType === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Price</p>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((r, i) => (
                  <button key={r.label} onClick={() => setPriceRange(i)} className={filterBtn(priceRange === i)}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToTrial={handleAddToTrial}
              delay={i * 80}
              highlight={linkedProductId === product.id}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-20 text-center text-muted-foreground">No products match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default Products;
