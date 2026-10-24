import { ArrowUpLeft, FileText } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { label: "خانه", href: "#home" },
  { label: "امکانات", href: "#features" },
  { label: "نمونه فاکتور", href: "#invoice-preview" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dbeafe] bg-[#f8fbfd]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Link
          href="#home"
          aria-label="فاکتورینو، خانه"
          className="flex w-fit items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#0369a1] text-[#bae6fd]">
            <FileText size={17} strokeWidth={1.8} />
          </span>
          <span className="text-sm font-extrabold text-[#0c4a6e]">
            فاکتورینو
          </span>
        </Link>

        <nav
          aria-label="پیوندهای پایین صفحه"
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#64748b] transition-colors hover:text-[#0369a1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0369a1]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/invoice"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0369a1] transition-colors hover:text-[#0c4a6e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0369a1]"
          >
            ساخت فاکتور <ArrowUpLeft size={14} />
          </Link>
        </nav>

        <p className="text-xs text-[#94a3b8]">© فاکتورینو</p>
      </div>
    </footer>
  );
}
