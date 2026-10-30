"use client";

import { ChevronDown, ReceiptText } from "lucide-react";
import type { ReactNode } from "react";
import {
  type Control,
  Controller,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceValues } from "@/types/invoice";

export function Field({
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

export function SelectField({
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

export function PartyFields({
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
  const primaryFields = fields.slice(0, 2);
  const additionalFields = fields.slice(2);

  const renderFields = (items: (typeof fields)[number][]) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-2">
      {items.map((field) => (
        <div
          key={field.key}
          className={
            field.key === "nationalId" || field.key === "economicCode"
              ? "col-span-1"
              : "col-span-2 sm:col-span-1"
          }
        >
          <Field
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
        </div>
      ))}
    </div>
  );

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
      {renderFields(primaryFields)}
      <details className="group mt-5">
        <summary className="flex cursor-pointer select-none list-none items-center gap-2 rounded-lg py-1 text-sm font-bold text-[#0369a1] outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] [&::-webkit-details-marker]:hidden">
          <span>مشخصات بیشتر</span>
          <ChevronDown
            size={17}
            aria-hidden="true"
            className="transition-transform group-open:rotate-180 text-[#0369a1]"
          />
        </summary>
        <div className="pt-4">{renderFields(additionalFields)}</div>
      </details>
    </section>
  );
}

export function InvoicePartyCard({
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
