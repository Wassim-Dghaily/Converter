import { cn } from "@/lib/utils";

/** YallaConvert wordmark + mark. The mark is two arrows forming a conversion loop. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <LogoMark className="h-7 w-7" />
      <span className="text-lg tracking-tight">
        Yalla<span className="text-primary">Convert</span>
      </span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 13.5a7 7 0 0 1 11.2-3.3M23 18.5a7 7 0 0 1-11.2 3.3"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M20 8.5v3.2h-3.2M12 23.5v-3.2h3.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
