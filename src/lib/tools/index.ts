import type { CategoryId } from "@/lib/engine";
import type { Tool } from "./types";
import { mergePdfTool } from "./merge-pdf";
import { splitPdfTool } from "./split-pdf";
import { createZipTool } from "./create-zip";
import { extractZipTool } from "./extract-zip";

/** All registered tools. */
export const TOOLS: Tool[] = [mergePdfTool, splitPdfTool, createZipTool, extractZipTool];

export const toolBySlug = (slug: string): Tool | undefined => TOOLS.find((t) => t.slug === slug);

export const toolsForCategory = (category: CategoryId): Tool[] =>
  TOOLS.filter((t) => t.category === category);

export type { Tool, ToolInput, ToolResult, ToolFile } from "./types";
