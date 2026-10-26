"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { useCart } from "@/components/cart/CartProvider";
import { business } from "@/data/business";
import { lockScroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const links = [
  { id: "story", label: "Our Story" },
  { id: "signature", label: "Signature" },
  { id: "menu", label: "Menu" },
  { id: "dining", label: "Dining" },
  { id: "feasts", label: "Feasts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { count, open, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevCount = useRef(count);

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Small "bump" on the bag icon when something is added.
  useEffect(() => {
    if (ready && count > prevCount.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 600);
      prevCount.current = count;
      return () => window.clearTimeout(t);
    }
    prevCount.current = count;
  }, [count, ready]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (menuOpen && !d.open) {
      d.showModal();
      lockScroll(true);
    } else if (!menuOpen && d.open) d.close();
  }, [menuOpen]);

  // Close synchronously so the scroll lock is released before the anchor scroll runs.
  const closeMenu = () => {
    lockScroll(false);
    dialogRef.current?.close();
    setMenuOpen(false);
  };

  const solid = scrolled || !isHome;

  return (
    <header
      className={cn(
        "on-dark fixed inset-x-0 top-0 z-50 text-cream transition-[background-color,backdrop-filter,border-color] duration-500",
        solid ? "border-b border-cream/10 bg-midnight/85 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-6 px-5 md:px-10">
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a href={href(l.id)} className="link-underline py-2 text-[0.78rem] font-medium uppercase tracking-[0.2em] text-cream/85 hover:text-cream">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={open}
            className={cn(
              "relative inline-flex h-11 items-center gap-2 rounded-full border border-cream/25 px-4 text-[0.75rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-saffron hover:text-saffron",
              bump && "motion-safe:animate-[pulse_0.6s_ease-out]"
            )}
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold tabular-nums transition-colors",
                count > 0 ? "bg-saffron text-midnight" : "bg-cream/15 text-cream/70"
              )}
              aria-hidden="true"
            >
              {ready ? count : 0}
            </span>
          </button>
          <a
            href={href("signature")}
            className="hidden h-11 items-center rounded-full bg-saffron px-5 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-midnight transition-colors hover:bg-cream md:inline-flex"
          >
            Order Now
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <MenuIcon className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <dialog
        ref={dialogRef}
        className="panel fade on-dark h-dvh w-screen"
        aria-label="Site navigation"
        onClose={() => {
          lockScroll(false);
          setMenuOpen(false);
        }}
      >
        <div className="relative flex h-full flex-col bg-midnight px-6 pb-10 pt-5 text-cream">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/25"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <ul className="mt-14 flex flex-col gap-2">
            {links.map((l, i) => (
              <li key={l.id}>
                <a
                  href={href(l.id)}
                  onClick={closeMenu}
                  className="flex items-baseline gap-4 py-2 font-serif text-5xl"
                >
                  <span className="font-sans text-xs tabular-nums text-saffron">0{i + 1}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3">
            <a
              href={href("signature")}
              onClick={closeMenu}
              className="flex min-h-13 items-center justify-center rounded-full bg-saffron text-[0.8rem] font-bold uppercase tracking-[0.18em] text-midnight"
            >
              Order Signature Biryani
            </a>
            <p aria-hidden="true" className="urdu text-center text-3xl text-saffron/60">
              {business.nameUrdu}
            </p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
