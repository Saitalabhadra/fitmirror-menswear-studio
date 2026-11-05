import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl">TRYME AI</p>
          <p className="mt-3 max-w-sm text-sm text-ink-foreground/60">
            Try Before You Buy – See Yourself in Every Outfit. Your camera feed is processed on your device and never uploaded.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-foreground/50">Studio</p>
          <Link to="/try-on" className="block hover:text-lavender">Live Try-On</Link>
          <Link to="/explore" className="block hover:text-lavender">Explore outfits</Link>
          <Link to="/my-looks" className="block hover:text-lavender">My Looks</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-foreground/50">Company</p>
          <Link to="/about" className="block hover:text-lavender">About</Link>
          <Link to="/privacy" className="block hover:text-lavender">Privacy</Link>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-5 text-center text-xs text-ink-foreground/40">
        © {2026} TRYME AI. Crafted for confident shopping.
      </div>
    </footer>
  );
}
