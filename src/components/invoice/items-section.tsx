"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Field } from "@/components/invoice/fields";
import {
  calculateTotals,
  defaultValues,
  formatCount,
  formatMoney,
} from "@/components/invoice/model";
import {
  LedgerRow,
  SectionBody,
  SectionCard,
  SectionHeader,
} from "@/components/invoice/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InvoiceValues } from "@/types/invoice";

const ITEM_COLUMNS =
  "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_76px_minmax(0,1fr)_minmax(0,1fr)_36px]";

export function InvoiceItemsSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InvoiceValues>();
  const items = useWatch({ control, name: "items" }) ?? defaultValues.items;
  const currency =
    useWatch({ control, name: "currency" }) ?? defaultValues.currency;
  const subtotal = calculateTotals(items, 0, false).subtotal;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <SectionCard>
      <SectionHeader
        title="اقلام فاکتور"
        description="محصول یا خدمات را به فاکتور اضافه کنید"
        action={
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {formatCount(fields.length)} ردیف
          </span>
        }
      />
      <SectionBody>
        <div
          className={`hidden gap-x-3 border-b border-border pb-2 text-xs font-medium text-muted-foreground md:grid ${ITEM_COLUMNS}`}
          aria-hidden="true"
        >
          <span>نام آیتم</span>
          <span>توضیحات</span>
          <span className="text-center">تعداد</span>
          <span>قیمت واحد</span>
          <span>جمع</span>
          <span />
        </div>
        <div className="divide-y divide-border/60">
          {fields.map((item, index) => {
            const quantity = Number(items[index]?.quantity) || 0;
            const unitPrice = Number(items[index]?.unitPrice) || 0;
            const nameError = errors.items?.[index]?.name?.message;
            const quantityError = errors.items?.[index]?.quantity?.message;
            const unitPriceError = errors.items?.[index]?.unitPrice?.message;
            return (
              <div
                key={item.id}
                className={`grid grid-cols-2 gap-x-3 gap-y-3 py-3 md:items-center md:gap-y-0 ${ITEM_COLUMNS}`}
              >
                <div className="col-span-full flex min-w-0 items-center justify-between gap-3 md:hidden">
                  <p className="text-xs font-medium tabular-nums text-muted-foreground">
                    ردیف {formatCount(index + 1)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    aria-label={`حذف ردیف ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="shrink-0 gap-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={13} /> حذف
                  </Button>
                </div>
                <div className="col-span-full min-w-0 md:col-span-1">
                  <Field
                    label="نام آیتم"
                    labelClassName="md:hidden"
                    error={nameError}
                  >
                    <Input
                      {...register(`items.${index}.name`)}
                      aria-invalid={Boolean(nameError)}
                      placeholder="نام محصول / خدمات"
                    />
                  </Field>
                </div>
                <div className="col-span-full min-w-0 md:col-span-1">
                  <Field label="توضیحات" labelClassName="md:hidden">
                    <Input {...register(`items.${index}.description`)} />
                  </Field>
                </div>
                <Field
                  label="تعداد"
                  labelClassName="md:hidden"
                  error={quantityError}
                >
                  <Input
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                      required: "تعداد را وارد کنید.",
                      min: { value: 0, message: "تعداد نمی‌تواند منفی باشد." },
                    })}
                    type="number"
                    min="0"
                    step="any"
                    aria-invalid={Boolean(quantityError)}
                    className="text-center tabular-nums"
                    dir="ltr"
                  />
                </Field>
                <Field
                  label="قیمت واحد"
                  labelClassName="md:hidden"
                  error={unitPriceError}
                >
                  <Input
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                      required: "قیمت واحد را وارد کنید.",
                      min: {
                        value: 0,
                        message: "قیمت نمی‌تواند منفی باشد.",
                      },
                    })}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="۰"
                    aria-invalid={Boolean(unitPriceError)}
                    className="text-right tabular-nums"
                    dir="ltr"
                  />
                </Field>
                <div className="col-span-full min-w-0 md:col-span-1">
                  <Field label="قیمت کل" labelClassName="md:hidden">
                    <output className="flex h-9 w-full items-center justify-between gap-2 rounded-md bg-muted px-3 text-sm font-semibold tabular-nums text-foreground md:justify-start md:bg-transparent md:px-0">
                      <span>{formatMoney(quantity * unitPrice)}</span>
                      <span className="text-[10px] font-medium text-muted-foreground md:hidden">
                        {currency}
                      </span>
                    </output>
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`حذف ردیف ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  className="hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:flex"
                >
                  <Trash2 size={15} />
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
          className="mt-3 w-full border-dashed text-primary hover:bg-accent"
        >
          <Plus size={16} /> افزودن ردیف
        </Button>
        <LedgerRow
          label="جمع اقلام"
          className="mt-4 border-t border-border pt-3"
        >
          <strong className="tabular-nums text-foreground">
            {formatMoney(subtotal)} {currency}
          </strong>
        </LedgerRow>
      </SectionBody>
    </SectionCard>
  );
}
