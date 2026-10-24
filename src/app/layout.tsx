import type { Metadata } from "next";
import "./globals.css";
import { font } from "@/assets/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "فاکتورساز آنلاین",
  description: "پلتفرم فاکتورساز آنلاین",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={cn("h-full", "antialiased", font.variable, "font-sans")}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
