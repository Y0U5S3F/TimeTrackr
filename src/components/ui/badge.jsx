import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Thin Badge primitive. Visual styling for this app's specific badges
 * (skill pill, today/tomorrow row badges) is intentionally kept in the
 * original ported CSS classes (.board-skill / .row-badge) passed in via
 * `className`, to guarantee pixel parity with the pre-migration design.
 */
function Badge({ className, ...props }) {
  return <span className={cn("inline-flex items-center", className)} {...props} />;
}

export { Badge };
