import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Sparkles, Droplets, Sun, Wind, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type SkinType = "oily" | "dry" | "sensitive" | "combination" | "";

const skinTypeDetails: Record<
  Exclude<SkinType, "">,
  { signs: string[]; avoid: string[]; beautyProducts: { name: string; price: string; reason: string }[] }
> = {
  oily: {
    signs: ["Shiny skin by midday", "Enlarged pores", "Prone to blackheads"],
    avoid: ["Heavy oil-based moisturisers", "Alcohol-heavy toners", "Thick foundations"],
    beautyProducts: [
      { name: "Glow Foundation", price: "₹3,199", reason: "Lightweight, controls shine with a luminous finish" },
      { name: "SPF 50 Sunscreen", price: "₹1,599", reason: "Non-greasy formula, won't clog pores" },
    ],
  },
  dry: {
    signs: ["Tight feeling after washing", "Flaky patches", "Dull complexion"],
    avoid: ["Harsh foaming cleansers", "Alcohol-based products", "Over-exfoliating"],
    beautyProducts: [
      { name: "Hydrating Serum", price: "₹4,599", reason: "Deep moisture with hyaluronic acid" },
      { name: "Vitamin C Brightening Cream", price: "₹3,999", reason: "Hydrates while brightening" },
    ],
  },
  sensitive: {
    signs: ["Redness or irritation easily", "Reacts to new products", "Prone to rashes"],
    avoid: ["Fragranced products", "Strong chemical exfoliants", "Hot water on face"],
    beautyProducts: [
      { name: "Rose Lip Tint", price: "₹1,999", reason: "Gentle, sheer formula for sensitive lips" },
      { name: "Micellar Cleansing Water", price: "₹1,299", reason: "No-rinse gentle cleanser, zero irritation" },
      { name: "Eyeshadow Palette", price: "₹2,899", reason: "Hypoallergenic pigments, 12 neutral shades" },
    ],
  },
  combination: {
    signs: ["Oily T-zone, dry cheeks", "Some shine and some flaking", "Pores visible on nose"],
    avoid: ["Very heavy creams on T-zone", "Very drying toners on cheeks", "One-size products"],
    beautyProducts: [
      { name: "Micellar Cleansing Water", price: "₹1,299", reason: "Balances without stripping" },
      { name: "Glow Foundation", price: "₹3,199", reason: "Adapts to different zones" },
    ],
  },
};

const tools = [
  {
    icon: Droplets,
    title: "Moisturizer Analysis",
    description: "Analyze your skin's hydration levels and get personalized moisturizer recommendations based on your skin type.",
    tip: "Apply moisturizer on damp skin for better absorption.",
    detail: "Look for ingredients like hyaluronic acid for dry skin, niacinamide for oily skin, and ceramides for sensitive skin.",
  },
  {
    icon: Sun,
    title: "Sunscreen Guide",
    description: "Find the perfect SPF for your skin tone and daily routine. Protect against UV damage year-round.",
    tip: "Reapply sunscreen every 2 hours for optimal protection.",
    detail: "SPF 30 is the minimum for daily wear. SPF 50+ is recommended for outdoor activities or prolonged sun exposure.",
  },
  {
    icon: Wind,
    title: "Face Wash Finder",
    description: "Discover the ideal cleanser for your skin concerns — whether oily, dry, combination, or sensitive.",
    tip: "Double cleanse at night to remove makeup and impurities.",
    detail: "Gel cleansers suit oily skin; cream or milk cleansers work best for dry or sensitive types.",
  },
];

const Beautify = () => {
  const [skinType, setSkinType] = useState<SkinType>("");
  const [expandedTool, setExpandedTool] = useState<number | null>(null);

  const details = skinType ? skinTypeDetails[skinType] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl font-light">Beautify</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Personalized skin care tools and recommendations
        </p>

        {/* Skin Type Quiz */}
        <div className="mt-10 border p-6 bg-secondary/30">
          <h2 className="font-display text-2xl font-light">What's Your Skin Type?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select your skin type to get tailored product recommendations</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["oily", "dry", "sensitive", "combination"] as Exclude<SkinType, "">[]).map((type) => (
              <button
                key={type}
                onClick={() => setSkinType(skinType === type ? "" : type)}
                className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors border ${
                  skinType === type
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {details && (
            <div className="mt-6 grid gap-6 md:grid-cols-3 animate-fade-in">
              {/* Signs */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Signs you have {skinType} skin</p>
                <ul className="space-y-1.5">
                  {details.signs.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Avoid */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">What to avoid</p>
                <ul className="space-y-1.5">
                  {details.avoid.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Recommended products */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Recommended for you</p>
                <ul className="space-y-3">
                  {details.beautyProducts.map((p) => (
                    <li key={p.name} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-accent">{p.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.reason}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/products"
                  className="mt-4 flex items-center gap-1.5 text-xs uppercase tracking-widest text-accent hover:underline"
                >
                  Shop beauty <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Tools */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tools.map((tool, i) => (
            <div
              key={tool.title}
              className="group animate-fade-in border opacity-0 transition-colors hover:border-accent cursor-pointer"
              style={{ animationDelay: `${i * 120}ms` }}
              onClick={() => setExpandedTool(expandedTool === i ? null : i)}
            >
              <div className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-gold-light transition-colors group-hover:bg-accent">
                  <tool.icon className="h-5 w-5 text-accent transition-colors group-hover:text-primary-foreground" />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium">{tool.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>

                {expandedTool === i && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground animate-fade-in border-t pt-3">
                    {tool.detail}
                  </p>
                )}

                <div className="mt-5 border-t pt-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Pro Tip</p>
                  <p className="mt-1 text-sm italic text-muted-foreground">{tool.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 border p-8 text-center bg-secondary/20">
          <h3 className="font-display text-2xl font-light">Ready to try products on?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Browse our curated beauty range or try them virtually</p>
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <Link
              to="/products"
              className="bg-primary px-6 py-2.5 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Shop Beauty
            </Link>
            <Link
              to="/trial-room"
              className="border border-border px-6 py-2.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground hover:border-accent"
            >
              Virtual Try-On
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Beautify;
