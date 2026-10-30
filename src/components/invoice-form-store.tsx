"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export type InvoiceFormState = {
  activeInvoiceId?: number;
  loadingInvoice: boolean;
  invoiceLoadFailed: boolean;
  saving: boolean;
  saveError: string;
  previewOpen: boolean;
  stampUploading: boolean;
  downloadingPdf: boolean;
  pendingStampConfirmation: string;
  timeZone?: string;
  set: (state: Partial<InvoiceFormState>) => void;
};

export function createInvoiceFormStore(invoiceId?: number) {
  return createStore<InvoiceFormState>((set) => ({
    activeInvoiceId: invoiceId,
    loadingInvoice: Boolean(invoiceId),
    invoiceLoadFailed: false,
    saving: false,
    saveError: "",
    previewOpen: false,
    stampUploading: false,
    downloadingPdf: false,
    pendingStampConfirmation: "",
    timeZone: undefined,
    set: (state) => set(state),
  }));
}

type InvoiceFormStore = ReturnType<typeof createInvoiceFormStore>;
const InvoiceFormStoreContext = createContext<InvoiceFormStore | null>(null);

export function InvoiceFormStoreProvider({
  invoiceId,
  children,
}: {
  invoiceId?: number;
  children: ReactNode;
}) {
  const [store] = useState(() => createInvoiceFormStore(invoiceId));
  return (
    <InvoiceFormStoreContext value={store}>{children}</InvoiceFormStoreContext>
  );
}

export function useInvoiceFormStore<T>(
  selector: (state: InvoiceFormState) => T,
) {
  const store = useContext(InvoiceFormStoreContext);
  if (!store) throw new Error("InvoiceFormStoreProvider is missing.");
  return useStore(store, selector);
}
