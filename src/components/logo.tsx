import { cn } from "@/lib/utils";

/** YallaConvert wordmark + mark. The mark is two arrows forming a conversion loop. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[18deg]" />
      <span className="font-display text-[1.35rem] font-bold leading-none tracking-tight">
        Yalla<span className="brand-gradient">Convert</span>
      </span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="yc-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(262 83% 60%)" />
          <stop offset="1" stopColor="hsl(22 92% 56%)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9.5" fill="url(#yc-mark)" />
      <path
        d="M9 13.5a7 7 0 0 1 11.2-3.3M23 18.5a7 7 0 0 1-11.2 3.3"
        stroke="white"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M20 8.5v3.2h-3.2M12 23.5v-3.2h3.2"
        stroke="white"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
