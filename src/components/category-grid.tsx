import Link from "next/link";
import {
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  FileType,
  Table,
  FolderArchive,
  ScanText,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { categoryList, registry } from "@/lib/engine";
import { toolsForCategory } from "@/lib/tools";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Image: ImageIcon,
  Music,
  Video,
  FileText,
  FileType,
  Table,
  FolderArchive,
  ScanText,
};

export function CategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categoryList().map((category) => {
        const Icon = ICONS[category.icon] ?? FileText;
        const available =
          registry.isCategoryAvailable(category.id) || toolsForCategory(category.id).length > 0;
        return (
          <Link
            key={category.id}
            href={category.href}
            className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  available
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {available ? "Ready" : "Coming soon"}
              </span>
            </div>
            <div>
              <h3 className="flex items-center gap-1 font-semibold">
                {category.label}
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{category.blurb}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
