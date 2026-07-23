import * as React from "react"

import { cn } from "@/lib/utils"

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      {
        "bg-red-50 border-red-200 text-red-800": variant === "destructive",
        "bg-blue-50 border-blue-200 text-blue-800": variant === "info",
        "bg-green-50 border-green-200 text-green-800": variant === "success",
        "bg-yellow-50 border-yellow-200 text-yellow-800": variant === "warning",
      },
      className
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
