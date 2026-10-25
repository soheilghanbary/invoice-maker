import { Suspense } from "react";
import { InvoiceForm } from "@/components/invoice-form";

export const metadata = {
  title: "ساخت فاکتور | فاکتورینو",
  description: "اطلاعات فاکتور، فروشنده، خریدار و کالاها را وارد کنید.",
};
export default function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; preview?: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f0f9ff]" />}>
      <InvoiceData searchParams={searchParams} />
    </Suspense>
  );
}

async function InvoiceData({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; preview?: string }>;
}) {
  const params = await searchParams;
  const id = Number(params.id);
  const invoiceId = Number.isSafeInteger(id) && id > 0 ? id : undefined;
  return (
    <InvoiceForm
      invoiceId={invoiceId}
      showPreview={params.preview === "1" && !!invoiceId}
    />
  );
}
