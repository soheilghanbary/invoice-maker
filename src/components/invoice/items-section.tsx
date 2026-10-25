"use client";

import { Plus, Trash2 } from 'lucide-react';
import { ReceiptText } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { useFieldArray, useWatch, type Control, type UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/invoice/fields';
import { calculateTotals, defaultValues, formatMoney, moneyFormat } from '@/components/invoice/model';
import type { InvoiceItem, InvoiceValues } from '@/types/invoice';

export function InvoiceItemsSection({
  control,
  register,
}: {
  control: Control<InvoiceValues>;
  register: UseFormRegister<InvoiceValues>;
}) {
  const items = useWatch({ control, name: "items" }) ?? defaultValues.items;
  const currency =
    useWatch({ control, name: "currency" }) ?? defaultValues.currency;
  const subtotal = calculateTotals(items, 0, false).subtotal;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (mounted) {
    return (
      <MountedInvoiceItems
        control={control}
        register={register}
        items={items}
        subtotal={subtotal}
        currency={currency}
      />
    );
  }

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]">
          <ReceiptText size={17} />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-[#0c4a6e]">
            اقلام فاکتور
          </h2>
          <p className="mt-1 text-xs text-[#64748b]">
            محصول یا خدمات را به فاکتور اضافه کنید
          </p>
        </div>
      </div>
      <div
        className="h-24 rounded-xl border border-dashed border-[#e0f2fe] bg-[#f8fbfd]"
        aria-hidden="true"
      />
      <div className="mt-5 flex items-center justify-between border-t border-[#e0f2fe] pt-4 text-sm">
        <span className="text-[#64748b]">جمع اقلام</span>
        <strong className="tabular-nums text-[#334155]">
          {formatMoney(subtotal)} {currency}
        </strong>
      </div>
    </section>
  );
}

function MountedInvoiceItems({
  control,
  register,
  items,
  subtotal,
  currency,
}: {
  control: Control<InvoiceValues>;
  register: UseFormRegister<InvoiceValues>;
  items: InvoiceItem[];
  subtotal: number;
  currency: InvoiceValues["currency"];
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]">
            <ReceiptText size={17} />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-[#0c4a6e]">
              اقلام فاکتور
            </h2>
            <p className="mt-1 text-xs text-[#64748b]">
              محصول یا خدمات را به فاکتور اضافه کنید
            </p>
          </div>
        </div>
        <span className="rounded-lg bg-[#f0f9ff] px-2.5 py-1 text-xs font-bold text-[#64748b]">
          {moneyFormat.format(fields.length)} ردیف
        </span>
      </div>
      <div className="space-y-3">
        {fields.map((item, index) => {
          const quantity = Number(items[index]?.quantity) || 0;
          const unitPrice = Number(items[index]?.unitPrice) || 0;
          return (
            <div
              key={item.id}
              className="grid grid-cols-2 gap-3 rounded-2xl border border-[#dbeafe] bg-white p-4 shadow-[0_2px_10px_rgba(12,74,110,0.04)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,.55fr)_minmax(0,1fr)_minmax(0,1fr)_36px] md:items-center md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none"
            >
              <div className="col-span-full flex min-w-0 items-center justify-between gap-3 md:hidden">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#64748b]">
                    ردیف {moneyFormat.format(index + 1)}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-[#0c4a6e]">
                    {items[index]?.name || "آیتم جدید"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`حذف ردیف ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  className="shrink-0 gap-1.5 text-[#94a3b8] hover:bg-[#fbefed] hover:text-[#af6357]"
                >
                  <Trash2 size={15} /> حذف
                </Button>
              </div>
              <div className="col-span-full min-w-0 md:col-span-1">
                <Field label="نام آیتم">
                  <Input
                    {...register(`items.${index}.name`)}
                    placeholder="نام محصول / خدمات"
                  />
                </Field>
              </div>
              <div className="col-span-full min-w-0 md:col-span-1">
                <Field label="توضیحات">
                  <Input {...register(`items.${index}.description`)} />
                </Field>
              </div>
              <Field label="تعداد">
                <Input
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  step="any"
                  className="text-left tabular-nums"
                  dir="ltr"
                />
              </Field>
              <Field label="قیمت واحد">
                <Input
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="۰"
                  className="text-left tabular-nums"
                  dir="ltr"
                />
              </Field>
              <div className="col-span-full min-w-0 md:col-span-1">
                <Field label="قیمت کل">
                  <output className="flex h-11 w-full items-center justify-between rounded-xl bg-[#f0f9ff] px-3.5 text-sm font-bold tabular-nums text-[#0369a1]">
                    <span>{formatMoney(quantity * unitPrice)}</span>
                    <span className="text-xs font-semibold text-[#64748b]">
                      {currency}
                    </span>
                  </output>
                </Field>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={`حذف ردیف ${index + 1}`}
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                className="hidden text-[#94a3b8] hover:bg-[#fbefed] hover:text-[#af6357] md:mt-5 md:flex"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({ name: "", description: "", quantity: 1, unitPrice: 0 })
        }
        className="mt-4 border-dashed border-[#bae6fd] text-[#0284c7] hover:bg-[#f0f9ff]"
      >
        <Plus size={16} /> افزودن ردیف
      </Button>
      <div className="mt-5 flex items-center justify-between border-t border-[#e0f2fe] pt-4 text-sm">
        <span className="text-[#64748b]">جمع اقلام</span>
        <strong className="tabular-nums text-[#334155]">
          {formatMoney(subtotal)} {currency}
        </strong>
      </div>
    </section>
  );
}
