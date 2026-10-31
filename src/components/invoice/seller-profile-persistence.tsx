"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { defaultValues } from "@/components/invoice/model";
import type { InvoiceValues } from "@/types/invoice";

const STORAGE_KEY = "factorino-next-seller-profile";

export function SellerProfilePersistence({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const { control, setValue } = useFormContext<InvoiceValues>();
  const seller = useWatch({ control, name: "seller" });
  const stampPreview = useWatch({ control, name: "stampPreview" }) ?? "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<
          InvoiceValues["seller"]
        > & {
          seller?: Partial<InvoiceValues["seller"]>;
          stampPreview?: string;
        };
        const isProfile = "seller" in parsed;
        const storedSeller = parsed.seller ?? parsed;
        setValue("seller", { ...defaultValues.seller, ...storedSeller });
        if (isProfile) setValue("stampPreview", parsed.stampPreview ?? "");
      }
    } catch {
      setValue("seller", defaultValues.seller);
    }
    setReady(true);
  }, [enabled, setValue]);

  useEffect(() => {
    if (!enabled || !ready || !seller) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ seller, stampPreview }),
      );
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [enabled, ready, seller, stampPreview]);

  return null;
}
