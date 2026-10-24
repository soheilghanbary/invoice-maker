"use client";

import { faIR } from "@daypicker/persian";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  ImagePlus,
  Plus,
  Printer,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  type Control,
  Controller,
  type UseFormRegister,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type InvoiceItem = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceValues = {
  type: string;
  number: string;
  date: string;
  currency: "تومان" | "ریال";
  seller: {
    name: string;
    phone: string;
    address: string;
    postalCode: string;
    nationalId: string;
    economicCode: string;
  };
  buyer: {
    name: string;
    phone: string;
    address: string;
    postalCode: string;
    nationalId: string;
    economicCode: string;
  };
  items: InvoiceItem[];
  notes: string;
  discount: number;
  taxEnabled: boolean;
};

const defaultValues: InvoiceValues = {
  type: "فاکتور فروش",
  number: "۱۴۰۵-۱۰۰۱",
  date: "2026-10-24",
  currency: "ریال",
  seller: {
    name: "",
    phone: "",
    address: "",
    postalCode: "",
    nationalId: "",
    economicCode: "",
  },
  buyer: {
    name: "",
    phone: "",
    address: "",
    postalCode: "",
    nationalId: "",
    economicCode: "",
  },
  items: [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
  notes: "",
  discount: 0,
  taxEnabled: false,
};

const moneyFormat = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
const formatMoney = (value: number) =>
  moneyFormat.format(Math.max(0, Math.round(value)));

function parseInvoiceDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day, 12);
}

function formatInvoiceDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "انتخاب تاریخ";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function toInvoiceDateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <Label className="flex min-w-0 flex-col items-stretch gap-2 text-[13px] font-semibold text-[#475569]">
      <span className="leading-5">
        {label}
        {required && <span className="mr-1 text-[#0284c7]">*</span>}
      </span>
      {children}
    </Label>
  );
}

function SelectField({
  label,
  name,
  options,
  control,
}: {
  label: string;
  name: "type" | "currency";
  options: string[];
  control: Control<InvoiceValues>;
}) {
  return (
    <Field label={label}>
      <span className="relative">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              items={options.map((option) => ({
                label: option,
                value: option,
              }))}
            >
              <SelectTrigger
                ref={field.ref}
                onBlur={field.onBlur}
                className="w-full text-right"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </span>
    </Field>
  );
}

function PartyFields({
  title,
  name,
  register,
}: {
  title: string;
  name: "seller" | "buyer";
  register: UseFormRegister<InvoiceValues>;
}) {
  const fields = [
    {
      key: "name",
      label: name === "seller" ? "نام شرکت یا مجموعه" : "نام خریدار",
      placeholder: name === "seller" ? "مثلاً استودیو آوید" : "نام شخص یا شرکت",
      required: true,
    },
    {
      key: "phone",
      label: "شماره تماس",
      placeholder: "۰۹۱۲ ۱۲۳ ۴۵۶۷",
      type: "tel",
    },
    { key: "address", label: "آدرس", placeholder: "استان، شهر، خیابان و پلاک" },
    {
      key: "postalCode",
      label: "کدپستی",
      placeholder: "۱۰ رقمی",
      type: "text",
    },
    {
      key: "nationalId",
      label: "شناسه ملی / شماره ملی",
      placeholder: "شناسه یا شماره ملی",
    },
    {
      key: "economicCode",
      label: "شماره اقتصادی",
      placeholder: "شماره اقتصادی",
    },
  ] as const;

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]">
          <ReceiptText size={17} />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-[#0c4a6e]">{title}</h2>
          <p className="mt-1 text-xs text-[#64748b]">
            {name === "seller"
              ? "اطلاعات روی فاکتور نمایش داده می‌شود و در این مرورگر ذخیره می‌شود"
              : "اطلاعات روی فاکتور نمایش داده می‌شود"}
          </p>
        </div>
      </div>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            required={"required" in field && field.required}
          >
            <Input
              {...register(`${name}.${field.key}` as const)}
              type={"type" in field ? field.type : "text"}
              placeholder={field.placeholder}
              dir={
                field.key === "address" || field.key === "name" ? "rtl" : "auto"
              }
            />
          </Field>
        ))}
      </div>
    </section>
  );
}

function InvoicePartyCard({
  title,
  party,
}: {
  title: string;
  party: InvoiceValues["seller"];
}) {
  const details = [
    ["شماره تماس", party.phone],
    ["آدرس", party.address],
    ["کدپستی", party.postalCode],
    ["شناسه ملی / شماره ملی", party.nationalId],
    ["شماره اقتصادی", party.economicCode],
  ].filter(([, value]) => Boolean(value));

  return (
    <section className="min-w-0 first:pl-4 last:border-r last:border-[#e2e8f0] last:pr-4">
      <h3 className="text-xs font-bold text-[#0369a1]">{title}</h3>
      <p className="mt-2 text-sm font-extrabold text-[#0c4a6e]">
        {party.name || "—"}
      </p>
      <dl className="mt-3 space-y-1.5 text-xs leading-5 text-[#475569]">
        {details.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="shrink-0 text-[#64748b]">{label}:</dt>
            <dd className="min-w-0 wrap-break-word">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function InvoicePreview({
  open,
  values,
  subtotal,
  discount,
  tax,
  total,
  stampPreview,
  onPrint,
  onClose,
}: {
  open: boolean;
  values: InvoiceValues;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  stampPreview: string;
  onPrint: () => void;
  onClose: () => void;
}) {
  const visibleItems = values.items.filter(
    (item) =>
      item.name.trim() || item.description.trim() || Number(item.unitPrice) > 0,
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        id="invoice-preview-overlay"
        showCloseButton={false}
        className="fixed! inset-0! left-0! top-0! z-50! flex! w-full! max-w-none! translate-x-0! translate-y-0! flex-col! items-center! justify-center! gap-0! rounded-none! bg-transparent! p-3! ring-0! sm:p-6! sm:max-w-none!"
      >
        <section className="my-auto flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-[#e0f2fe] px-5 py-4 print:hidden">
            <div>
              <DialogTitle
                id="preview-title"
                className="font-bold text-[#0c4a6e]"
              >
                پیش‌نمایش فاکتور
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-[#64748b]">
                برای ذخیره PDF، گزینه چاپ را انتخاب کنید.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="lg"
                onClick={onPrint}
                className="gap-2"
              >
                <Printer size={16} /> چاپ / PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label="بستن پیش‌نمایش"
                onClick={onClose}
              >
                <X size={17} />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-[#eaf1f7] p-3 sm:p-8 print:overflow-visible print:bg-white print:p-0">
            <div
              id="invoice-page"
              className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[7mm] shadow-xl max-sm:min-h-0 max-sm:w-full max-sm:p-4 print:min-h-0 print:w-full print:p-0 print:shadow-none"
            >
              <article id="invoice-print" className="text-right text-[#1e293b]">
                <header className="flex items-start justify-between gap-6 border-b border-[#cbd5e1] pb-5 max-sm:gap-3 max-sm:pb-4">
                  <div className="min-w-0 text-right">
                    <h1 className="text-2xl font-black tracking-tight text-[#0c4a6e] max-sm:text-xl">
                      {values.type || "فاکتور فروش"}
                    </h1>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-xs text-[#64748b]">شماره فاکتور</p>
                    <p className="mt-1 text-base font-bold tabular-nums text-[#0369a1] max-sm:text-sm">
                      {values.number}
                    </p>
                    <p className="mt-2 text-xs text-[#64748b]">
                      تاریخ صدور: {formatInvoiceDate(values.date)}
                    </p>
                  </div>
                </header>
                <div className="my-4 grid grid-cols-2 pb-2 max-sm:my-4 max-sm:pb-4">
                  <InvoicePartyCard title="فروشنده" party={values.seller} />
                  <InvoicePartyCard title="خریدار" party={values.buyer} />
                </div>
                <table className="w-full table-fixed text-right text-xs max-sm:text-[10px]">
                  <colgroup>
                    <col className="w-[48%] max-sm:w-[40%]" />
                    <col className="w-[12%] max-sm:w-[13%]" />
                    <col className="w-[20%] max-sm:w-[23.5%]" />
                    <col className="w-[20%] max-sm:w-[23.5%]" />
                  </colgroup>
                  <thead className="bg-[#0369A1] text-[#fafafa]">
                    <tr>
                      <th className="px-3 py-3 font-bold max-sm:px-1.5 max-sm:py-2">
                        شرح کالا / خدمات
                      </th>
                      <th className="px-2 py-3 text-center font-bold max-sm:px-1 max-sm:py-2">
                        تعداد
                      </th>
                      <th className="px-2 py-3 text-center font-bold max-sm:px-1 max-sm:py-2">
                        قیمت واحد ({values.currency})
                      </th>
                      <th className="px-3 py-3 text-center font-bold max-sm:px-1.5 max-sm:py-2">
                        مبلغ کل ({values.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.length === 0 ? (
                      <tr key="empty">
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-[#94a3b8]"
                        >
                          هنوز کالایی به فاکتور اضافه نشده است
                        </td>
                      </tr>
                    ) : (
                      visibleItems.map((item, index) => (
                        <tr
                          key={`${item.name}-${index}`}
                          className="break-inside-avoid border-b border-[#cbd5e1]"
                        >
                          <td className="px-3 py-4 align-top max-sm:px-1.5 max-sm:py-3">
                            <span className="font-bold text-[#1e3a5f]">
                              {item.name || "بدون عنوان"}
                            </span>
                            {item.description && (
                              <span className="mt-1 block leading-5 text-[#64748b]">
                                {item.description}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-4 text-center align-top tabular-nums max-sm:px-1 max-sm:py-3">
                            {formatMoney(Number(item.quantity) || 0)}
                          </td>
                          <td className="px-2 py-4 text-center align-top tabular-nums max-sm:px-1 max-sm:py-3">
                            {formatMoney(Number(item.unitPrice) || 0)}
                          </td>
                          <td className="px-3 py-4 text-center align-top font-bold tabular-nums max-sm:px-1.5 max-sm:py-3">
                            {formatMoney(
                              (Number(item.quantity) || 0) *
                                (Number(item.unitPrice) || 0),
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="mt-6 flex items-start justify-between gap-8 max-sm:mt-4 max-sm:flex-col max-sm:gap-4 print:grid print:grid-cols-2 print:gap-x-6">
                  <div className="w-[78mm] shrink-0 space-y-2 text-xs max-sm:w-full">
                    <div className="flex justify-between text-[#64748b]">
                      <span>جمع جزء</span>
                      <span className="tabular-nums">
                        {formatMoney(subtotal)} {values.currency}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#64748b]">
                        <span>تخفیف</span>
                        <span className="tabular-nums">
                          − {formatMoney(discount)} {values.currency}
                        </span>
                      </div>
                    )}
                    {values.taxEnabled && (
                      <div className="flex justify-between text-[#64748b]">
                        <span>مالیات بر ارزش افزوده (۱۰٪)</span>
                        <span className="tabular-nums">
                          {formatMoney(tax)} {values.currency}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t-2 border-[#40a4df] bg-[#eff8fd] px-3 py-3 font-extrabold text-[#0c4a6e]">
                      <span>مبلغ قابل پرداخت</span>
                      <span className="text-base tabular-nums">
                        {formatMoney(total)} {values.currency}
                      </span>
                    </div>
                  </div>
                  <div className="max-w-[90mm] flex-1 max-sm:max-w-none">
                    {values.notes && (
                      <section className="border-r-2 border-[#5bb5e9] pr-3 text-xs leading-5">
                        <h3 className="font-bold text-[#334155]">توضیحات</h3>
                        <p className="mt-1 whitespace-pre-wrap text-[#64748b]">
                          {values.notes}
                        </p>
                      </section>
                    )}
                    <div className="mt-5 flex min-h-20 items-center flex-col justify-between border-t border-dashed border-[#cbd5e1] text-[10px] text-[#64748b]">
                      {stampPreview && (
                        // biome-ignore lint/performance/noImgElement: it is a preview
                        <img
                          src={stampPreview}
                          alt="مهر یا امضای فروشنده"
                          className="max-h-[28mm] max-w-[30mm] object-contain mr-auto pl-4"
                        />
                      )}
                      <span className="text-left mr-auto pl-4">
                        مهر و امضای فروشنده
                      </span>
                    </div>
                  </div>
                </div>
                <footer className="mt-6 border-t border-[#cbd5e1] pt-4 text-center text-[10px] text-[#0369a1] max-sm:mt-4 max-sm:pt-3">
                  <p className="font-bold">از اعتماد شما سپاسگزاریم.</p>
                </footer>
              </article>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceItemsSection({
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

export function InvoiceForm() {
  const { register, control, setValue } = useForm<InvoiceValues>({
    defaultValues,
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [stampName, setStampName] = useState("");
  const [stampPreview, setStampPreview] = useState("");
  const [timeZone, setTimeZone] = useState<string>();
  const [sellerStorageReady, setSellerStorageReady] = useState(false);
  const values = useWatch({
    control,
    defaultValue: defaultValues,
  }) as InvoiceValues;

  useEffect(() => {
    startTransition(() => {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    });
  }, []);

  useEffect(
    () => () => {
      if (stampPreview) URL.revokeObjectURL(stampPreview);
    },
    [stampPreview],
  );

  useEffect(() => {
    const storageKey = "factorino-next-invoice-number";
    const next = Number(window.localStorage.getItem(storageKey) || "1001");
    setValue(
      "number",
      `۱۴۰۵-${new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(next)}`,
    );
    window.localStorage.setItem(storageKey, String(next + 1));
  }, [setValue]);

  useEffect(() => {
    try {
      const storedSeller = window.localStorage.getItem(
        "factorino-next-seller-profile",
      );
      if (storedSeller) {
        const parsedSeller = JSON.parse(storedSeller) as Partial<
          InvoiceValues["seller"]
        >;
        setValue("seller", { ...defaultValues.seller, ...parsedSeller });
      }
    } catch {
      setValue("seller", defaultValues.seller);
    }
    setSellerStorageReady(true);
  }, [setValue]);

  useEffect(() => {
    if (!sellerStorageReady) return;
    window.localStorage.setItem(
      "factorino-next-seller-profile",
      JSON.stringify(values.seller),
    );
  }, [sellerStorageReady, values.seller]);

  const totals = useMemo(() => {
    const subtotal =
      values.items?.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0,
      ) || 0;
    const discount = Math.min(
      subtotal,
      Math.max(0, Number(values.discount) || 0),
    );
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = values.taxEnabled ? taxableSubtotal * 0.1 : 0;
    return { subtotal, discount, tax, total: taxableSubtotal + tax };
  }, [values.items, values.discount, values.taxEnabled]);

  const printInvoice = () => {
    const sheet = document.getElementById("invoice-print");
    if (!sheet) return;

    const availableHeight = ((297 - 14) * 96) / 25.4;
    const scale = Math.min(1, availableHeight / sheet.scrollHeight);
    sheet.style.setProperty("--invoice-print-scale", String(scale));
    sheet.style.setProperty("--invoice-print-width", `${100 / scale}%`);

    window.addEventListener(
      "afterprint",
      () => {
        sheet.style.removeProperty("--invoice-print-scale");
        sheet.style.removeProperty("--invoice-print-width");
      },
      { once: true },
    );
    window.print();
  };

  return (
    <div id="invoice-app" className="min-h-screen bg-[#f0f9ff]">
      <header className="sticky top-0 z-20 border-b border-[#dbeafe] bg-[#f8fbfd]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-sm font-extrabold text-[#0c4a6e]"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#0369a1] text-[#bae6fd]">
              <FileText size={17} />
            </span>
            فاکتورینو
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#64748b] sm:inline">
              پیش‌نویس فاکتور
            </span>
            <span className="rounded-lg bg-[#e0f2fe] px-3 py-1.5 text-xs font-bold text-[#0369a1]">
              پیش‌نویس
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-8 sm:pt-10 sm:pb-28 lg:px-12 lg:pb-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#0369a1]"
            >
              <ArrowRight size={14} /> بازگشت به خانه
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0c4a6e] sm:text-3xl">
              ساخت فاکتور جدید
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              اطلاعات فاکتور را وارد کنید؛ پیش‌نمایش همیشه به‌روز است.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => setPreviewOpen(true)}
            className="hidden gap-2.5 lg:inline-flex"
          >
            <FileText size={17} /> پیش‌نمایش و چاپ PDF
          </Button>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]"
        >
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]">
                  <FileText size={17} />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[#0c4a6e]">
                    اطلاعات فاکتور
                  </h2>
                  <p className="mt-1 text-xs text-[#64748b]">
                    نوع، شماره و تاریخ فاکتور را مشخص کنید
                  </p>
                </div>
              </div>
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="نوع فاکتور"
                  name="type"
                  options={["فاکتور فروش", "فاکتور خدمات", "پیش‌فاکتور"]}
                  control={control}
                />
                <Field label="شماره فاکتور">
                  <Input
                    {...register("number")}
                    readOnly
                    className="bg-[#f8fbfd] font-semibold text-[#0369a1]"
                  />
                </Field>
                <Field label="تاریخ صدور">
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}
                      >
                        <PopoverTrigger
                          render={
                            <Button
                              ref={field.ref}
                              type="button"
                              variant="outline"
                              onBlur={field.onBlur}
                              className="w-full justify-between border-input bg-card px-3.5 text-right font-normal text-foreground hover:bg-card"
                            >
                              <span>{formatInvoiceDate(field.value)}</span>
                              <CalendarDays
                                size={16}
                                className="text-muted-foreground"
                              />
                            </Button>
                          }
                        />
                        <PopoverContent align="end" className="w-auto p-1">
                          <Calendar
                            mode="single"
                            selected={parseInvoiceDate(field.value)}
                            onSelect={(date) => {
                              if (date)
                                field.onChange(toInvoiceDateValue(date));
                              setCalendarOpen(false);
                            }}
                            locale={faIR}
                            dir="rtl"
                            timeZone={timeZone}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </Field>
                <SelectField
                  label="واحد پولی"
                  name="currency"
                  options={["تومان", "ریال"]}
                  control={control}
                />
              </div>
            </section>

            <PartyFields
              title="اطلاعات فروشنده"
              name="seller"
              register={register}
            />
            <PartyFields
              title="اطلاعات خریدار"
              name="buyer"
              register={register}
            />

            <InvoiceItemsSection
              control={control}
              register={register}
              items={values.items}
              subtotal={totals.subtotal}
              currency={values.currency}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-base font-extrabold text-[#0c4a6e]">
                    توضیحات
                  </h2>
                  <p className="mt-1 text-xs text-[#64748b]">
                    یادداشت یا شرایط پرداخت
                  </p>
                </div>
                <Textarea
                  {...register("notes")}
                  rows={5}
                  placeholder="توضیحات تکمیلی برای خریدار..."
                />
              </section>
              <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-base font-extrabold text-[#0c4a6e]">
                    مهر و امضا
                  </h2>
                  <p className="mt-1 text-xs text-[#64748b]">
                    تصویر مهر یا امضای خود را بارگذاری کنید
                  </p>
                </div>
                {/** biome-ignore lint/a11y/noLabelWithoutControl: no need it */}
                <label className="flex min-h-32.5 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#dbeafe] bg-[#f8fbfd] px-4 text-center transition hover:bg-[#f0f9ff]">
                  <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
                    <ImagePlus size={18} />
                  </span>
                  <span className="text-sm font-semibold text-[#475569]">
                    {stampName || "انتخاب تصویر مهر"}
                  </span>
                  <span className="mt-1.5 text-xs text-[#94a3b8]">
                    PNG یا JPG
                  </span>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setStampName(file?.name || "");
                      setStampPreview(file ? URL.createObjectURL(file) : "");
                    }}
                  />
                </label>
              </section>
            </div>
          </div>

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
                    {values.currency}
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
              {values.taxEnabled && (
                <div className="flex justify-between text-sm text-[#64748b]">
                  <span>مالیات (۱۰٪)</span>
                  <span className="font-semibold tabular-nums text-[#475569]">
                    {formatMoney(totals.tax)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-end justify-between py-5">
              <span className="text-sm font-bold text-[#334155]">
                قابل پرداخت
              </span>
              <span className="text-left">
                <strong className="block text-xl font-extrabold tabular-nums text-[#0369a1]">
                  {formatMoney(totals.total)}
                </strong>
                <span className="mt-1 block text-xs text-[#64748b]">
                  {values.currency}
                </span>
              </span>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={() => setPreviewOpen(true)}
              className="hidden w-full gap-2 lg:flex"
            >
              <FileText size={16} /> پیش‌نمایش فاکتور
            </Button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#64748b]">
              <Check size={12} className="mr-1 inline text-[#0284c7]" /> چاپ یا
              ذخیره مستقیم به صورت PDF
            </p>
          </aside>
        </form>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-[#dbeafe] bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(12,74,110,0.08)] backdrop-blur print:hidden lg:hidden">
        <div className="min-w-0">
          <span className="block text-xs text-[#64748b]">قابل پرداخت</span>
          <span className="mt-0.5 flex items-baseline gap-1.5 font-extrabold tabular-nums text-[#0369a1]">
            <span className="text-lg">{formatMoney(totals.total)}</span>
            <span className="text-xs font-semibold">{values.currency}</span>
          </span>
        </div>
        <Button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="shrink-0 gap-2"
        >
          <FileText size={16} /> پیش‌نمایش و چاپ
        </Button>
      </div>

      {previewOpen && (
        <InvoicePreview
          open={previewOpen}
          values={values}
          stampPreview={stampPreview}
          {...totals}
          onPrint={printInvoice}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
