"use client";

import { cn } from "cn";
import type * as React from "react";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    /* biome-ignore lint/a11y/noLabelWithoutControl: reused as a generic label wrapper for custom form controls. */
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-[13px] leading-5 font-semibold text-[#475569] select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
