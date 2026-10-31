"use client";

import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { type Control, Controller, useFormContext } from "react-hook-form";
import {
  SectionBody,
  SectionCard,
  SectionHeader,
} from "@/components/invoice/section-card";
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
  error,
  children,
  className,
  labelClassName,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label className="flex-col items-stretch gap-1.5">
        <span
          className={cn(
            "text-[13px] font-medium leading-5 text-muted-foreground",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="ms-1 text-destructive">*</span>}
        </span>
        {children}
      </Label>
      {error && <p className="text-xs leading-5 text-destructive">{error}</p>}
    </div>
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
    </Field>
  );
}

export function PartyFields({
  title,
  name,
}: {
  title: string;
  name: "seller" | "buyer";
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceValues>();
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
    <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
      {items.map((field) => {
        const isName = field.key === "name";
        const nameError = isName ? errors[name]?.name?.message : undefined;
        return (
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
              error={nameError}
            >
              <Input
                {...register(`${name}.${field.key}` as const, {
                  required:
                    isName && name === "buyer"
                      ? "نام خریدار را وارد کنید."
                      : undefined,
                })}
                type={"type" in field ? field.type : "text"}
                aria-invalid={Boolean(nameError)}
                dir={
                  field.key === "address" || field.key === "name"
                    ? "rtl"
                    : "auto"
                }
              />
            </Field>
          </div>
        );
      })}
    </div>
  );

  return (
    <SectionCard>
      <SectionHeader
        title={title}
        description={
          name === "seller"
            ? "روی فاکتور چاپ می‌شود و در این مرورگر ذخیره می‌شود"
            : "روی فاکتور چاپ می‌شود"
        }
      />
      <SectionBody>
        {renderFields(primaryFields)}
        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer select-none list-none items-center gap-1 rounded-md py-1 text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span>مشخصات بیشتر</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="text-primary transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="pt-4">{renderFields(additionalFields)}</div>
        </details>
      </SectionBody>
    </SectionCard>
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
    <section className="min-w-0 rounded-lg border border-[#cbd5e1] p-3.5 print:break-inside-avoid">
      <h3 className="text-[10px] font-bold text-[#0369a1]">{title}</h3>
      <p className="mt-1.5 text-sm font-extrabold text-[#0c4a6e]">
        {party.name || "—"}
      </p>
      {details.length > 0 && (
        <dl className="mt-2.5 space-y-1 text-[11px] leading-5">
          {details.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="shrink-0 text-[#64748b]">{label}:</dt>
              <dd className="min-w-0 wrap-break-word text-[#334155]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
