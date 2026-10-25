"use client";

import {
  ArrowRight,
  Ellipsis,
  FilePlus2,
  FileText,
  Pencil,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteInvoice, listInvoices } from "@/lib/invoice-storage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { InvoiceRecord } from "@/types/invoice";

const numberFormat = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
const formatMoney = (value: number) => numberFormat.format(Math.round(value));
const toLatinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .toLocaleLowerCase("fa-IR");

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function InvoicesList() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<InvoiceRecord[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    listInvoices()
      .then(setRows)
      .catch(() => setStorageError("بارگذاری فاکتورها در این مرورگر انجام نشد."))
      .finally(() => setLoading(false));
  }, []);
  const filteredInvoices = useMemo(() => {
    const needle = toLatinDigits(query.trim());
    if (!needle) return rows;
    return rows.filter((invoice) =>
      toLatinDigits(
        `${invoice.number} ${invoice.buyerName} ${invoice.type} ${invoice.date} ${invoice.currency}`,
      ).includes(needle),
    );
  }, [rows, query]);
  const totals = rows.reduce(
    (summary, invoice) => {
      summary[invoice.currency] += invoice.total;
      return summary;
    },
    { تومان: 0, ریال: 0 },
  );

  const handleDelete = async (invoice: InvoiceRecord) => {
    if (
      !window.confirm(
        `فاکتور ${invoice.number} حذف شود؟ این کار قابل بازگشت نیست.`,
      )
    )
      return;
    setDeletingId(invoice.id);
    try {
      await deleteInvoice(invoice.id);
      setRows((current) => current.filter((row) => row.id !== invoice.id));
    } catch {
      setStorageError("حذف فاکتور انجام نشد. دوباره تلاش کنید.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f0f9ff]">
      <header className="border-b border-[#dbeafe] bg-white">
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
          <Link
            href="/invoice"
            className="text-sm font-semibold text-[#0369a1] hover:text-[#0c4a6e]"
          >
            ساخت فاکتور
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/invoice"
              className="mb-5 inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#0369a1]"
            >
              <ArrowRight size={14} /> بازگشت به ساخت فاکتور
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0c4a6e]">
              فاکتورهای من
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              فاکتورهای ذخیره‌شده را پیدا و مرور کنید.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/invoice" />}
            size="lg"
            className="gap-2"
          >
            <FilePlus2 size={17} /> فاکتور جدید
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <section className="flex items-center gap-4 rounded-2xl border border-[#dbeafe] bg-white p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
              <FileText size={19} />
            </span>
            <div>
              <p className="text-xs font-medium text-[#64748b]">
                تعداد فاکتورها
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#0c4a6e]">
                {formatMoney(rows.length)}
              </p>
            </div>
          </section>
          <section className="flex items-center gap-4 rounded-2xl border border-[#dbeafe] bg-white p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
              <Wallet size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#64748b]">
                جمع مبالغ ثبت‌شده
              </p>
              <p className="mt-1 text-sm font-extrabold leading-6 text-[#0c4a6e]">
                {totals.تومان > 0 && (
                  <span>{formatMoney(totals.تومان)} تومان</span>
                )}
                {totals.تومان > 0 && totals.ریال > 0 && (
                  <span className="px-2 text-[#94a3b8]">|</span>
                )}
                {totals.ریال > 0 && (
                  <span>{formatMoney(totals.ریال)} ریال</span>
                )}
                {totals.تومان === 0 && totals.ریال === 0 && "—"}
              </p>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#dbeafe] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#e0f2fe] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-extrabold text-[#0c4a6e]">همه فاکتورها</h2>
              <p className="mt-1 text-xs text-[#64748b]">
                {formatMoney(filteredInvoices.length)} مورد
              </p>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جست‌وجوی شماره، خریدار یا نوع فاکتور"
                aria-label="جست‌وجوی فاکتورها"
                className="pr-10"
              />
            </div>
          </div>

          {storageError && (
            <p role="alert" className="mx-5 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {storageError}
            </p>
          )}

          {loading ? (
            <p className="px-5 py-16 text-center text-sm text-[#64748b]">
              در حال بارگذاری فاکتورها…
            </p>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f0f9ff] text-[#0284c7]">
                <Search size={20} />
              </span>
              <h3 className="mt-4 font-bold text-[#0c4a6e]">
                {rows.length ? "فاکتوری پیدا نشد" : "هنوز فاکتوری ندارید"}
              </h3>
              <p className="mt-2 text-sm text-[#64748b]">
                {rows.length
                  ? "عبارت دیگری را جست‌وجو کنید."
                  : "پس از ساخت و ذخیره، فاکتورهای شما اینجا نمایش داده می‌شوند."}
              </p>
              {!rows.length && (
                <Button
                  nativeButton={false}
                  render={<Link href="/invoice" />}
                  className="mt-5 gap-2"
                >
                  <FilePlus2 size={16} /> ساخت اولین فاکتور
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.1fr_1.3fr_1fr_1fr_1.2fr_auto] gap-4 bg-[#f8fbfd] px-6 py-3 text-xs font-semibold text-[#64748b] md:grid">
                <span>شماره فاکتور</span>
                <span>خریدار</span>
                <span>نوع</span>
                <span>تاریخ</span>
                <span className="text-left">مبلغ کل</span>
                <span />
              </div>
              <ul className="divide-y divide-[#e0f2fe]">
                {filteredInvoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[1.1fr_1.3fr_1fr_1fr_1.2fr_auto] md:items-center md:gap-4 md:px-6"
                  >
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-[11px] text-[#94a3b8] md:hidden">
                        شماره فاکتور
                      </span>
                      <span className="font-bold text-[#0369a1]">
                        {invoice.number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-[11px] text-[#94a3b8] md:hidden">
                        خریدار
                      </span>
                      <span className="text-sm font-semibold text-[#334155]">
                        {invoice.buyerName || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-[11px] text-[#94a3b8] md:hidden">
                        نوع
                      </span>
                      <span className="inline-flex w-fit rounded-full bg-[#f0f9ff] px-2.5 py-1 text-xs font-semibold text-[#0369a1]">
                        {invoice.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-[11px] text-[#94a3b8] md:hidden">
                        تاریخ
                      </span>
                      <span className="text-sm text-[#64748b]">
                        {formatDate(invoice.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block md:text-left">
                      <span className="text-[11px] text-[#94a3b8] md:hidden">
                        مبلغ کل
                      </span>
                      <span className="text-sm font-extrabold tabular-nums text-[#0c4a6e]">
                        {formatMoney(invoice.total)}{" "}
                        <span className="text-xs font-medium text-[#64748b]">
                          {invoice.currency}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label={`عملیات فاکتور ${invoice.number}`}
                              className="flex size-9 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f0f9ff] hover:text-[#0369a1] focus-visible:outline-2 focus-visible:outline-[#0369a1]"
                            />
                          }
                        >
                          <Ellipsis size={19} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            render={<Link href={`/invoice?id=${invoice.id}`} />}
                          >
                            <Pencil /> ویرایش فاکتور
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={deletingId === invoice.id}
                            onClick={() => void handleDelete(invoice)}
                          >
                            <Trash2 />{" "}
                            {deletingId === invoice.id
                              ? "در حال حذف..."
                              : "حذف فاکتور"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
