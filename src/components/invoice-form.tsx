"use client";

import { startTransition, useEffect, useRef } from "react";
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
import {
  InvoiceFormStoreProvider,
  useInvoiceFormStore,
} from "@/components/invoice-form-store";
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
  return (
    <InvoiceFormStoreProvider invoiceId={invoiceId}>
      <InvoiceFormContent invoiceId={invoiceId} showPreview={showPreview} />
    </InvoiceFormStoreProvider>
  );
}

function InvoiceFormContent({
  invoiceId,
  showPreview,
}: {
  invoiceId?: number;
  showPreview: boolean;
}) {
  const { register, control, setValue, handleSubmit, getValues, reset } =
    useForm<InvoiceValues>({
      defaultValues,
    });
  const activeInvoiceId = useInvoiceFormStore((state) => state.activeInvoiceId);
  const loadingInvoice = useInvoiceFormStore((state) => state.loadingInvoice);
  const invoiceLoadFailed = useInvoiceFormStore(
    (state) => state.invoiceLoadFailed,
  );
  const saving = useInvoiceFormStore((state) => state.saving);
  const saveError = useInvoiceFormStore((state) => state.saveError);
  const previewOpen = useInvoiceFormStore((state) => state.previewOpen);
  const stampUploading = useInvoiceFormStore((state) => state.stampUploading);
  const pendingStampConfirmation = useInvoiceFormStore(
    (state) => state.pendingStampConfirmation,
  );
  const timeZone = useInvoiceFormStore((state) => state.timeZone);
  const setFormState = useInvoiceFormStore((state) => state.set);
  const invoiceNumberInitialized = useRef(false);
  const stampPreview = useWatch({ control, name: "stampPreview" }) ?? "";
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    startTransition(() => {
      setFormState({
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    });
  }, [setFormState]);

  useEffect(() => {
    if (!invoiceId) return;
    let active = true;
    getInvoice(invoiceId)
      .then((invoice) => {
        if (!active) return;
        if (!invoice) {
          setFormState({
            saveError: "این فاکتور در این مرورگر پیدا نشد.",
            invoiceLoadFailed: true,
          });
          return;
        }
        reset({
          ...defaultValues,
          ...invoice.payload,
          seller: { ...defaultValues.seller, ...invoice.payload.seller },
          buyer: { ...defaultValues.buyer, ...invoice.payload.buyer },
        });
        if (showPreview) setFormState({ previewOpen: true });
      })
      .catch(() => {
        if (active) {
          setFormState({
            saveError: "بارگذاری فاکتور انجام نشد.",
            invoiceLoadFailed: true,
          });
        }
      })
      .finally(() => {
        if (active) setFormState({ loadingInvoice: false });
      });
    return () => {
      active = false;
    };
  }, [invoiceId, reset, showPreview, setFormState]);

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
    setFormState({ saving: true, saveError: "" });
    try {
      const saved = await saveInvoice(getValues(), activeInvoiceId);
      setFormState({ activeInvoiceId: saved.id });
      setValue("number", saved.number);
      if (pendingStampConfirmation) {
        try {
          await edgestore.businessImages.confirm({
            url: pendingStampConfirmation,
          });
          setFormState({ pendingStampConfirmation: "" });
        } catch {
          setFormState({
            saveError:
              "فاکتور ذخیره شد، اما تأیید تصویر مهر انجام نشد. دوباره ذخیره را بزنید.",
          });
          return;
        }
      }
      window.location.assign("/invoices");
    } catch (error) {
      setFormState({
        saveError:
          error instanceof Error ? error.message : "ذخیره فاکتور انجام نشد.",
      });
    } finally {
      setFormState({ saving: false });
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
          onPreview={() => setFormState({ previewOpen: true })}
        />

        <form
          onSubmit={handleSubmit(persistInvoice)}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]"
        >
          <div className="space-y-5">
            {loadingInvoice ? (
              <div className="rounded-2xl border border-[#dbeafe] bg-white p-10 text-center text-sm text-[#64748b]">
                در حال بارگذاری فاکتور…
              </div>
            ) : invoiceLoadFailed ? (
              <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-sm text-red-700">
                امکان ویرایش این فاکتور وجود ندارد.
              </div>
            ) : (
              <>
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
                  reusable={!activeInvoiceId}
                  onStampChange={(value) =>
                    setValue("stampPreview", value, { shouldDirty: true })
                  }
                  onPendingStampChange={(value) =>
                    setFormState({ pendingStampConfirmation: value })
                  }
                  onStampUploadingChange={(value) =>
                    setFormState({ stampUploading: value })
                  }
                />
              </>
            )}
          </div>

          <InvoiceSummary
            control={control}
            register={register}
            onPreview={() => setFormState({ previewOpen: true })}
            saving={saving}
            loading={loadingInvoice || invoiceLoadFailed}
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
          onClose={() => setFormState({ previewOpen: false })}
        />
      )}
    </div>
  );
}
