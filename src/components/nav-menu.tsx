"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import type { NavMenu } from "@/lib/engine";
import { cn } from "@/lib/utils";

/* ---------------- Desktop: hover / click dropdowns ---------------- */

export function DesktopNav({ menus }: { menus: NavMenu[] }) {
  const [open, setOpen] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <nav ref={ref} className="hidden items-center gap-1 lg:flex">
      {menus.map((menu) => {
        const isOpen = open === menu.id;
        return (
          <div
            key={menu.id}
            className="relative"
            onMouseEnter={() => setOpen(menu.id)}
            onMouseLeave={() => setOpen((cur) => (cur === menu.id ? null : cur))}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : menu.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                isOpen ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              {menu.label}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className="w-[min(92vw,34rem)] rounded-xl border border-border bg-card p-3 shadow-xl">
                  <Link
                    href={menu.href}
                    onClick={() => setOpen(null)}
                    className="mb-2 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15"
                  >
                    All {menu.label} conversions
                    <span aria-hidden>→</span>
                  </Link>

                  {menu.tools.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {menu.tools.map((t) => (
                        <Link
                          key={t.href}
                          href={t.href}
                          onClick={() => setOpen(null)}
                          className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:border-primary/40 hover:text-primary"
                        >
                          {t.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {menu.groups.length > 0 ? (
                    <div className="grid max-h-[60vh] grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto sm:grid-cols-3">
                      {menu.groups.map((group) => (
                        <div key={group.title}>
                          <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-primary">
                            {group.title}
                          </p>
                          <ul>
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpen(null)}
                                  className="block rounded-md px-2 py-1 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 pb-1 text-sm text-muted-foreground">Specific conversions coming soon.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ---------------- Mobile: hamburger + accordion ---------------- */

export function MobileNav({ menus }: { menus: NavMenu[] }) {
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background shadow-xl">
          <div className="container space-y-1 py-3">
            {menus.map((menu) => {
              const isExpanded = expanded === menu.id;
              return (
                <div key={menu.id} className="border-b border-border/60 last:border-0">
                  <div className="flex items-center">
                    <Link
                      href={menu.href}
                      onClick={() => setOpen(false)}
                      className="flex-1 py-3 text-sm font-medium"
                    >
                      {menu.label}
                    </Link>
                    {(menu.groups.length > 0 || menu.tools.length > 0) && (
                      <button
                        type="button"
                        aria-label={`Toggle ${menu.label} conversions`}
                        aria-expanded={isExpanded}
                        onClick={() => setExpanded(isExpanded ? null : menu.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pb-3 pl-2">
                      {menu.tools.length > 0 && (
                        <div>
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                            Tools
                          </p>
                          <ul className="space-y-0.5">
                            {menu.tools.map((t) => (
                              <li key={t.href}>
                                <Link
                                  href={t.href}
                                  onClick={() => setOpen(false)}
                                  className="block rounded-md py-1.5 text-sm text-foreground/80 hover:text-foreground"
                                >
                                  {t.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {menu.groups.map((group) => (
                        <div key={group.title}>
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                            {group.title}
                          </p>
                          <ul className="space-y-0.5">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpen(false)}
                                  className="block rounded-md py-1.5 text-sm text-foreground/80 hover:text-foreground"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
