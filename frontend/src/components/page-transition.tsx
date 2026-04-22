"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageTransition({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
