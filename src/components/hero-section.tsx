import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, Clock3, Download, FileText, Plus, Send } from "lucide-react";

const invoiceRows = [
  { title: "طراحی هویت بصری", detail: "۱۲ ساعت × ۸۵۰٬۰۰۰ تومان", amount: "۱۰٬۲۰۰٬۰۰۰" },
  { title: "طراحی صفحه فرود", detail: "۱ مورد × ۶٬۵۰۰٬۰۰۰ تومان", amount: "۶٬۵۰۰٬۰۰۰" },
  { title: "اصلاحات نهایی", detail: "۳ ساعت × ۸۵۰٬۰۰۰ تومان", amount: "۲٬۵۵۰٬۰۰۰" },
];

export function HeroSection() {
  return (
    <main id="home" className="relative isolate overflow-hidden bg-[#f0f9ff]">
      <div className="pointer-events-none absolute -left-36 top-20 size-[440px] rounded-full border border-[#dbeafe]" />
      <div className="pointer-events-none absolute -left-20 top-36 size-[310px] rounded-full border border-[#dbeafe]" />
      <section id="features" className="relative mx-auto grid min-h-[670px] max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-12">
        <div className="max-w-xl text-right">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#0369a1]">
            <span className="size-1.5 rounded-full bg-[#38bdf8]" />
            ساده، دقیق، آماده ارسال
          </div>
          <h1 className="text-[clamp(2.7rem,5.6vw,5rem)] font-extrabold leading-[1.2] tracking-[-0.055em] text-[#0c4a6e]">
            فاکتور حرفه‌ای،
            <br />
            <span className="text-[#0284c7]">در چند دقیقه.</span>
          </h1>
          <p className="mt-6 max-w-[31rem] text-base leading-8 text-[#64748b] sm:text-lg">
            بدون فایل‌های پیچیده و حساب‌وکتاب دستی، فاکتور بسازید، برای مشتری بفرستید و پرداخت‌ها را مرتب نگه دارید.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/invoice" className="inline-flex h-14 items-center gap-3 rounded-2xl bg-[#0369a1] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(39,60,50,0.14)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0369a1]">
              ساخت اولین فاکتور
              <ArrowLeft size={17} />
            </Link>
            <span className="pr-2 text-sm text-[#64748b]">رایگان و بدون نیاز به ثبت‌نام</span>
          </div>
          <div className="mt-12 flex items-center gap-3 border-t border-[#e2e8f0] pt-6 text-sm text-[#64748b]">
            <span className="flex -space-x-2 space-x-reverse">
              {[
                "bg-[#e0f2fe]",
                "bg-[#7dd3fc]",
                "bg-[#bae6fd]",
              ].map((color, index) => (
                <span key={color} className={`flex size-8 items-center justify-center rounded-full border-2 border-[#f0f9ff] ${color} text-[10px] font-bold text-[#1e3a5f]`}>
                  {index === 0 ? "م" : index === 1 ? "س" : "ن"}
                </span>
              ))}
            </span>
            <span><strong className="font-bold text-[#334155]">۲٬۴۰۰+</strong> کسب‌وکار از همین‌جا شروع کردند</span>
          </div>
        </div>

        <div id="invoice-preview" className="relative mx-auto w-full max-w-[490px] scroll-mt-24">
          <div className="absolute -inset-5 -rotate-3 rounded-[2rem] border border-[#dbeafe] bg-[#e0f2fe]" />
          <article aria-label="پیش‌نمایش فاکتور" className="relative rounded-[1.65rem] border border-[#dbeafe] bg-white p-6 shadow-[0_24px_70px_rgba(42,57,46,0.12)] sm:p-8">
            <div className="flex items-start justify-between border-b border-[#e0f2fe] pb-6">
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#0c4a6e]">
                  <FileText size={19} />
                  <span className="font-extrabold">فاکتورینو</span>
                </div>
                <p className="mt-2 text-xs text-[#64748b]">طراحی و راهکارهای دیجیتال</p>
              </div>
              <div className="rounded-full bg-[#e0f2fe] px-3 py-1.5 text-[11px] font-bold text-[#0369a1]">پرداخت‌شده</div>
            </div>

            <div className="flex items-start justify-between py-6">
              <div className="text-right">
                <p className="text-xs text-[#64748b]">صورتحساب برای</p>
                <p className="mt-1.5 text-sm font-bold text-[#1e3a5f]">شرکت آوید</p>
                <p className="mt-1 text-xs text-[#64748b]">تهران، خیابان ولیعصر</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-[#64748b]">شماره فاکتور</p>
                <p className="mt-1.5 font-mono text-sm font-semibold text-[#1e3a5f]">INV-۱۴۰۵-۰۲۸</p>
                <p className="mt-1 text-xs text-[#64748b]">۲۴ مهر ۱۴۰۵</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#f8fbfd] px-4 py-3 text-[10px] font-semibold text-[#64748b]">
              <div className="grid grid-cols-[1fr_auto] gap-3"><span>شرح خدمات</span><span>مبلغ (تومان)</span></div>
            </div>
            <div className="divide-y divide-[#e2e8f0]">
              {invoiceRows.map((row) => (
                <div key={row.title} className="grid grid-cols-[1fr_auto] items-center gap-3 py-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#334155]">{row.title}</p>
                    <p className="mt-1 text-[10px] text-[#64748b]">{row.detail}</p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-[#475569]">{row.amount}</span>
                </div>
              ))}
            </div>

            <div className="mt-1 rounded-xl bg-[#f0f9ff] p-4">
              <div className="flex justify-between text-xs text-[#64748b]"><span>جمع کل</span><span>۱۹٬۲۵۰٬۰۰۰ تومان</span></div>
              <div className="mt-3 flex justify-between border-t border-[#dbeafe] pt-3 text-sm font-extrabold text-[#0c4a6e]"><span>مبلغ پرداختی</span><span>۱۹٬۲۵۰٬۰۰۰ تومان</span></div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]"><CheckCheck size={14} className="text-[#0284c7]" /> رسید پرداخت ثبت شده</div>
              <div className="flex gap-2 text-[#64748b]"><button aria-label="افزودن" className="flex size-8 items-center justify-center rounded-lg border border-[#dbeafe]"><Plus size={14} /></button><button aria-label="دانلود" className="flex size-8 items-center justify-center rounded-lg border border-[#dbeafe]"><Download size={14} /></button><button aria-label="ارسال" className="flex size-8 items-center justify-center rounded-lg border border-[#dbeafe]"><Send size={14} /></button></div>
            </div>
          </article>

          <div className="absolute -bottom-7 -right-8 hidden items-center gap-3 rounded-2xl border border-[#dbeafe] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(42,57,46,0.1)] sm:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7]"><Check size={17} /></span>
            <span><span className="block text-xs font-bold text-[#334155]">پرداخت ثبت شد</span><span className="mt-1 block text-[10px] text-[#64748b]">همه‌چیز مرتب است</span></span>
          </div>
          <div className="absolute -left-8 top-24 hidden items-center gap-2 rounded-xl border border-[#dbeafe] bg-white px-3.5 py-3 text-xs font-semibold text-[#475569] shadow-[0_12px_30px_rgba(42,57,46,0.09)] sm:flex">
            <Clock3 size={15} className="text-[#0284c7]" /> آماده در چند دقیقه
          </div>
        </div>
      </section>
    </main>
  );
}
