import { InvoicesList } from "@/components/invoices-list";

export const metadata = {
  title: "فاکتورهای من | فاکتورینو",
  description: "فهرست و جست‌وجوی فاکتورهای ذخیره‌شده",
};
export default function InvoicesPage() {
  return <InvoicesList />;
}
