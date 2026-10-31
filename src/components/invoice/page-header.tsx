"use client";

import { ArrowRight, Download, FileText, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function InvoiceTopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-sm font-bold text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText size={16} />
          </span>
          فاکتورینو
        </Link>
        <Link
          href="/invoices"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          فاکتورهای من
        </Link>
      </div>
    </header>
  );
}

export function InvoicePageIntro({
  isEditing,
  onPreview,
  onDownloadPdf,
  downloadingPdf,
  downloadDisabled,
}: {
  isEditing: boolean;
  onPreview: () => void;
  onDownloadPdf: () => void;
  downloadingPdf: boolean;
  downloadDisabled: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight size={14} /> بازگشت به خانه
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEditing ? "ویرایش فاکتور" : "ساخت فاکتور جدید"}
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          اطلاعات فاکتور را وارد کنید؛ پیش‌نمایش همیشه به‌روز است.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPreview}
          className="gap-2"
        >
          <FileText size={16} /> پیش‌نمایش و چاپ PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onDownloadPdf}
          disabled={downloadDisabled}
          className="gap-2"
        >
          {downloadingPdf ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {downloadingPdf ? "در حال ساخت PDF…" : "دانلود PDF"}
        </Button>
      </div>
    </div>
  );
}
