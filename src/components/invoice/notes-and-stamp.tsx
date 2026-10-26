"use client";

import type { UseFormRegister } from "react-hook-form";
import { StampUploadField } from "@/components/invoice/stamp-upload-field";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceValues } from "@/types/invoice";

export function InvoiceNotesAndStamp({
  register,
  stampUrl,
  disabled,
  reusable,
  onStampChange,
  onPendingStampChange,
  onStampUploadingChange,
}: {
  register: UseFormRegister<InvoiceValues>;
  stampUrl: string;
  disabled: boolean;
  reusable?: boolean;
  onStampChange: (url: string) => void;
  onPendingStampChange: (url: string) => void;
  onStampUploadingChange: (uploading: boolean) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-extrabold text-[#0c4a6e]">توضیحات</h2>
          <p className="mt-1 text-xs text-[#64748b]">یادداشت یا شرایط پرداخت</p>
        </div>
        <Textarea
          {...register("notes")}
          rows={5}
          placeholder="توضیحات تکمیلی برای خریدار..."
        />
      </section>
      <StampUploadField
        value={stampUrl}
        disabled={disabled}
        reusable={reusable}
        onChange={onStampChange}
        onPendingConfirmationChange={onPendingStampChange}
        onUploadingChange={onStampUploadingChange}
      />
    </div>
  );
}
