"use client";

import { cn } from "cn";
import { Printer, X } from "lucide-react";
import Image from "next/image";
import { type Control, useWatch } from "react-hook-form";
import { InvoicePartyCard } from "@/components/invoice/fields";
import {
  calculateTotals,
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
  control,
  onPrint,
  onClose,
}: {
  open: boolean;
  control: Control<InvoiceValues>;
  onPrint: () => void;
  onClose: () => void;
}) {
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
        <section className="my-auto flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print:my-0! print:block! print:h-auto! print:max-h-none! print:max-w-none! print:overflow-visible! print:rounded-none! print:shadow-none!">
          <div className="flex shrink-0 items-center justify-between border-b border-[#e0f2fe] px-5 py-4 print:hidden">
            <div>
              <DialogTitle
                id="preview-title"
                className="font-bold text-[#0c4a6e]"
              >
                پیش‌نمایش فاکتور
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-[#64748b]">
                برای ذخیره PDF، گزینه چاپ را انتخاب کنید.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="lg"
                onClick={onPrint}
                className="gap-2"
              >
                <Printer size={16} /> چاپ / PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label="بستن پیش‌نمایش"
                onClick={onClose}
              >
                <X size={17} />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-[#eaf1f7] p-3 sm:p-8 print:overflow-visible print:bg-white print:p-0">
            <div
              id="invoice-page"
              className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[7mm] shadow-xl max-sm:min-h-0 max-sm:w-full max-sm:p-4 print:min-h-0 print:w-full print:p-0 print:shadow-none"
            >
              <article id="invoice-print" className="text-right text-[#1e293b]">
                <header className="flex items-start justify-between gap-6 border-b border-[#cbd5e1] pb-5 max-sm:gap-3 max-sm:pb-4">
                  <div className="min-w-0 text-right">
                    <h1 className="text-2xl font-black tracking-tight text-[#0c4a6e] max-sm:text-xl">
                      {values.type || "فاکتور فروش"}
                    </h1>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-xs text-[#64748b]">شماره فاکتور</p>
                    <p className="mt-1 text-base font-bold tabular-nums text-[#0369a1] max-sm:text-sm">
                      {values.number}
                    </p>
                    <p className="mt-2 text-xs text-[#64748b]">
                      تاریخ صدور: {formatInvoiceDate(values.date)}
                    </p>
                  </div>
                </header>
                <div className="my-4 grid grid-cols-2 pb-2 max-sm:my-4 max-sm:pb-4">
                  <InvoicePartyCard title="فروشنده" party={values.seller} />
                  <InvoicePartyCard title="خریدار" party={values.buyer} />
                </div>
                <table className="w-full table-fixed text-right text-xs max-sm:text-[10px]">
                  <colgroup>
                    <col className="w-[48%] max-sm:w-[40%]" />
                    <col className="w-[12%] max-sm:w-[13%]" />
                    <col className="w-[20%] max-sm:w-[23.5%]" />
                    <col className="w-[20%] max-sm:w-[23.5%]" />
                  </colgroup>
                  <thead className="bg-[#0369A1] text-[#fafafa]">
                    <tr>
                      <th className="px-3 py-3 font-bold max-sm:px-1.5 max-sm:py-2">
                        شرح کالا / خدمات
                      </th>
                      <th className="px-2 py-3 text-center font-bold max-sm:px-1 max-sm:py-2">
                        تعداد
                      </th>
                      <th className="px-2 py-3 text-center font-bold max-sm:px-1 max-sm:py-2">
                        قیمت واحد ({values.currency})
                      </th>
                      <th className="px-3 py-3 text-center font-bold max-sm:px-1.5 max-sm:py-2">
                        مبلغ کل ({values.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.length === 0 ? (
                      <tr key="empty">
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-[#94a3b8]"
                        >
                          هنوز کالایی به فاکتور اضافه نشده است
                        </td>
                      </tr>
                    ) : (
                      visibleItems.map((item, index) => (
                        <tr
                          key={`${item.name}-${index}`}
                          className="break-inside-avoid border-b border-[#cbd5e1]"
                        >
                          <td className="px-3 py-4 align-top max-sm:px-1.5 max-sm:py-3">
                            <span className="font-bold text-[#1e3a5f]">
                              {item.name || "بدون عنوان"}
                            </span>
                            {item.description && (
                              <span className="mt-1 block leading-5 text-[#64748b]">
                                {item.description}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-4 text-center align-top tabular-nums max-sm:px-1 max-sm:py-3">
                            {formatMoney(Number(item.quantity) || 0)}
                          </td>
                          <td className="px-2 py-4 text-center align-top tabular-nums max-sm:px-1 max-sm:py-3">
                            {formatMoney(Number(item.unitPrice) || 0)}
                          </td>
                          <td className="px-3 py-4 text-center align-top font-bold tabular-nums max-sm:px-1.5 max-sm:py-3">
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
                  <div className="w-[78mm] shrink-0 space-y-2 text-xs max-sm:w-full">
                    <div className="flex justify-between text-[#64748b]">
                      <span>جمع جزء</span>
                      <span className="tabular-nums">
                        {formatMoney(subtotal)} {values.currency}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#64748b]">
                        <span>تخفیف</span>
                        <span className="tabular-nums">
                          − {formatMoney(discount)} {values.currency}
                        </span>
                      </div>
                    )}
                    {values.taxEnabled && (
                      <div className="flex justify-between text-[#64748b]">
                        <span>مالیات بر ارزش افزوده (۱۰٪)</span>
                        <span className="tabular-nums">
                          {formatMoney(tax)} {values.currency}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t-2 border-[#40a4df] bg-[#eff8fd] px-3 py-3 font-extrabold text-[#0c4a6e]">
                      <span>مبلغ قابل پرداخت</span>
                      <span className="text-base tabular-nums">
                        {formatMoney(total)} {values.currency}
                      </span>
                    </div>
                  </div>
                  <div className="max-w-[90mm] flex-1 max-sm:max-w-none">
                    {values.notes && (
                      <section className="border-r-2 border-[#5bb5e9] pr-3 text-xs leading-5">
                        <h3 className="font-bold text-[#334155]">توضیحات</h3>
                        <p className="mt-1 whitespace-pre-wrap text-[#64748b]">
                          {values.notes}
                        </p>
                      </section>
                    )}
                    <div
                      className={cn(
                        "mt-5 flex min-h-20 items-center border-dashed flex-col justify-between border-t-0 border-[#cbd5e1] text-[10px] text-[#64748b]",
                        values.notes && "border-t",
                      )}
                    >
                      {stampPreview && (
                        <Image
                          src={stampPreview}
                          alt="مهر یا امضای فروشنده"
                          className="max-h-[40mm] max-w-[40mm] size-40 object-contain mr-auto pl-4"
                          width={40}
                          height={40}
                          unoptimized
                        />
                      )}
                      <span className="text-left mr-auto pl-4">
                        مهر و امضای فروشنده
                      </span>
                    </div>
                  </div>
                </div>
                <footer className="mt-6 border-t border-[#cbd5e1] pt-4 text-center text-[10px] text-[#0369a1] max-sm:mt-4 max-sm:pt-3">
                  <p className="font-bold">از اعتماد شما سپاسگزاریم.</p>
                </footer>
              </article>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
