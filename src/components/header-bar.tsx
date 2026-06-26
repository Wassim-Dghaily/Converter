"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { DesktopNav, MobileNav } from "@/components/nav-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavMenu } from "@/lib/engine";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Scroll-aware header: transparent at the top, frosted + bordered once you scroll. */
export function HeaderBar({ menus }: { menus: NavMenu[] }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "glass border-b border-border/60 shadow-sm" : "border-b border-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${siteConfig.name} home`} className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5">
          <DesktopNav menus={menus} />
          <ThemeToggle />
          <MobileNav menus={menus} />
        </div>
      </div>
    </header>
  );
}
