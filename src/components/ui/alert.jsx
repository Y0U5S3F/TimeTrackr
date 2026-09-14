import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef(({ className, variant = "success", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn("upload-msg", variant === "error" ? "error" : "success", className)}
    {...props}
  />
));
Alert.displayName = "Alert";

export { Alert };
