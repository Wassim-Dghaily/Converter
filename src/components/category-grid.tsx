"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {categoryList().map((category) => {
        const Icon = ICONS[category.icon] ?? FileText;
        const available =
          registry.isCategoryAvailable(category.id) || toolsForCategory(category.id).length > 0;
        return (
          <motion.div key={category.id} variants={item}>
            <Link
              href={category.href}
              className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-float"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="flex items-center justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    available
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {available ? "Available" : "Soon"}
                </span>
              </div>
              <div>
                <h3 className="flex items-center gap-1 font-display text-lg font-semibold">
                  {category.label}
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{category.blurb}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
