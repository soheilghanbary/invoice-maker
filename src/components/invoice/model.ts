import type { InvoiceItem, InvoiceValues } from "@/types/invoice";

export const TAX_RATE = 0.1;

export function getTodayDateValue() {
  const parts = new Intl.DateTimeFormat("en-US", {
    calendar: "gregory",
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: "year" | "month" | "day") =>
    parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export const defaultValues: InvoiceValues = {
  type: "پیش فاکتور",
  number: "",
  date: getTodayDateValue(),
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
export const formatCount = (value: number) => moneyFormat.format(value);

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
  const tax = taxEnabled ? taxableSubtotal * TAX_RATE : 0;
  return { subtotal, discount, tax, total: taxableSubtotal + tax };
}

export function generateInvoiceNumber(sequence: number) {
  const year = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    timeZone: "Asia/Tehran",
  }).format(new Date());
  return `${year}-${new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(sequence)}`;
}

function toClampedNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function toNormalizedItem(item: Partial<InvoiceItem>): InvoiceItem {
  return {
    name: typeof item.name === "string" ? item.name : "",
    description: typeof item.description === "string" ? item.description : "",
    quantity: toClampedNumber(item.quantity),
    unitPrice: toClampedNumber(item.unitPrice),
  };
}

export function normalizeInvoiceValues(
  payload: Partial<InvoiceValues> | null | undefined,
): InvoiceValues {
  if (!payload) return structuredClone(defaultValues);
  return {
    ...structuredClone(defaultValues),
    ...payload,
    number: typeof payload.number === "string" ? payload.number : "",
    date: typeof payload.date === "string" ? payload.date : getTodayDateValue(),
    currency:
      payload.currency === "تومان" || payload.currency === "ریال"
        ? payload.currency
        : defaultValues.currency,
    seller: { ...defaultValues.seller, ...payload.seller },
    buyer: { ...defaultValues.buyer, ...payload.buyer },
    items: Array.isArray(payload.items)
      ? payload.items.map(toNormalizedItem)
      : structuredClone(defaultValues.items),
    notes: typeof payload.notes === "string" ? payload.notes : "",
    stampPreview:
      typeof payload.stampPreview === "string" ? payload.stampPreview : "",
    discount: toClampedNumber(payload.discount),
    taxEnabled: Boolean(payload.taxEnabled),
  };
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
