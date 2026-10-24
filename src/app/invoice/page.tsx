import { InvoiceForm } from "@/components/invoice-form";

export const metadata = {
  title: "ساخت فاکتور | فاکتورینو",
  description: "اطلاعات فاکتور، فروشنده، خریدار و کالاها را وارد کنید.",
};

export default function InvoicePage() {
  return <InvoiceForm />;
}
