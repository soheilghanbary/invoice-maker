export type InvoiceItem = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceParty = {
  name: string;
  phone: string;
  address: string;
  postalCode: string;
  nationalId: string;
  economicCode: string;
};

export type InvoiceValues = {
  type: string;
  number: string;
  date: string;
  currency: "تومان" | "ریال";
  seller: InvoiceParty;
  buyer: InvoiceParty;
  items: InvoiceItem[];
  notes: string;
  stampPreview: string;
  discount: number;
  taxEnabled: boolean;
};

export type InvoiceRecord = {
  id: number;
  number: string;
  type: string;
  date: string;
  buyerName: string;
  total: number;
  currency: "تومان" | "ریال";
  createdAt: string;
};

export type SavedInvoice = InvoiceRecord & { payload: InvoiceValues };
