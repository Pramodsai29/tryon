import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Sparkles, Camera, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trialCount, setTrialCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = JSON.parse(localStorage.getItem("trialItems") || "[]");
      setTrialCount(items.length);
    };
    update();
    window.addEventListener("storage", update);
    // poll for local updates
    const interval = setInterval(update, 800);
    return () => { window.removeEventListener("storage", update); clearInterval(interval); };
  }, []);

  const linkClass = (path: string) =>
    `text-sm tracking-widest uppercase transition-colors hover:text-accent ${
      location.pathname === path ? "text-accent" : "text-muted-foreground"
    }`;

  const navLinks = [
    { to: "/products", label: "Shop" },
    { to: "/trial-room", label: "Try On", icon: Camera },
    { to: "/beautify", label: "Beautify", icon: Sparkles },
    { to: "/reviews", label: "Reviews" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-semibold tracking-wider">
          MAISON
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              <span className="flex items-center gap-1.5">
                {l.icon && <l.icon className="h-3.5 w-3.5" />}
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/trial-room" className="relative text-muted-foreground transition-colors hover:text-foreground">
            <ShoppingBag className="h-5 w-5" />
            {trialCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {trialCount}
              </span>
            )}
          </Link>
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-widest border-b border-border/50 ${
                location.pathname === l.to ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {l.icon && <l.icon className="h-4 w-4" />}
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
