"use client";

import { Printer, X } from "lucide-react";
import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { InvoicePartyCard } from "@/components/invoice/fields";
import {
  calculateTotals,
  formatCount,
  formatInvoiceDate,
  formatMoney,
} from "@/components/invoice/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InvoiceValues } from "@/types/invoice";

export function InvoicePreview({
  open,
  onPrint,
  onClose,
}: {
  open: boolean;
  onPrint: () => void;
  onClose: () => void;
}) {
  const { control } = useFormContext<InvoiceValues>();
  const values = useWatch({ control }) as InvoiceValues;
  const stampPreview = values.stampPreview;
  const { subtotal, discount, tax, total } = calculateTotals(
    values.items,
    values.discount,
    values.taxEnabled,
  );
  const visibleItems = values.items.filter(
    (item) =>
      item.name.trim() || item.description.trim() || Number(item.unitPrice) > 0,
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        id="invoice-preview-overlay"
        showCloseButton={false}
        className="fixed! inset-0! left-0! top-0! z-50! flex! w-full! max-w-none! translate-x-0! translate-y-0! flex-col! items-center! justify-center! gap-0! rounded-none! bg-transparent! p-3! ring-0! sm:p-6! sm:max-w-none! print:static! print:!block! print:!h-auto! print:!min-h-0! print:!overflow-visible! print:!p-0!"
      >
        <section className="my-auto flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl print:my-0! print:block! print:h-auto! print:max-h-none! print:max-w-none! print:overflow-visible! print:rounded-none! print:shadow-none!">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5 print:hidden">
            <div>
              <DialogTitle
                id="preview-title"
                className="text-sm font-bold text-foreground"
              >
                پیش‌نمایش فاکتور
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                برای ذخیره PDF، گزینه چاپ را انتخاب کنید.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={onPrint} className="gap-2">
                <Printer size={16} /> چاپ / PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="بستن پیش‌نمایش"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-muted/60 p-3 sm:p-8 print:overflow-visible print:bg-white print:p-0">
            <div
              id="invoice-page"
              className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[7mm] shadow-xl max-sm:min-h-0 max-sm:w-full max-sm:p-4 print:min-h-0 print:w-full print:p-0 print:shadow-none"
            >
              <article id="invoice-print" className="text-right text-[#1e293b]">
                <header className="flex items-start justify-between gap-6 border-b-2 border-[#0c4a6e]/10 pb-5 max-sm:gap-3 max-sm:pb-4">
                  <div className="min-w-0 text-right">
                    <h1 className="text-[26px] leading-9 font-black tracking-tight text-[#0c4a6e] max-sm:text-xl">
                      {values.type || "فاکتور فروش"}
                    </h1>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-[10px] text-[#64748b]">شماره فاکتور</p>
                    <p className="mt-0.5 text-lg font-extrabold tabular-nums text-[#0369a1] max-sm:text-sm">
                      {values.number || "—"}
                    </p>
                    <p className="mt-1.5 text-[11px] text-[#64748b]">
                      تاریخ صدور:{" "}
                      <span className="font-semibold tabular-nums text-[#334155]">
                        {formatInvoiceDate(values.date)}
                      </span>
                    </p>
                  </div>
                </header>

                <div className="my-5 grid grid-cols-2 gap-3 max-sm:my-4 max-sm:gap-2">
                  <InvoicePartyCard title="فروشنده" party={values.seller} />
                  <InvoicePartyCard title="خریدار" party={values.buyer} />
                </div>

                <table className="w-full table-fixed text-right text-xs max-sm:text-[10px]">
                  <colgroup>
                    <col className="w-[7%] max-sm:w-[9%]" />
                    <col className="w-[41%] max-sm:w-[33%]" />
                    <col className="w-[12%] max-sm:w-[13%]" />
                    <col className="w-[20%] max-sm:w-[22.5%]" />
                    <col className="w-[20%] max-sm:w-[22.5%]" />
                  </colgroup>
                  <thead className="bg-[#0369a1] text-white">
                    <tr>
                      <th className="px-1 py-2.5 text-center font-bold max-sm:px-0.5 max-sm:py-2">
                        ردیف
                      </th>
                      <th className="px-2.5 py-2.5 font-bold max-sm:px-1 max-sm:py-2">
                        شرح کالا / خدمات
                      </th>
                      <th className="px-1.5 py-2.5 text-center font-bold max-sm:px-0.5 max-sm:py-2">
                        تعداد
                      </th>
                      <th className="px-1.5 py-2.5 text-center font-bold max-sm:px-0.5 max-sm:py-2">
                        قیمت واحد ({values.currency})
                      </th>
                      <th className="px-2.5 py-2.5 text-center font-bold max-sm:px-1 max-sm:py-2">
                        مبلغ کل ({values.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.length === 0 ? (
                      <tr key="empty">
                        <td
                          colSpan={5}
                          className="px-3 py-8 text-center text-[#94a3b8]"
                        >
                          هنوز کالایی به فاکتور اضافه نشده است
                        </td>
                      </tr>
                    ) : (
                      visibleItems.map((item, index) => (
                        <tr
                          key={`${item.name}-${index}`}
                          className="break-inside-avoid border-b border-[#e2e8f0]"
                        >
                          <td className="px-1 py-3.5 text-center align-top tabular-nums text-[#94a3b8] max-sm:px-0.5 max-sm:py-3">
                            {formatCount(index + 1)}
                          </td>
                          <td className="px-2.5 py-3.5 align-top max-sm:px-1 max-sm:py-3">
                            <span className="font-bold text-[#0c4a6e]">
                              {item.name || "بدون عنوان"}
                            </span>
                            {item.description && (
                              <span className="mt-1 block leading-5 text-[#64748b]">
                                {item.description}
                              </span>
                            )}
                          </td>
                          <td className="px-1.5 py-3.5 text-center align-top tabular-nums max-sm:px-0.5 max-sm:py-3">
                            {formatMoney(Number(item.quantity) || 0)}
                          </td>
                          <td className="px-1.5 py-3.5 text-center align-top tabular-nums max-sm:px-0.5 max-sm:py-3">
                            {formatMoney(Number(item.unitPrice) || 0)}
                          </td>
                          <td className="px-2.5 py-3.5 text-center align-top font-bold tabular-nums max-sm:px-1 max-sm:py-3">
                            {formatMoney(
                              (Number(item.quantity) || 0) *
                                (Number(item.unitPrice) || 0),
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="mt-6 flex items-start justify-between gap-8 max-sm:mt-4 max-sm:flex-col max-sm:gap-4 print:grid print:grid-cols-2 print:gap-x-6">
                  <div className="w-[78mm] shrink-0 text-xs max-sm:w-full">
                    <div className="flex justify-between border-b border-[#e2e8f0] py-2">
                      <span className="text-[#64748b]">جمع جزء</span>
                      <span className="font-semibold tabular-nums text-[#334155]">
                        {formatMoney(subtotal)} {values.currency}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between border-b border-[#e2e8f0] py-2">
                        <span className="text-[#64748b]">تخفیف</span>
                        <span className="font-semibold tabular-nums text-[#334155]">
                          − {formatMoney(discount)} {values.currency}
                        </span>
                      </div>
                    )}
                    {values.taxEnabled && (
                      <div className="flex justify-between border-b border-[#e2e8f0] py-2">
                        <span className="text-[#64748b]">
                          مالیات بر ارزش افزوده (۱۰٪)
                        </span>
                        <span className="font-semibold tabular-nums text-[#334155]">
                          {formatMoney(tax)} {values.currency}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between rounded-md bg-[#0369a1] px-3 py-2.5 text-white">
                      <span className="text-xs font-bold">
                        مبلغ قابل پرداخت
                      </span>
                      <span className="text-base font-extrabold tabular-nums">
                        {formatMoney(total)} {values.currency}
                      </span>
                    </div>
                  </div>
                  <div className="max-w-[90mm] flex-1 max-sm:max-w-none">
                    {values.notes && (
                      <section className="rounded-lg border border-[#cbd5e1] p-3 text-xs leading-5 print:break-inside-avoid">
                        <h3 className="text-[11px] font-bold text-[#0c4a6e]">
                          توضیحات
                        </h3>
                        <p className="mt-1 whitespace-pre-wrap text-[#64748b]">
                          {values.notes}
                        </p>
                      </section>
                    )}
                    <div
                      className={
                        values.notes
                          ? "mt-3 flex min-h-[30mm] flex-col items-center justify-end rounded-lg border border-dashed border-[#94a3b8] p-3 text-[10px] text-[#64748b]"
                          : "flex min-h-[30mm] flex-col items-center justify-end rounded-lg border border-dashed border-[#94a3b8] p-3 text-[10px] text-[#64748b]"
                      }
                    >
                      {stampPreview && (
                        <Image
                          src={stampPreview}
                          alt="مهر یا امضای فروشنده"
                          className="mb-2 size-32 object-contain"
                          width={40}
                          height={40}
                          unoptimized
                        />
                      )}
                      <span>مهر و امضای فروشنده</span>
                    </div>
                  </div>
                </div>

                <footer className="mt-6 border-t border-[#e2e8f0] pt-3 text-center text-[10px] text-[#64748b] max-sm:mt-4">
                  <p>از اعتماد شما سپاسگزاریم.</p>
                </footer>
              </article>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
