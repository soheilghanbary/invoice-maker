"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEdgeStore } from "@/lib/edgestore";

type StampUploadFieldProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onPendingConfirmationChange: (url: string) => void;
  onUploadingChange: (uploading: boolean) => void;
};

export function StampUploadField({
  value,
  disabled,
  onChange,
  onPendingConfirmationChange,
  onUploadingChange,
}: StampUploadFieldProps) {
  const { edgestore } = useEdgeStore();
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("فقط تصویر PNG، JPG یا WebP قابل بارگذاری است.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
      return;
    }

    setFileName(file.name);
    setError("");
    setProgress(0);
    setUploading(true);
    onUploadingChange(true);
    try {
      const uploaded = await edgestore.businessImages.upload({
        file,
        options: { temporary: true },
        onProgressChange: setProgress,
      });
      onChange(uploaded.url);
      onPendingConfirmationChange(uploaded.url);
      setProgress(100);
    } catch {
      setFileName("");
      setError(
        "بارگذاری تصویر انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید.",
      );
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  };

  const removeStamp = () => {
    onChange("");
    onPendingConfirmationChange("");
    setFileName("");
    setProgress(0);
    setError("");
  };

  return (
    <section className="rounded-2xl border border-[#dbeafe] bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-extrabold text-[#0c4a6e]">مهر و امضا</h2>
        <p className="mt-1 text-xs text-[#64748b]">
          تصویر پس از ذخیره‌ی فاکتور به آن پیوست می‌شود
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-[#bfdbeb] bg-[#f8fbfd] p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-[#e2edf5]">
            {value ? (
              // biome-ignore lint/performance/noImgElement: EdgeStore URL is a user-uploaded preview
              <img
                src={value}
                alt="پیش‌نمایش مهر یا امضا"
                className="size-full object-contain p-1"
              />
            ) : (
              <ImagePlus size={22} className="text-[#0284c7]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#334155]">
              {fileName || (value ? "مهر ذخیره‌شده" : "تصویر مهر یا امضا")}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#64748b]">
              PNG، JPG یا WebP · حداکثر ۵ مگابایت
            </p>
            <label
              htmlFor="invoice-stamp-upload"
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[#0369a1] hover:text-[#0c4a6e]"
            >
              {value ? "جایگزینی تصویر" : "انتخاب تصویر"}
            </label>
          </div>
          {value && !uploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="حذف مهر از فاکتور"
              onClick={removeStamp}
              disabled={disabled}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        <Input
          id="invoice-stamp-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={disabled || uploading}
          onChange={handleUpload}
        />
        {uploading && (
          <div className="mt-4" aria-live="polite">
            <div className="mb-2 flex justify-between text-xs font-medium text-[#64748b]">
              <span>در حال بارگذاری تصویر...</span>
              <span>{Math.round(progress)}٪</span>
            </div>
            <div
              role="progressbar"
              aria-label="پیشرفت بارگذاری مهر"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="h-2 overflow-hidden rounded-full bg-[#e0f2fe]"
            >
              <div
                className="h-full rounded-full bg-[#0284c7] transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-xs leading-5 text-red-700">
            {error}
          </p>
        )}
        {value && !uploading && !error && (
          <p className="mt-3 text-xs font-medium text-emerald-700">
            {fileName
              ? "تصویر بارگذاری شد و پس از ذخیره‌ی فاکتور نگه‌داری می‌شود."
              : "مهر همراه این فاکتور ذخیره شده است."}
          </p>
        )}
      </div>
    </section>
  );
}
