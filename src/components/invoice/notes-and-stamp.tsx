"use client";

import { useFormContext } from "react-hook-form";
import {
  SectionBody,
  SectionCard,
  SectionHeader,
} from "@/components/invoice/section-card";
import { StampUploadField } from "@/components/invoice/stamp-upload-field";
import { Textarea } from "@/components/ui/textarea";

export function InvoiceNotesAndStamp({
  stampUrl,
  disabled,
  reusable,
  onStampChange,
  onPendingStampChange,
  onStampUploadingChange,
}: {
  stampUrl: string;
  disabled: boolean;
  reusable?: boolean;
  onStampChange: (url: string) => void;
  onPendingStampChange: (url: string) => void;
  onStampUploadingChange: (uploading: boolean) => void;
}) {
  const { register } = useFormContext();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionCard>
        <SectionHeader title="توضیحات" description="یادداشت یا شرایط پرداخت" />
        <SectionBody>
          <Textarea
            {...register("notes")}
            rows={5}
            placeholder="توضیحات تکمیلی برای خریدار..."
          />
        </SectionBody>
      </SectionCard>
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
