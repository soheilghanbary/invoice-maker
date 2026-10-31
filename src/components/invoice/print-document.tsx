import {
  calculateTotals,
  formatCount,
  formatInvoiceDate,
  formatMoney,
} from "@/components/invoice/model";
import type { InvoiceValues } from "@/types/invoice";

/**
 * Self-contained CSS for the printable invoice document. Used by the
 * on-screen preview (injected via <style>) and by the PDF route
 * (inlined into a static HTML shell), so both share one source of truth.
 */
export const INVOICE_PRINT_CSS = `
.inv-doc {
  text-align: right;
  color: #1e293b;
  font-size: 12px;
  line-height: 1.6;
}
.inv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 2px solid rgba(12, 74, 110, 0.1);
  padding-bottom: 20px;
}
.inv-meta {
  flex-shrink: 0;
  text-align: left;
}
.inv-meta-label {
  margin: 0;
  font-size: 10px;
  color: #64748b;
}
.inv-number {
  margin: 2px 0 0;
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #0369a1;
}
.inv-date {
  margin: 6px 0 0;
  font-size: 11px;
  color: #64748b;
}
.inv-date-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #334155;
}
.inv-title {
  margin: 0;
  min-width: 0;
  font-size: 26px;
  line-height: 36px;
  font-weight: 900;
  letter-spacing: -0.025em;
  color: #0c4a6e;
}
.inv-parties {
  margin: 20px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.inv-party {
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 0.675rem;
  padding: 14px;
  break-inside: avoid;
}
.inv-party-title {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  color: #0369a1;
}
.inv-party-name {
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 800;
  color: #0c4a6e;
}
.inv-party-details {
  margin: 10px 0 0;
  padding: 0;
  font-size: 11px;
  line-height: 20px;
}
.inv-party-details > div {
  display: flex;
  gap: 8px;
}
.inv-party-details dt {
  flex-shrink: 0;
  color: #64748b;
}
.inv-party-details dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: break-word;
  color: #334155;
}
.inv-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: right;
  font-size: 12px;
}
.inv-table th,
.inv-table td {
  vertical-align: top;
}
.inv-table thead th {
  background: #0369a1;
  color: #ffffff;
  font-weight: 700;
  padding: 10px;
}
.inv-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  break-inside: avoid;
}
.inv-table td {
  padding: 14px 10px;
}
.inv-col-row { width: 7%; }
.inv-col-desc { width: 41%; }
.inv-col-qty { width: 12%; }
.inv-col-unit { width: 20%; }
.inv-col-total { width: 20%; }
.inv-cell-row {
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: #94a3b8;
}
.inv-cell-qty,
.inv-cell-unit {
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.inv-cell-total {
  text-align: center;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.inv-empty-row td {
  padding: 32px 12px;
  text-align: center;
  color: #94a3b8;
}
.inv-item-name {
  font-weight: 700;
  color: #0c4a6e;
}
.inv-item-desc {
  display: block;
  margin-top: 4px;
  line-height: 20px;
  color: #64748b;
}
.inv-bottom {
  margin-top: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
}
.inv-totals {
  width: 78mm;
  flex-shrink: 0;
  font-size: 12px;
}
.inv-totals-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 0;
}
.inv-totals-row > span:first-child {
  color: #64748b;
}
.inv-totals-row > span:last-child {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #334155;
}
.inv-grand-total {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.54rem;
  background: #0369a1;
  color: #ffffff;
  padding: 10px 12px;
}
.inv-grand-total-label {
  font-size: 12px;
  font-weight: 700;
}
.inv-grand-total-value {
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.inv-extras {
  flex: 1;
  min-width: 0;
  max-width: 90mm;
}
.inv-notes {
  border: 1px solid #cbd5e1;
  border-radius: 0.675rem;
  padding: 12px;
  font-size: 12px;
  line-height: 20px;
  break-inside: avoid;
}
.inv-notes-title {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #0c4a6e;
}
.inv-notes-text {
  margin: 4px 0 0;
  white-space: pre-wrap;
  color: #64748b;
}
.inv-signature {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 30mm;
  border: 1px dashed #94a3b8;
  border-radius: 0.675rem;
  padding: 12px;
  font-size: 10px;
  color: #64748b;
}
.inv-signature.has-notes {
  margin-top: 12px;
}
.inv-stamp {
  margin-bottom: 8px;
  max-height: 22mm;
  max-width: 22mm;
  object-fit: contain;
}
.inv-footer {
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  text-align: center;
  font-size: 10px;
  color: #64748b;
}
@media (max-width: 640px) {
  .inv-header {
    gap: 12px;
    padding-bottom: 16px;
  }
  .inv-number {
    font-size: 14px;
  }
  .inv-title {
    font-size: 20px;
    line-height: 28px;
  }
  .inv-parties {
    margin: 16px 0;
    gap: 8px;
  }
  .inv-table {
    font-size: 10px;
  }
  .inv-table thead th,
  .inv-table td {
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .inv-pad-wide {
    padding-left: 4px;
    padding-right: 10px;
  }
  .inv-pad-thin {
    padding-left: 2px;
    padding-right: 4px;
  }
  .inv-col-row { width: 9%; }
  .inv-col-desc { width: 33%; }
  .inv-col-qty { width: 13%; }
  .inv-col-unit { width: 22.5%; }
  .inv-col-total { width: 22.5%; }
  .inv-bottom {
    margin-top: 16px;
    flex-direction: column;
    gap: 16px;
  }
  .inv-totals {
    width: 100%;
  }
  .inv-extras {
    max-width: none;
  }
  .inv-footer {
    margin-top: 16px;
  }
}
@media print {
  .inv-bottom {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
  }
}
`;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function partyCardHtml(title: string, party: InvoiceValues["seller"]): string {
  const details = [
    ["شماره تماس", party.phone],
    ["آدرس", party.address],
    ["کدپستی", party.postalCode],
    ["شناسه ملی / شماره ملی", party.nationalId],
    ["شماره اقتصادی", party.economicCode],
  ].filter(([, value]) => Boolean(value));

  const detailsHtml = details
    .map(
      ([label, value]) =>
        `<div><dt>${escapeHtml(label)}:</dt><dd>${escapeHtml(value)}</dd></div>`,
    )
    .join("");

  return `<section class="inv-party">
  <h3 class="inv-party-title">${escapeHtml(title)}</h3>
  <p class="inv-party-name">${escapeHtml(party.name || "—")}</p>
  ${details.length > 0 ? `<dl class="inv-party-details">${detailsHtml}</dl>` : ""}
</section>`;
}

function itemsTableHtml(
  items: InvoiceValues["items"],
  currency: InvoiceValues["currency"],
): string {
  const visibleItems = items.filter(
    (item) =>
      item.name.trim() || item.description.trim() || Number(item.unitPrice) > 0,
  );

  const rows = visibleItems.map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return `<tr>
  <td class="inv-cell-row inv-pad-thin">${formatCount(index + 1)}</td>
  <td class="inv-pad-wide"><span class="inv-item-name">${escapeHtml(item.name || "بدون عنوان")}</span>${item.description ? `<span class="inv-item-desc">${escapeHtml(item.description)}</span>` : ""}</td>
  <td class="inv-cell-qty inv-pad-thin">${formatMoney(quantity)}</td>
  <td class="inv-cell-unit inv-pad-thin">${formatMoney(unitPrice)}</td>
  <td class="inv-cell-total inv-pad-wide">${formatMoney(quantity * unitPrice)}</td>
</tr>`;
  });

  const body =
    rows.length > 0
      ? rows.join("\n")
      : `<tr class="inv-empty-row"><td colspan="5">هنوز کالایی به فاکتور اضافه نشده است</td></tr>`;

  return `<table class="inv-table">
  <colgroup>
    <col class="inv-col-row" />
    <col class="inv-col-desc" />
    <col class="inv-col-qty" />
    <col class="inv-col-unit" />
    <col class="inv-col-total" />
  </colgroup>
  <thead>
    <tr>
      <th class="inv-pad-thin">ردیف</th>
      <th class="inv-pad-wide">شرح کالا / خدمات</th>
      <th class="inv-pad-thin">تعداد</th>
      <th class="inv-pad-thin">قیمت واحد (${escapeHtml(currency)})</th>
      <th class="inv-pad-wide">مبلغ کل (${escapeHtml(currency)})</th>
    </tr>
  </thead>
  <tbody>
    ${body}
  </tbody>
</table>`;
}

/**
 * The full invoice document as an HTML fragment. Callers provide the
 * #invoice-print wrapper element and the INVOICE_PRINT_CSS stylesheet.
 * All user-provided values are HTML-escaped.
 */
export function renderInvoicePrintHtml(values: InvoiceValues): string {
  const { subtotal, discount, tax, total } = calculateTotals(
    values.items,
    values.discount,
    values.taxEnabled,
  );

  const totalsRow = (label: string, value: string) =>
    `<div class="inv-totals-row"><span>${escapeHtml(label)}</span><span>${value}</span></div>`;

  const stampHtml = values.stampPreview
    ? `<img src="${escapeHtml(values.stampPreview)}" alt="مهر یا امضای فروشنده" class="inv-stamp" draggable="false" />`
    : "";

  return `<header class="inv-header">
  <div class="inv-meta">
    <p class="inv-meta-label">شماره فاکتور</p>
    <p class="inv-number">${escapeHtml(values.number || "—")}</p>
    <p class="inv-date">تاریخ صدور: <span class="inv-date-value">${escapeHtml(formatInvoiceDate(values.date))}</span></p>
  </div>
  <h1 class="inv-title">${escapeHtml(values.type || "فاکتور فروش")}</h1>
</header>

<div class="inv-parties">
  ${partyCardHtml("فروشنده", values.seller)}
  ${partyCardHtml("خریدار", values.buyer)}
</div>

${itemsTableHtml(values.items, values.currency)}

<div class="inv-bottom">
  <div class="inv-totals">
    ${totalsRow("جمع جزء", `${formatMoney(subtotal)} ${escapeHtml(values.currency)}`)}
    ${discount > 0 ? totalsRow("تخفیف", `− ${formatMoney(discount)} ${escapeHtml(values.currency)}`) : ""}
    ${values.taxEnabled ? totalsRow("مالیات بر ارزش افزوده (۱۰٪)", `${formatMoney(tax)} ${escapeHtml(values.currency)}`) : ""}
    <div class="inv-grand-total">
      <span class="inv-grand-total-label">مبلغ قابل پرداخت</span>
      <span class="inv-grand-total-value">${formatMoney(total)} ${escapeHtml(values.currency)}</span>
    </div>
  </div>
  <div class="inv-extras">
    ${values.notes ? `<section class="inv-notes"><h3 class="inv-notes-title">توضیحات</h3><p class="inv-notes-text">${escapeHtml(values.notes)}</p></section>` : ""}
    <div class="${values.notes ? "inv-signature has-notes" : "inv-signature"}">
      ${stampHtml}
      <span>مهر و امضای فروشنده</span>
    </div>
  </div>
</div>

<footer class="inv-footer">از اعتماد شما سپاسگزاریم.</footer>`;
}
