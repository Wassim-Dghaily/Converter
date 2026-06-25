import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { siteConfig } from "@/config/site";
import { buildNavMenus } from "@/lib/engine";
import { toolsForCategory } from "@/lib/tools";

export function SiteHeader() {
  const menus = buildNavMenus().map((menu) => ({
    ...menu,
    tools: toolsForCategory(menu.id).map((t) => ({ label: t.title, href: `/tools/${t.slug}` })),
  }));
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label={`${siteConfig.name} home`}>
          <Logo />
        </Link>
        <NavMenu menus={menus} />
      </div>
    </header>
  );
}
