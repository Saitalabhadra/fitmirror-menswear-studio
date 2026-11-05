import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/explore", label: "Explore" },
  { to: "/try-on", label: "Try-On" },
  { to: "/my-looks", label: "My Looks" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-baseline gap-1.5" onClick={() => setOpen(false)}>
          <span className="font-display text-2xl leading-none">TRYME</span>
          <span className="rounded-full bg-lavender px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ink">AI</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild variant="hero" size="default">
            <Link to="/try-on">Start Try-On</Link>
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t bg-background px-5 py-4 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2.5 text-lg font-medium">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
