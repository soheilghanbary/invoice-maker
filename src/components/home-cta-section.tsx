import { ArrowLeft, CheckCheck, FileText } from "lucide-react";
import Link from "next/link";

export function HomeCtaSection() {
  return (
    <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 overflow-hidden rounded-[2rem] bg-[#0c4a6e] px-6 py-10 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <div className="pointer-events-none absolute -left-16 -top-28 size-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-4 -top-16 size-56 rounded-full border border-white/10" />

        <div className="relative max-w-2xl">
          <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-white/10 text-[#bae6fd]">
            <FileText size={21} />
          </span>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            فاکتور بعدی‌تان را همین‌جا بسازید.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-sky-100/80 sm:text-base">
            رایگان شروع کنید؛ بدون ساخت حساب، با پیش‌نمایش و خروجی آماده‌ی چاپ.
          </p>
        </div>

        <div className="relative flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/invoice"
            className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-5 text-sm font-bold text-[#0c4a6e] transition-colors hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
          >
            ساخت فاکتور
            <ArrowLeft size={16} />
          </Link>
          <span className="inline-flex items-center gap-2 text-xs text-sky-100/80">
            <CheckCheck size={15} /> اطلاعات فروشنده در مرورگر شما می‌ماند
          </span>
        </div>
      </div>
    </section>
  );
}
