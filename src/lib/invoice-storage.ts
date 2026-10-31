import { calculateTotals } from "@/components/invoice/model";
import type {
  InvoiceRecord,
  InvoiceValues,
  SavedInvoice,
} from "@/types/invoice";

const databaseName = "factorino-invoices";
const storeName = "invoices";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function summary(invoice: SavedInvoice): InvoiceRecord {
  return {
    id: invoice.id,
    number: invoice.number,
    type: invoice.type,
    date: invoice.date,
    buyerName: invoice.buyerName,
    total: invoice.total,
    currency: invoice.currency,
    createdAt: invoice.createdAt,
  };
}

function uniqueNumber(
  requested: string,
  all: SavedInvoice[],
  exceptId?: number,
) {
  const existingNumbers = new Set(
    all
      .filter((invoice) => invoice.id !== exceptId)
      .map((invoice) => invoice.number),
  );
  if (!existingNumbers.has(requested)) return requested;
  const match = requested.match(/^(.*?)([0-9۰-۹٠-٩]+)$/);
  if (!match) return `${requested}-2`;
  const western = match[2]
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const useArabic = /[٠-٩]/.test(match[2]);
  const digits = useArabic ? "٠١٢٣٤٥٦٧٨٩" : "۰۱۲۳۴۵۶۷۸۹";
  let sequence = Number(western);
  let candidate = requested;
  do {
    sequence += 1;
    candidate = `${match[1]}${String(sequence)
      .padStart(match[2].length, "0")
      .replace(/[0-9]/g, (digit) => digits[Number(digit)])}`;
  } while (existingNumbers.has(candidate));
  return candidate;
}

export async function listInvoices(): Promise<InvoiceRecord[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    const invoices = await new Promise<SavedInvoice[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as SavedInvoice[]);
      request.onerror = () => reject(request.error);
    });
    return invoices.sort((a, b) => b.id - a.id).map(summary);
  } finally {
    database.close();
  }
}

export async function getInvoice(
  id: number,
): Promise<SavedInvoice | undefined> {
  const database = await openDatabase();
  try {
    const request = database
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .get(id);
    return await new Promise((resolve, reject) => {
      request.onsuccess = () =>
        resolve(request.result as SavedInvoice | undefined);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export async function saveInvoice(
  values: InvoiceValues,
  id?: number,
): Promise<InvoiceRecord> {
  if (!values.number.trim() || !values.type.trim() || !values.date.trim()) {
    throw new Error("اطلاعات اصلی فاکتور کامل نیست.");
  }
  if (!values.buyer?.name?.trim()) {
    throw new Error("نام خریدار را وارد کنید.");
  }
  if (
    values.items.some(
      (item) =>
        !Number.isFinite(item.quantity) ||
        !Number.isFinite(item.unitPrice) ||
        item.quantity < 0 ||
        item.unitPrice < 0,
    )
  ) {
    throw new Error("مقادیر اقلام فاکتور معتبر نیست.");
  }
  const database = await openDatabase();
  try {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    return await new Promise((resolve, reject) => {
      let saved: InvoiceRecord | undefined;
      request.onsuccess = () => {
        const all = request.result as SavedInvoice[];
        const existing =
          id === undefined
            ? undefined
            : all.find((invoice) => invoice.id === id);
        if (id !== undefined && !existing) {
          transaction.abort();
          reject(new Error("فاکتور پیدا نشد."));
          return;
        }
        const payload: InvoiceValues = {
          ...values,
          number: uniqueNumber(values.number, all, id),
          discount: Number.isFinite(Number(values.discount))
            ? Math.max(0, Number(values.discount))
            : 0,
        };
        const record: SavedInvoice = {
          id: id ?? 0,
          number: payload.number,
          type: payload.type,
          date: payload.date,
          buyerName: payload.buyer.name,
          total: calculateTotals(
            payload.items,
            payload.discount,
            payload.taxEnabled,
          ).total,
          currency: payload.currency,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          payload,
        };
        const write =
          id === undefined
            ? (() => {
                const { id: _id, ...newRecord } = record;
                return store.add(newRecord);
              })()
            : store.put(record);
        write.onsuccess = () => {
          record.id = Number(write.result);
          saved = summary(record);
        };
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () =>
        saved ? resolve(saved) : reject(new Error("ذخیره فاکتور انجام نشد."));
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("ذخیره فاکتور انجام نشد."));
    });
  } finally {
    database.close();
  }
}

export async function deleteInvoice(id: number): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).delete(id);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("حذف فاکتور انجام نشد."));
    });
  } finally {
    database.close();
  }
}
