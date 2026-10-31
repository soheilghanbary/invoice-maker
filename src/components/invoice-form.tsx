"use client";

import { ArrowRight, FileWarning, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { InvoiceDetailsSection } from "@/components/invoice/details-section";
import { PartyFields } from "@/components/invoice/fields";
import { InvoiceItemsSection } from "@/components/invoice/items-section";
import {
  defaultValues,
  generateInvoiceNumber,
  normalizeInvoiceValues,
} from "@/components/invoice/model";
import { InvoiceNotesAndStamp } from "@/components/invoice/notes-and-stamp";
import {
  InvoicePageIntro,
  InvoiceTopBar,
} from "@/components/invoice/page-header";
import { InvoicePreview } from "@/components/invoice/preview";
import { SectionCard } from "@/components/invoice/section-card";
import { SellerProfilePersistence } from "@/components/invoice/seller-profile-persistence";
import { InvoiceSummary } from "@/components/invoice/summary";
import { useEdgeStore } from "@/lib/edgestore";
import { getInvoice, saveInvoice } from "@/lib/invoice-storage";
import type { InvoiceValues } from "@/types/invoice";

export function InvoiceForm({
  invoiceId,
  showPreview = false,
}: {
  invoiceId?: number;
  showPreview?: boolean;
}) {
  return <InvoiceFormContent invoiceId={invoiceId} showPreview={showPreview} />;
}

function InvoiceFormContent({
  invoiceId,
  showPreview,
}: {
  invoiceId?: number;
  showPreview: boolean;
}) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const [loadState, setLoadState] = useState({
    loading: Boolean(invoiceId),
    failed: false,
    error: "",
  });
  const [actionState, setActionState] = useState({ saving: false, error: "" });
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState(invoiceId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [stampUploading, setStampUploading] = useState(false);
  const [pendingStampConfirmation, setPendingStampConfirmation] = useState("");
  const [timeZone, setTimeZone] = useState<string>();

  const form = useForm<InvoiceValues>({ defaultValues, mode: "onBlur" });
  const { setValue, control, handleSubmit, reset, getValues } = form;
  const stampPreview = useWatch({ control, name: "stampPreview" }) ?? "";

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    if (!invoiceId) return;
    let active = true;
    getInvoice(invoiceId)
      .then((invoice) => {
        if (!active) return;
        if (!invoice) {
          setLoadState((state) => ({
            ...state,
            failed: true,
            error: "این فاکتور در این مرورگر پیدا نشد.",
          }));
          return;
        }
        reset(normalizeInvoiceValues(invoice.payload));
        if (showPreview) setPreviewOpen(true);
      })
      .catch(() => {
        if (active) {
          setLoadState((state) => ({
            ...state,
            failed: true,
            error: "بارگذاری فاکتور انجام نشد.",
          }));
        }
      })
      .finally(() => {
        if (active) {
          setLoadState((state) => ({ ...state, loading: false }));
        }
      });
    return () => {
      active = false;
    };
  }, [invoiceId, reset, showPreview]);

  useEffect(() => {
    if (invoiceId) return;
    const storageKey = "factorino-next-invoice-number";
    const next = Number(window.localStorage.getItem(storageKey) || "1001");
    setValue("number", generateInvoiceNumber(next));
    window.localStorage.setItem(storageKey, String(next + 1));
  }, [setValue, invoiceId]);

  const printInvoice = () => {
    const sheet = document.getElementById("invoice-print");
    if (!sheet) return;

    const availableHeight = ((297 - 14) * 96) / 25.4;
    const scale = Math.min(1.0, availableHeight / sheet.scrollHeight);
    sheet.style.setProperty("--invoice-print-scale", String(scale));
    sheet.style.setProperty("--invoice-print-width", `${100 / scale}%`);

    window.addEventListener(
      "afterprint",
      () => {
        sheet.style.removeProperty("--invoice-print-scale");
        sheet.style.removeProperty("--invoice-print-width");
      },
      { once: true },
    );
    window.print();
  };

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    setActionState((state) => ({ ...state, error: "" }));
    try {
      const response = await fetch("/api/invoice-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValues()),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error || "ساخت فایل PDF انجام نشد.");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const utf8Filename = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      anchor.download = utf8Filename
        ? decodeURIComponent(utf8Filename)
        : "invoice.pdf";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setActionState((state) => ({
        ...state,
        error:
          error instanceof Error ? error.message : "ساخت فایل PDF انجام نشد.",
      }));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setActionState((state) => ({ ...state, saving: true, error: "" }));
    try {
      const saved = await saveInvoice(values, activeInvoiceId);
      setActiveInvoiceId(saved.id);
      setValue("number", saved.number);
      if (pendingStampConfirmation) {
        try {
          await edgestore.businessImages.confirm({
            url: pendingStampConfirmation,
          });
          setPendingStampConfirmation("");
        } catch {
          setActionState((state) => ({
            ...state,
            error:
              "فاکتور ذخیره شد، اما تأیید تصویر مهر انجام نشد. دوباره ذخیره را بزنید.",
          }));
          return;
        }
      }
      router.push("/invoices");
    } catch (error) {
      setActionState((state) => ({
        ...state,
        error:
          error instanceof Error ? error.message : "ذخیره فاکتور انجام نشد.",
      }));
    } finally {
      setActionState((state) => ({ ...state, saving: false }));
    }
  });

  return (
    <FormProvider {...form}>
      <div id="invoice-app" className="min-h-screen bg-background">
        <SellerProfilePersistence enabled={!activeInvoiceId} />
        <InvoiceTopBar />
        <main className="mx-auto max-w-6xl px-4 pt-6 pb-32 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
          <InvoicePageIntro
            isEditing={Boolean(activeInvoiceId)}
            onPreview={() => setPreviewOpen(true)}
            onDownloadPdf={downloadPdf}
            downloadingPdf={downloadingPdf}
            downloadDisabled={
              downloadingPdf ||
              loadState.loading ||
              loadState.failed ||
              actionState.saving ||
              stampUploading
            }
          />

          <form
            onSubmit={onSubmit}
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
          >
            <div className="space-y-4">
              {loadState.loading ? (
                <SectionCard className="p-10 text-center">
                  <LoaderCircle
                    size={20}
                    className="mx-auto animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    در حال بارگذاری فاکتور…
                  </p>
                </SectionCard>
              ) : loadState.failed ? (
                <SectionCard className="p-10 text-center">
                  <FileWarning
                    size={22}
                    className="mx-auto text-destructive"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    امکان ویرایش این فاکتور وجود ندارد.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {loadState.error}
                  </p>
                  <Link
                    href="/invoices"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <ArrowRight size={15} /> مشاهده فاکتورهای ذخیره‌شده
                  </Link>
                </SectionCard>
              ) : (
                <>
                  <InvoiceDetailsSection timeZone={timeZone} />

                  <PartyFields title="اطلاعات فروشنده" name="seller" />
                  <PartyFields title="اطلاعات خریدار" name="buyer" />
                  <InvoiceItemsSection />
                  <InvoiceNotesAndStamp
                    stampUrl={stampPreview}
                    disabled={actionState.saving || loadState.loading}
                    reusable={!activeInvoiceId}
                    onStampChange={(value) =>
                      setValue("stampPreview", value, { shouldDirty: true })
                    }
                    onPendingStampChange={setPendingStampConfirmation}
                    onStampUploadingChange={setStampUploading}
                  />
                  {actionState.error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm leading-6 text-destructive"
                    >
                      {actionState.error}
                    </p>
                  )}
                </>
              )}
            </div>
            {!loadState.loading && !loadState.failed && (
              <InvoiceSummary
                onPreview={() => setPreviewOpen(true)}
                saving={actionState.saving}
                loading={loadState.loading || loadState.failed}
                uploading={stampUploading}
                isEditing={Boolean(activeInvoiceId)}
              />
            )}
          </form>
        </main>

        {previewOpen && (
          <InvoicePreview
            open={previewOpen}
            onPrint={printInvoice}
            onClose={() => setPreviewOpen(false)}
          />
        )}
      </div>
    </FormProvider>
  );
}
