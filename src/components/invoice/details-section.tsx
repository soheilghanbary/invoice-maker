"use client";

import { faIR } from "@daypicker/persian";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, SelectField } from "@/components/invoice/fields";
import {
  formatInvoiceDate,
  parseInvoiceDate,
  toInvoiceDateValue,
} from "@/components/invoice/model";
import {
  SectionBody,
  SectionCard,
  SectionHeader,
} from "@/components/invoice/section-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { InvoiceValues } from "@/types/invoice";

export function InvoiceDetailsSection({ timeZone }: { timeZone?: string }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<InvoiceValues>();

  return (
    <SectionCard>
      <SectionHeader
        title="اطلاعات فاکتور"
        description="نوع، شماره و تاریخ فاکتور را مشخص کنید"
      />
      <SectionBody>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          <SelectField
            label="نوع فاکتور"
            name="type"
            options={["فاکتور فروش", "فاکتور خدمات", "پیش فاکتور"]}
            control={control}
          />
          <Field label="شماره فاکتور" error={errors.number?.message}>
            <Input
              {...register("number", {
                required: "شماره فاکتور را وارد کنید.",
              })}
              readOnly
              aria-invalid={Boolean(errors.number)}
              className="bg-muted font-semibold tabular-nums text-foreground"
            />
          </Field>
          <Field label="تاریخ صدور" error={errors.date?.message}>
            <Controller
              control={control}
              name="date"
              rules={{ required: "تاریخ صدور را انتخاب کنید." }}
              render={({ field, fieldState }) => (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        ref={field.ref}
                        type="button"
                        variant="outline"
                        onBlur={field.onBlur}
                        aria-invalid={Boolean(fieldState.error)}
                        className="w-full justify-between border-input bg-card px-3 text-right font-normal text-foreground"
                      >
                        <span>{formatInvoiceDate(field.value)}</span>
                        <CalendarDays
                          size={16}
                          className="text-muted-foreground"
                        />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-1">
                    <Calendar
                      mode="single"
                      selected={parseInvoiceDate(field.value)}
                      onSelect={(date) => {
                        if (!date) return;
                        field.onChange(toInvoiceDateValue(date));
                        setCalendarOpen(false);
                      }}
                      locale={faIR}
                      dir="rtl"
                      timeZone={timeZone}
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
      </SectionBody>
    </SectionCard>
  );
}
