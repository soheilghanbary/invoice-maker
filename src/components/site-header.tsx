import { ArrowUpLeft, FileText } from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "خانه", href: "#home" },
  { label: "امکانات", href: "#features" },
  { label: "نمونه فاکتور", href: "#invoice-preview" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e2e8f0] bg-[#f8fbfd]/90 backdrop-blur-md">
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="#home"
          className="flex items-center gap-3"
          aria-label="فاکتورینو، خانه"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#0369a1] text-[#bae6fd]">
            <FileText size={19} strokeWidth={1.8} />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-[#0c4a6e]">
            فاکتورینو
          </span>
        </Link>

        <nav
          aria-label="ناوبری اصلی"
          className="hidden items-center gap-9 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#64748b] transition-colors hover:text-[#0c4a6e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0369a1]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/invoice"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0369a1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#075985] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0369a1]"
        >
          شروع رایگان
          <ArrowUpLeft size={16} />
        </Link>
      </div>
    </header>
  );
}
