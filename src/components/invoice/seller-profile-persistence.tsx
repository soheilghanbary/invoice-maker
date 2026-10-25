"use client";

import { useEffect, useState } from "react";
import { type Control, type useForm, useWatch } from "react-hook-form";
import { defaultValues } from "@/components/invoice/model";
import type { InvoiceValues } from "@/types/invoice";

export function SellerProfilePersistence({
  control,
  setValue,
  enabled = true,
}: {
  control: Control<InvoiceValues>;
  setValue: ReturnType<typeof useForm<InvoiceValues>>["setValue"];
  enabled?: boolean;
}) {
  const seller = useWatch({ control, name: "seller" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = window.localStorage.getItem(
        "factorino-next-seller-profile",
      );
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<InvoiceValues["seller"]>;
        setValue("seller", { ...defaultValues.seller, ...parsed });
      }
    } catch {
      setValue("seller", defaultValues.seller);
    }
    setReady(true);
  }, [enabled, setValue]);

  useEffect(() => {
    if (enabled && ready && seller) {
      window.localStorage.setItem(
        "factorino-next-seller-profile",
        JSON.stringify(seller),
      );
    }
  }, [enabled, ready, seller]);

  return null;
}
