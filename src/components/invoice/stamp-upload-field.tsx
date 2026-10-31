"use client";

import {
  BadgeCheck,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import {
  SectionBody,
  SectionCard,
  SectionHeader,
} from "@/components/invoice/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEdgeStore } from "@/lib/edgestore";

type StampUploadFieldProps = {
  value: string;
  disabled: boolean;
  reusable?: boolean;
  onChange: (value: string) => void;
  onPendingConfirmationChange: (url: string) => void;
  onUploadingChange: (uploading: boolean) => void;
};

export function StampUploadField({
  value,
  disabled,
  reusable = false,
  onChange,
  onPendingConfirmationChange,
  onUploadingChange,
}: StampUploadFieldProps) {
  const { edgestore } = useEdgeStore();
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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
    <SectionCard>
      <SectionHeader
        title="مهر و امضا"
        description="تصویر مهر را به نسخه‌ی چاپی فاکتور اضافه کنید."
      />
      <SectionBody className="flex flex-col">
        {value ? (
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background p-3 sm:size-24">
              {/* biome-ignore lint/performance/noImgElement: EdgeStore URL is a user-uploaded preview */}
              <img
                src={value}
                alt="پیش‌نمایش مهر یا امضا"
                className="size-full object-contain"
                draggable={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {fileName || "تصویر مهر آماده است"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {uploading
                  ? "تصویر جدید در حال بارگذاری است."
                  : reusable
                    ? "برای فاکتورهای جدید هم استفاده می‌شود."
                    : "این تصویر فقط به همین فاکتور اضافه می‌شود."}
              </p>
              {!uploading && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInput.current?.click()}
                    disabled={disabled}
                    className="gap-1.5"
                  >
                    <Upload size={14} /> جایگزینی تصویر
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeStamp}
                    disabled={disabled}
                    className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={14} /> حذف تصویر
                  </Button>
                </div>
              )}
            </div>
            {!uploading && (
              <BadgeCheck
                size={18}
                aria-label="تصویر مهر انتخاب شده"
                className="hidden shrink-0 text-emerald-600 sm:block"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-3 py-6 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ImagePlus size={20} />
            </span>
            <p className="text-sm font-semibold text-foreground">
              هنوز تصویری انتخاب نشده
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              فایل مهر یا امضای خود را بارگذاری کنید.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInput.current?.click()}
              disabled={disabled || uploading}
              className="mt-4 gap-2"
            >
              {uploading ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              {uploading ? "در حال بارگذاری…" : "انتخاب تصویر"}
            </Button>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              PNG، JPG یا WebP · حداکثر ۵ مگابایت
            </p>
          </div>
        )}
        <Input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="انتخاب تصویر مهر یا امضا"
          className="hidden"
          disabled={disabled || uploading}
          onChange={handleUpload}
        />
        {uploading && (
          <div className="mt-4 border-t border-border pt-4" aria-live="polite">
            <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
              <span>در حال بارگذاری تصویر…</span>
              <span className="tabular-nums">{Math.round(progress)}٪</span>
            </div>
            <div
              role="progressbar"
              aria-label="پیشرفت بارگذاری مهر"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-5 text-destructive"
          >
            {error}
          </p>
        )}
      </SectionBody>
    </SectionCard>
  );
}
