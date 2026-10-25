"use client";

import { Check, FileText, ReceiptText } from "lucide-react";
import {
  type Control,
  Controller,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";
import { Field } from "@/components/invoice/fields";
import {
  calculateTotals,
  defaultValues,
  formatMoney,
} from "@/components/invoice/model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceValues } from "@/types/invoice";

export function InvoiceSummary({
  control,
  register,
  onPreview,
  saving,
  loading,
  uploading,
  isEditing,
}: {
  control: Control<InvoiceValues>;
  register: UseFormRegister<InvoiceValues>;
  onPreview: () => void;
  saving: boolean;
  loading: boolean;
  uploading: boolean;
  isEditing: boolean;
}) {
  const items = useWatch({ control, name: "items" }) ?? defaultValues.items;
  const discountValue = useWatch({ control, name: "discount" }) ?? 0;
  const taxEnabled = useWatch({ control, name: "taxEnabled" }) ?? false;
  const currency =
    useWatch({ control, name: "currency" }) ?? defaultValues.currency;
  const totals = calculateTotals(items, discountValue, taxEnabled);

  return (
    <aside className="sticky top-22 rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-[0_10px_35px_rgba(42,57,46,0.045)] print:hidden">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]">
          <ReceiptText size={17} />
        </span>
        <h2 className="font-extrabold text-[#0c4a6e]">خلاصه فاکتور</h2>
      </div>
      <div className="space-y-4 border-b border-[#e0f2fe] pb-5 text-sm">
        <div className="flex justify-between text-[#64748b]">
          <span>جمع جزء</span>
          <span className="font-semibold tabular-nums text-[#475569]">
            {formatMoney(totals.subtotal)}
          </span>
        </div>
        <Field label="تخفیف">
          <div className="relative">
            <Input
              {...register("discount", { valueAsNumber: true })}
              type="number"
              min="0"
              step="1"
              placeholder="۰"
              className="pl-14 text-left tabular-nums"
              dir="ltr"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">
              {currency}
            </span>
          </div>
        </Field>
        <Controller
          control={control}
          name="taxEnabled"
          render={({ field }) => (
            <Label className="flex cursor-pointer items-center justify-between rounded-xl bg-[#f8fbfd] px-3.5 py-3">
              <span>
                <span className="block text-sm font-semibold text-[#475569]">
                  مالیات بر ارزش افزوده
                </span>
                <span className="mt-1 block text-xs text-[#64748b]">
                  محاسبه ۱۰٪ روی مبلغ پس از تخفیف
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
          <div className="flex justify-between text-sm text-[#64748b]">
            <span>مالیات (۱۰٪)</span>
            <span className="font-semibold tabular-nums text-[#475569]">
              {formatMoney(totals.tax)}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between py-5">
        <span className="text-sm font-bold text-[#334155]">قابل پرداخت</span>
        <span className="text-left">
          <strong className="block text-xl font-extrabold tabular-nums text-[#0369a1]">
            {formatMoney(totals.total)}
          </strong>
          <span className="mt-1 block text-xs text-[#64748b]">{currency}</span>
        </span>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={saving || loading || uploading}
        className="mb-2 w-full gap-2"
      >
        <Check size={16} />{" "}
        {loading
          ? "در حال بارگذاری..."
          : uploading
            ? "در حال بارگذاری تصویر..."
            : saving
              ? "در حال ذخیره..."
              : isEditing
                ? "ذخیره تغییرات"
                : "ذخیره فاکتور"}
      </Button>
      <Button
        type="button"
        size="lg"
        onClick={onPreview}
        className="w-full gap-2"
        variant={"secondary"}
      >
        <FileText size={16} /> پیش‌نمایش فاکتور
      </Button>
      <p className="mt-3 text-center text-[11px] leading-5 text-[#64748b]">
        <Check size={12} className="mr-1 inline text-[#0284c7]" /> چاپ یا ذخیره
        مستقیم به صورت PDF
      </p>
    </aside>
  );
}
