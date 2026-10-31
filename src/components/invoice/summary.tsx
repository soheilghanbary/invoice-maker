"use client";
import { Check, FileText } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  calculateTotals,
  defaultValues,
  formatMoney,
} from "@/components/invoice/model";
import { LedgerRow } from "@/components/invoice/section-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceValues } from "@/types/invoice";

function useInvoiceTotals() {
  const { control } = useFormContext<InvoiceValues>();
  const items = useWatch({ control, name: "items" }) ?? defaultValues.items;
  const discountValue = useWatch({ control, name: "discount" }) ?? 0;
  const taxEnabled = useWatch({ control, name: "taxEnabled" }) ?? false;
  const currency =
    useWatch({ control, name: "currency" }) ?? defaultValues.currency;
  return {
    control,
    currency,
    taxEnabled,
    totals: calculateTotals(items, discountValue, taxEnabled),
  };
}

function submitLabel({
  loading,
  uploading,
  saving,
  isEditing,
}: {
  loading: boolean;
  uploading: boolean;
  saving: boolean;
  isEditing: boolean;
}) {
  return loading
    ? "در حال بارگذاری..."
    : uploading
      ? "در حال بارگذاری تصویر..."
      : saving
        ? "در حال ذخیره..."
        : isEditing
          ? "ذخیره تغییرات"
          : "ذخیره فاکتور";
}

export function InvoiceSummary({
  onPreview,
  saving,
  loading,
  uploading,
  isEditing,
}: {
  onPreview: () => void;
  saving: boolean;
  loading: boolean;
  uploading: boolean;
  isEditing: boolean;
}) {
  const { control, currency, taxEnabled, totals } = useInvoiceTotals();
  const disabled = saving || loading || uploading;

  return (
    <>
      <aside className="sticky top-20 hidden rounded-xl border border-border bg-card shadow-sm lg:block print:hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-bold text-foreground">خلاصه فاکتور</h2>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm">
          <LedgerRow label="جمع جزء">
            <span className="font-semibold tabular-nums text-foreground">
              {formatMoney(totals.subtotal)}
            </span>
          </LedgerRow>
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-muted-foreground">تخفیف</span>
            <div className="relative w-36">
              <Controller
                control={control}
                name="discount"
                render={({ field }) => (
                  <Input
                    ref={field.ref}
                    name={field.name}
                    value={field.value ?? 0}
                    onBlur={(event) => {
                      field.onBlur();
                      const value = Number(event.currentTarget.value);
                      field.onChange(
                        Number.isFinite(value) ? Math.max(0, value) : 0,
                      );
                    }}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      field.onChange(value === "" ? "" : Number(value));
                    }}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="۰"
                    className="h-8 pl-14 text-right text-[13px] tabular-nums"
                    dir="ltr"
                  />
                )}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                {currency}
              </span>
            </div>
          </div>
          <Controller
            control={control}
            name="taxEnabled"
            render={({ field }) => (
              <Label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  مالیات بر ارزش افزوده
                  <span className="mt-0.5 block text-[11px] leading-4">
                    ۱۰٪ روی مبلغ پس از تخفیف
                  </span>
                </span>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  name={field.name}
                />
              </Label>
            )}
          />
          {taxEnabled && (
            <LedgerRow label="مالیات (۱۰٪)">
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(totals.tax)}
              </span>
            </LedgerRow>
          )}
        </div>
        <div className="flex items-end justify-between border-t-2 border-primary/25 px-5 pb-4 pt-3">
          <span className="text-sm font-bold text-foreground">قابل پرداخت</span>
          <span className="text-left">
            <strong className="block text-2xl font-bold leading-7 tabular-nums text-primary">
              {formatMoney(totals.total)}
            </strong>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {currency}
            </span>
          </span>
        </div>
        <div className="px-5 pb-5">
          <Button
            type="submit"
            size="lg"
            disabled={disabled}
            className="w-full gap-2"
          >
            <Check size={16} />{" "}
            {submitLabel({ loading, uploading, saving, isEditing })}
          </Button>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden print:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">قابل پرداخت</p>
            <p className="truncate text-sm font-bold tabular-nums text-primary">
              {formatMoney(totals.total)}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                {currency}
              </span>
            </p>
          </div>
          <div className="ms-auto flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="پیش‌نمایش فاکتور"
              onClick={onPreview}
            >
              <FileText size={16} />
            </Button>
            <Button
              type="submit"
              disabled={disabled}
              className="min-w-32 flex-1"
            >
              {submitLabel({ loading, uploading, saving, isEditing })}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
