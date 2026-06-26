"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ShieldCheck, ArrowRight, Gift, Zap, UserX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const FORMATS = ["PNG", "JPG", "WebP", "MP4", "MP3", "PDF", "DOCX", "CSV", "GIF", "ZIP", "WAV", "AVIF"];

const TRUST = [
  { icon: Gift, label: "Free to use" },
  { icon: UserX, label: "No sign-up" },
  { icon: ShieldCheck, label: "No uploads" },
  { icon: Zap, label: "Instant, in-browser" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  const container: Variants = { show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px] animate-float"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container flex flex-col items-center gap-6 py-24 text-center md:py-32"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          100% private — your files never leave your device
        </motion.span>

        <motion.h1
          variants={item}
          className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Convert anything.
          <br />
          <span className="brand-gradient">Yalla.</span>
        </motion.h1>

        <motion.p variants={item} className="max-w-2xl text-lg text-muted-foreground">
          {siteConfig.description}
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
          <Link href="#categories" className={buttonVariants({ size: "lg" })}>
            Start converting <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#how" className={buttonVariants({ size: "lg", variant: "outline" })}>
            How it works
          </Link>
        </motion.div>

        <motion.ul variants={item} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-sm text-muted-foreground">
          {TRUST.map((t) => (
            <li key={t.label} className="inline-flex items-center gap-1.5">
              <t.icon className="h-4 w-4 text-primary" />
              {t.label}
            </li>
          ))}
        </motion.ul>

        <motion.ul variants={item} className="mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
          {FORMATS.map((f, i) => (
            <li
              key={f}
              className="rounded-xl border border-border bg-card/70 px-3 py-1.5 text-sm font-semibold text-foreground/75 shadow-sm backdrop-blur animate-float"
              style={{ animationDelay: `${(i % 6) * 0.4}s`, animationDuration: `${5 + (i % 4)}s` }}
            >
              {f}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
