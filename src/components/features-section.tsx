import {
  ArrowLeft,
  Calculator,
  Check,
  FilePlus2,
  FileText,
  PrinterCheck,
  Search,
} from "lucide-react";
import Link from "next/link";

const invoices = [
  { number: "۱۴۰۵-۱۱۵۸", buyer: "شرکت آوید", amount: "۲۴٬۸۰۰٬۰۰۰" },
  { number: "۱۴۰۵-۱۱۵۷", buyer: "استودیو مسیر", amount: "۸٬۴۵۰٬۰۰۰" },
  { number: "۱۴۰۵-۱۱۵۶", buyer: "نگار رستمی", amount: "۱۲٬۰۰۰٬۰۰۰" },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="relative overflow-hidden bg-white"
    >
      <div className="pointer-events-none absolute -top-40 left-[-8rem] size-[30rem] rounded-full bg-[#f0f9ff] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-[#f8fbfd] px-3 py-1.5 text-xs font-bold text-[#0369a1]">
              <span className="size-1.5 rounded-full bg-[#38bdf8]" /> ابزارهای یک فاکتور کامل
            </span>
            <h2 id="features-title" className="text-3xl font-extrabold leading-[1.35] tracking-tight text-[#0c4a6e] sm:text-4xl lg:text-[2.7rem]">
              از ساخت تا بایگانی،<br className="hidden sm:block" /> همه‌چیز سر جای خودش.
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:max-w-[28rem] lg:flex-col lg:items-start">
            <p className="text-sm leading-7 text-[#64748b] sm:text-[15px]">مبلغ‌ها را دقیق حساب کنید، فاکتورها را مرتب نگه دارید و هر وقت لازم شد دوباره سراغشان بروید.</p>
            <Link href="/invoices" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#0369a1] hover:text-[#0c4a6e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0369a1]">
              فهرست فاکتورها <ArrowLeft size={16} />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <article className="overflow-hidden rounded-[1.7rem] border border-[#dbeafe] bg-[#f8fbfd] p-5 sm:p-7 lg:col-span-7 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white text-[#0369a1] shadow-sm ring-1 ring-[#e0f2fe]"><Search size={19} /></span>
                <h3 className="text-lg font-extrabold text-[#0c4a6e] sm:text-xl">فاکتورها همیشه در دسترس‌اند</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#64748b]">شماره یا نام خریدار را جست‌وجو کنید؛ فاکتور ذخیره‌شده سریع پیدا می‌شود.</p>
              </div>
              <span className="hidden rounded-full bg-[#e0f2fe] px-3 py-1.5 text-xs font-bold text-[#0369a1] sm:inline-flex">جست‌وجوی سریع</span>
            </div>
            <div className="mt-7 overflow-hidden rounded-2xl border border-[#e2edf5] bg-white shadow-[0_12px_36px_rgba(12,74,110,0.06)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#edf3f8] px-4 py-3.5 sm:px-5">
                <span className="text-xs font-bold text-[#0c4a6e]">فاکتورهای اخیر</span>
                <span className="flex items-center gap-2 rounded-lg bg-[#f8fbfd] px-3 py-2 text-[11px] text-[#94a3b8] ring-1 ring-[#edf3f8]"><Search size={13} /> جست‌وجوی فاکتورها</span>
              </div>
              <div className="hidden grid-cols-[1fr_1.15fr_1.15fr] gap-3 bg-[#fbfdff] px-5 py-2.5 text-[10px] font-semibold text-[#94a3b8] sm:grid"><span>شماره فاکتور</span><span>خریدار</span><span className="text-left">مبلغ کل</span></div>
              <ul className="divide-y divide-[#edf3f8]">
                {invoices.map((invoice) => <li key={invoice.number} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:grid sm:grid-cols-[1fr_1.15fr_1.15fr] sm:px-5">
                  <span className="min-w-0"><span className="block text-xs font-bold text-[#0369a1]">{invoice.number}</span><span className="mt-1 block text-[10px] text-[#94a3b8] sm:hidden">{invoice.buyer}</span></span>
                  <span className="hidden text-xs font-medium text-[#475569] sm:block">{invoice.buyer}</span>
                  <span className="shrink-0 text-left text-xs font-extrabold tabular-nums text-[#0c4a6e]">{invoice.amount} <span className="text-[10px] font-medium text-[#94a3b8]">ریال</span></span>
                </li>)}
              </ul>
              <div className="flex items-center justify-between border-t border-[#edf3f8] bg-[#fbfdff] px-4 py-3 sm:px-5"><span className="text-[11px] text-[#64748b]">۳ فاکتور از بایگانی</span><span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0369a1]">مشاهده فهرست <ArrowLeft size={12} /></span></div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[1.7rem] bg-[#0c4a6e] p-6 text-white sm:p-7 lg:col-span-5 lg:p-8">
            <div className="pointer-events-none absolute -left-14 -top-16 size-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -left-2 -top-4 size-28 rounded-full border border-white/10" />
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#bae6fd] ring-1 ring-white/10"><Calculator size={19} /></div>
            <h3 className="relative mt-5 text-lg font-extrabold sm:text-xl">حساب‌وکتاب، بی‌دردسر</h3>
            <p className="relative mt-2 max-w-sm text-sm leading-6 text-[#c5dbe8]">جمع هر ردیف، تخفیف و مالیات هم‌زمان با ورود اطلاعات محاسبه می‌شود.</p>
            <div className="relative mt-7 rounded-2xl bg-white p-4 text-[#334155] sm:p-5">
              <div className="flex justify-between border-b border-[#edf3f8] pb-3 text-xs font-semibold text-[#64748b]"><span>جمع اقلام</span><span className="tabular-nums">۴۲٬۰۰۰٬۰۰۰ ریال</span></div>
              <div className="flex justify-between py-3 text-xs text-[#64748b]"><span>تخفیف</span><span className="tabular-nums">۲٬۰۰۰٬۰۰۰ ریال</span></div>
              <div className="flex justify-between border-t border-dashed border-[#dbeafe] pt-3.5"><span className="text-xs font-bold text-[#0c4a6e]">قابل پرداخت</span><span className="text-sm font-extrabold tabular-nums text-[#0369a1]">۴۰٬۰۰۰٬۰۰۰ <span className="text-[10px]">ریال</span></span></div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-[#16a34a]"><Check size={13} /> مبلغ نهایی خودکار به‌روز می‌شود</div>
            </div>
          </article>

          <article className="flex flex-col justify-between gap-6 rounded-[1.7rem] border border-[#dbeafe] bg-white p-6 sm:flex-row sm:items-center sm:p-7 lg:col-span-5 lg:p-8">
            <div><span className="flex size-10 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0369a1]"><FilePlus2 size={19} /></span><h3 className="mt-4 text-lg font-extrabold text-[#0c4a6e]">جزئیات کامل، یک‌جا</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#64748b]">اطلاعات فروشنده و خریدار، ردیف کالاها، تاریخ و واحد پول را کنار هم وارد کنید.</p></div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-40 sm:justify-end">{["فروشنده", "خریدار", "کالاها", "توضیحات"].map((label) => <span key={label} className="rounded-lg bg-[#f8fbfd] px-3 py-2 text-[11px] font-semibold text-[#475569] ring-1 ring-[#e5eff6]">{label}</span>)}</div>
          </article>

          <article className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[1.7rem] border border-[#dbeafe] bg-[#eaf6fd] p-6 sm:flex-row sm:items-center sm:p-7 lg:col-span-7 lg:p-8">
            <div className="relative z-10 max-w-md"><span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#0369a1] shadow-sm"><PrinterCheck size={19} /></span><h3 className="mt-4 text-lg font-extrabold text-[#0c4a6e]">آماده‌ی بازبینی و چاپ</h3><p className="mt-2 text-sm leading-6 text-[#526b7c]">پیش‌نمایش فاکتور را ببینید و نسخه‌ی مرتب A4 را روی کاغذ یا به صورت PDF ذخیره کنید.</p><Link href="/invoice" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0369a1] hover:text-[#0c4a6e]">ساخت فاکتور <ArrowLeft size={15} /></Link></div>
            <div className="relative mx-auto w-full max-w-[15rem] rotate-[2deg] rounded-xl bg-white p-4 shadow-[0_18px_40px_rgba(12,74,110,0.12)] sm:mx-0 sm:ml-2 sm:shrink-0">
              <div className="flex items-center justify-between border-b border-[#e5eff6] pb-3"><div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#0c4a6e]"><FileText size={13} className="text-[#0369a1]" /> فاکتور فروش</div><span className="rounded-full bg-[#e0f2fe] px-2 py-1 text-[8px] font-bold text-[#0369a1]">A4</span></div>
              <div className="mt-3 space-y-2.5"><div className="h-1.5 w-3/5 rounded-full bg-[#cfe7f5]" /><div className="h-1.5 w-2/5 rounded-full bg-[#e7f1f7]" /><div className="mt-4 space-y-1.5 rounded-lg bg-[#f8fbfd] p-2.5"><div className="h-1.5 w-full rounded-full bg-[#d9eaf4]" /><div className="h-1.5 w-4/5 rounded-full bg-[#e5eff6]" /><div className="h-1.5 w-11/12 rounded-full bg-[#e5eff6]" /></div><div className="flex justify-between pt-1 text-[8px] font-bold text-[#0369a1]"><span>مبلغ کل</span><span>۲۴٬۸۰۰٬۰۰۰ ریال</span></div></div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
