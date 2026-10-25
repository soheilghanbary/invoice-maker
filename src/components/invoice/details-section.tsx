"use client";

import { faIR } from "@daypicker/persian";
import { CalendarDays, FileText } from "lucide-react";
import { useState } from "react";
import {
  type Control,
  Controller,
  type UseFormRegister,
} from "react-hook-form";
import { Field, SelectField } from "@/components/invoice/fields";
import {
  formatInvoiceDate,
  parseInvoiceDate,
  toInvoiceDateValue,
} from "@/components/invoice/model";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { InvoiceValues } from "@/types/invoice";

export function InvoiceDetailsSection({
  control,
  register,
  timeZone,
}: {
  control: Control<InvoiceValues>;
  register: UseFormRegister<InvoiceValues>;
  timeZone?: string;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
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
          options={["فاکتور فروش", "فاکتور خدمات", "پیش فاکتور"]}
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
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                      if (date) field.onChange(toInvoiceDateValue(date));
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
  );
}
