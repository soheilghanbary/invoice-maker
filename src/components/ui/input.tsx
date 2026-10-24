import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 py-2 text-sm leading-5 text-foreground shadow-none outline-none transition-[border-color,box-shadow,background-color] file:mr-2 file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-muted file:px-2 file:text-xs file:font-semibold file:text-foreground placeholder:text-muted-foreground/80 focus-visible:border-ring/70 focus-visible:ring-4 focus-visible:ring-ring/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10 dark:bg-input/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
