import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="container flex min-h-[62vh] flex-col items-center justify-center gap-7 py-20 text-center">
      <LogoMark className="h-16 w-16 animate-float" />
      <div>
        <p className="font-display text-7xl font-bold leading-none brand-gradient">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">This page took a wrong turn</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist — but there&apos;s plenty here to convert.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          Back home
        </Link>
        <Link href="/convert/image" className={buttonVariants({ variant: "outline" })}>
          Start converting
        </Link>
      </div>
    </div>
  );
}
