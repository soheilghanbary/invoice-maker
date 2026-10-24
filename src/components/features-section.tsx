import { Calculator, FileText, PrinterCheck } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "اطلاعات کامل فاکتور",
    description:
      "مشخصات فروشنده و خریدار، تاریخ، ارز و ردیف‌های کالا یا خدمات را یک‌جا وارد کنید.",
  },
  {
    icon: Calculator,
    title: "جمع‌بندی زنده و دقیق",
    description:
      "مبلغ هر ردیف و جمع نهایی هم‌زمان محاسبه می‌شود؛ تخفیف و مالیات ۱۰٪ هم قابل تنظیم است.",
  },
  {
    icon: PrinterCheck,
    title: "آماده چاپ و PDF",
    description:
      "قبل از چاپ، نمای نهایی را بررسی کنید و نسخه‌ی مرتب A4 را چاپ یا به صورت PDF ذخیره کنید.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mb-12 flex flex-col gap-4 border-b border-[#dbeafe] pb-8 md:flex-row md:items-end md:justify-between">
          <h2
            id="features-title"
            className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#0c4a6e] sm:text-4xl"
          >
            از اطلاعات اولیه تا فاکتور آماده‌ی چاپ
          </h2>
          <p className="max-w-md text-sm leading-7 text-[#64748b] sm:text-base">
            ابزارهای لازم برای ساخت یک فاکتور خوانا و دقیق، بدون رفت‌وآمد بین
            فایل‌ها و ماشین‌حساب.
          </p>
        </div>

        <div className="grid gap-x-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="border-b border-[#e2e8f0] py-7 first:pt-0 last:border-b-0 md:border-b-0 md:border-r md:py-2 md:pr-8 md:first:pr-0 md:last:border-r-0"
            >
              <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <h3 className="text-lg font-bold text-[#0c4a6e]">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[#64748b]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
