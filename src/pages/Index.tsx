import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Camera, Star, ShieldCheck } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import Navbar from "@/components/Navbar";
import { products } from "@/lib/data";

const featuredIds = ["1", "32", "38", "36"];
const featured = products.filter((p) => featuredIds.includes(p.id));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[85vh] overflow-hidden">
        <img
          src={heroBanner}
          alt="Fashion editorial featuring elegant styling"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-lg animate-fade-in space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80">
                Virtual Trial Room
              </p>
              <h1 className="font-display text-5xl font-light leading-tight text-primary-foreground md:text-7xl">
                Try Before
                <br />
                <span className="italic">You Buy</span>
              </h1>
              <p className="font-body text-sm leading-relaxed text-primary-foreground/70">
                Experience fashion like never before. Try on outfits virtually using your webcam and shop with confidence.
              </p>
              <div className="flex gap-3 pt-2">
                <Link
                  to="/products"
                  className="flex items-center gap-2 bg-primary-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Shop Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/trial-room"
                  className="flex items-center gap-2 border border-primary-foreground/30 px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <Camera className="h-3.5 w-3.5" /> Try On
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            { icon: Camera, title: "Virtual Try-On", desc: "Use your webcam to try outfits in real-time with face curve guides", href: "/trial-room" },
            { icon: Sparkles, title: "Beauty Tools", desc: "AI-powered skin care analysis and product matching by skin type", href: "/beautify" },
            { icon: Star, title: "Smart Reviews", desc: "Sentiment-analyzed reviews verified by real customers", href: "/reviews" },
          ].map((feature, i) => (
            <Link
              key={feature.title}
              to={feature.href}
              className="animate-fade-in space-y-4 text-center opacity-0 group"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-gold-light transition-colors group-hover:bg-accent">
                <feature.icon className="h-6 w-6 text-accent transition-colors group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="border-t bg-secondary/20 py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Handpicked</p>
              <h2 className="mt-1 font-display text-3xl font-light">Featured Picks</h2>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-accent hover:underline"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, i) => (
              <div
                key={product.id}
                className="group animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Link
                      to="/products"
                      className="flex w-full items-center justify-center gap-2 bg-primary py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-medium tracking-wide">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {[
              { icon: ShieldCheck, title: "Privacy First", desc: "Privacy mode protects you in the virtual try-on room" },
              { icon: Star, title: "Verified Reviews", desc: "All reviews are email-verified and sentiment-analysed" },
              { icon: Sparkles, title: "AI Styling", desc: "Our chatbot recommends outfits tailored to your style" },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center gap-3">
                <b.icon className="h-7 w-7 text-accent" />
                <h4 className="font-display text-lg font-medium">{b.title}</h4>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="font-display text-lg tracking-wider">MAISON</p>
          <p className="mt-2 text-xs text-muted-foreground">Virtual Trial Room Shopping Experience</p>
          <div className="mt-4 flex justify-center gap-6">
            {[
              { to: "/products", label: "Shop" },
              { to: "/trial-room", label: "Try On" },
              { to: "/beautify", label: "Beautify" },
              { to: "/reviews", label: "Reviews" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
