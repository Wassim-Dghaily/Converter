import { buildNavMenus } from "@/lib/engine";
import { toolsForCategory } from "@/lib/tools";
import { HeaderBar } from "@/components/header-bar";

export function SiteHeader() {
  const menus = buildNavMenus().map((menu) => ({
    ...menu,
    tools: toolsForCategory(menu.id).map((t) => ({ label: t.title, href: `/tools/${t.slug}` })),
  }));
  return <HeaderBar menus={menus} />;
}
