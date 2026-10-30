"use client";

import { ArrowRight, Download, FileText, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function InvoiceTopBar() {
  return (
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
          <Link
            href="/invoices"
            className="text-sm font-semibold text-[#0369a1] hover:text-[#0c4a6e]"
          >
            فاکتورهای من
          </Link>
        </div>
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
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#0369a1]"
        >
          <ArrowRight size={14} /> بازگشت به خانه
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0c4a6e] sm:text-3xl">
          {isEditing ? "ویرایش فاکتور" : "ساخت فاکتور جدید"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          اطلاعات فاکتور را وارد کنید؛ پیش‌نمایش همیشه به‌روز است.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button type="button" size="lg" onClick={onPreview} className="gap-2.5">
          <FileText size={17} /> پیش‌نمایش و چاپ PDF
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onDownloadPdf}
          disabled={downloadDisabled}
          className="gap-2.5"
        >
          {downloadingPdf ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Download size={17} />
          )}
          {downloadingPdf ? "در حال ساخت PDF…" : "دانلود PDF"}
        </Button>
      </div>
    </div>
  );
}
