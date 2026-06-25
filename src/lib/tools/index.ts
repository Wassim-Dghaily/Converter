import type { CategoryId } from "@/lib/engine";
import type { Tool } from "./types";
import { mergePdfTool } from "./merge-pdf";
import { splitPdfTool } from "./split-pdf";

/** All registered tools. */
export const TOOLS: Tool[] = [mergePdfTool, splitPdfTool];

export const toolBySlug = (slug: string): Tool | undefined => TOOLS.find((t) => t.slug === slug);

export const toolsForCategory = (category: CategoryId): Tool[] =>
  TOOLS.filter((t) => t.category === category);

export type { Tool, ToolInput } from "./types";
