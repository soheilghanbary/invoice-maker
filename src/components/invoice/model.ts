import type { InvoiceItem, InvoiceValues } from "@/types/invoice";

export const defaultValues: InvoiceValues = {
  type: "پیش فاکتور",
  number: "۱۴۰۵-۱۰۰۱",
  date: "2026-10-24",
  currency: "ریال",
  seller: {
    name: "",
    phone: "",
    address: "",
    postalCode: "",
    nationalId: "",
    economicCode: "",
  },
  buyer: {
    name: "",
    phone: "",
    address: "",
    postalCode: "",
    nationalId: "",
    economicCode: "",
  },
  items: [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
  notes: "",
  stampPreview: "",
  discount: 0,
  taxEnabled: false,
};

export const moneyFormat = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
export const formatMoney = (value: number) =>
  moneyFormat.format(Math.max(0, Math.round(value)));

export function calculateTotals(
  items: InvoiceItem[],
  discountValue: number,
  taxEnabled: boolean,
) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );
  const discount = Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const tax = taxEnabled ? taxableSubtotal * 0.1 : 0;
  return { subtotal, discount, tax, total: taxableSubtotal + tax };
}

export function parseInvoiceDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day, 12);
}

export function formatInvoiceDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "انتخاب تاریخ";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function toInvoiceDateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
