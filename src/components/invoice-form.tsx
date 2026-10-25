"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { InvoiceDetailsSection } from "@/components/invoice/details-section";
import { PartyFields } from "@/components/invoice/fields";
import { InvoiceItemsSection } from "@/components/invoice/items-section";
import { defaultValues } from "@/components/invoice/model";
import { InvoiceNotesAndStamp } from "@/components/invoice/notes-and-stamp";
import {
  InvoicePageIntro,
  InvoiceTopBar,
} from "@/components/invoice/page-header";
import { InvoicePreview } from "@/components/invoice/preview";
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
  const { register, control, setValue, handleSubmit, getValues, reset } =
    useForm<InvoiceValues>({
      defaultValues,
    });
  const [loadingInvoice, setLoadingInvoice] = useState(Boolean(invoiceId));
  const [activeInvoiceId, setActiveInvoiceId] = useState(invoiceId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [stampUploading, setStampUploading] = useState(false);
  const [pendingStampConfirmation, setPendingStampConfirmation] = useState("");
  const [timeZone, setTimeZone] = useState<string>();
  const invoiceNumberInitialized = useRef(false);
  const stampPreview = useWatch({ control, name: "stampPreview" }) ?? "";
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    startTransition(() => {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    });
  }, []);

  useEffect(() => {
    if (!invoiceId) return;
    let active = true;
    getInvoice(invoiceId)
      .then((invoice) => {
        if (!active) return;
        if (!invoice) {
          setSaveError("این فاکتور در این مرورگر پیدا نشد.");
          return;
        }
        reset({
          ...defaultValues,
          ...invoice.payload,
          seller: { ...defaultValues.seller, ...invoice.payload.seller },
          buyer: { ...defaultValues.buyer, ...invoice.payload.buyer },
        });
        if (showPreview) setPreviewOpen(true);
      })
      .catch(() => {
        if (active) setSaveError("بارگذاری فاکتور انجام نشد.");
      })
      .finally(() => {
        if (active) setLoadingInvoice(false);
      });
    return () => {
      active = false;
    };
  }, [invoiceId, reset, showPreview]);

  useEffect(() => {
    if (invoiceId) {
      invoiceNumberInitialized.current = true;
      return;
    }
    if (invoiceNumberInitialized.current) return;
    invoiceNumberInitialized.current = true;
    const storageKey = "factorino-next-invoice-number";
    const next = Number(window.localStorage.getItem(storageKey) || "1001");
    setValue(
      "number",
      `۱۴۰۵-${new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(next)}`,
    );
    window.localStorage.setItem(storageKey, String(next + 1));
  }, [setValue, invoiceId]);

  const printInvoice = () => {
    const sheet = document.getElementById("invoice-print");
    if (!sheet) return;

    const availableHeight = ((297 - 14) * 96) / 25.4;
    const scale = Math.min(1, availableHeight / sheet.scrollHeight);
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

  const persistInvoice = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const saved = await saveInvoice(getValues(), activeInvoiceId);
      setActiveInvoiceId(saved.id);
      setValue("number", saved.number);
      if (pendingStampConfirmation) {
        try {
          await edgestore.businessImages.confirm({
            url: pendingStampConfirmation,
          });
          setPendingStampConfirmation("");
        } catch {
          setSaveError(
            "فاکتور ذخیره شد، اما تأیید تصویر مهر انجام نشد. دوباره ذخیره را بزنید.",
          );
          return;
        }
      }
      window.location.assign("/invoices");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "ذخیره فاکتور انجام نشد.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="invoice-app" className="min-h-screen bg-[#f0f9ff]">
      <SellerProfilePersistence
        control={control}
        setValue={setValue}
        enabled={!activeInvoiceId}
      />
      <InvoiceTopBar isEditing={Boolean(activeInvoiceId)} />

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-8 sm:pt-10 sm:pb-28 lg:px-12 lg:pb-10">
        <InvoicePageIntro
          isEditing={Boolean(activeInvoiceId)}
          onPreview={() => setPreviewOpen(true)}
        />

        <form
          onSubmit={handleSubmit(persistInvoice)}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]"
        >
          <div className="space-y-5">
            <InvoiceDetailsSection
              control={control}
              register={register}
              timeZone={timeZone}
            />

            <PartyFields
              title="اطلاعات فروشنده"
              name="seller"
              register={register}
            />
            <PartyFields
              title="اطلاعات خریدار"
              name="buyer"
              register={register}
            />

            <InvoiceItemsSection control={control} register={register} />

            <InvoiceNotesAndStamp
              register={register}
              stampUrl={stampPreview}
              disabled={saving || loadingInvoice}
              onStampChange={(value) =>
                setValue("stampPreview", value, { shouldDirty: true })
              }
              onPendingStampChange={setPendingStampConfirmation}
              onStampUploadingChange={setStampUploading}
            />
          </div>

          <InvoiceSummary
            control={control}
            register={register}
            onPreview={() => setPreviewOpen(true)}
            saving={saving}
            loading={loadingInvoice}
            uploading={stampUploading}
            isEditing={Boolean(activeInvoiceId)}
          />
        </form>
        {saveError && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {saveError}
          </p>
        )}
      </main>

      {previewOpen && (
        <InvoicePreview
          open={previewOpen}
          control={control}
          onPrint={printInvoice}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
