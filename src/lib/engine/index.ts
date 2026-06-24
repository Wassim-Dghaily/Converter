/**
 * Conversion Engine — public surface.
 *
 * Import from "@/lib/engine" everywhere in the app. `seedRegistry()` is invoked here so the
 * registry is populated the first time the engine is imported.
 */
import { seedRegistry } from "./seed";

seedRegistry();

export * from "./types";
export { FORMATS, getFormat, format } from "./formats";
export { CATEGORIES, CATEGORY_ORDER, categoryList } from "./categories";
export { registry } from "./registry";
export { runConversion } from "./run-conversion";
