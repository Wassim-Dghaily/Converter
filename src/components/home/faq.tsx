"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQS } from "@/lib/faq";

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section className="container py-20 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Questions, answered</h2>
        </div>

        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium">{faq.q}</span>
                  <Plus
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-45 text-primary",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
