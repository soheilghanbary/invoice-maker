import { readFile } from "node:fs/promises";
import path from "node:path";
import { type Browser, chromium } from "playwright-core";
import {
  INVOICE_PRINT_CSS,
  renderInvoicePrintHtml,
} from "@/components/invoice/print-document";
import type { InvoiceValues } from "@/types/invoice";

export const maxDuration = 60;

const FONT_PATH = path.join(
  process.cwd(),
  "src",
  "assets",
  "fonts",
  "IRANSansXVF.woff2",
);

function safeFilename(values: InvoiceValues) {
  const clean = (value: string) =>
    value
      .replace(/[\\/:*?"<>|\p{Cc}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  return `${clean(values.type || "پیش فاکتور")} - ${clean(values.buyer.name || "مشتری") || "مشتری"}.pdf`;
}

function validStampUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".edgestore.dev") ||
        url.hostname.endsWith(".edgestore.app"))
    );
  } catch {
    return false;
  }
}

let fontFaceCssCache: string | undefined;

async function getFontFaceCss(): Promise<string> {
  if (fontFaceCssCache) return fontFaceCssCache;
  const buffer = await readFile(FONT_PATH);
  fontFaceCssCache = `@font-face{font-family:"IRANSansX";src:url(data:font/woff2;base64,${buffer.toString("base64")}) format("woff2");font-weight:100 900;font-style:normal;font-display:block;}`;
  return fontFaceCssCache;
}

// The browser is cached across invocations: on Vercel (fluid compute) and in
// long-running dev servers it is launched once and reused, so only the first
// request pays the cold-start cost.
let browserPromise: Promise<Browser> | undefined;

async function getBrowser(): Promise<Browser> {
  const existing = await browserPromise?.catch(() => undefined);
  if (existing?.isConnected()) return existing;
  browserPromise = launchBrowser();
  return browserPromise;
}

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL === "1") {
    const { default: chromiumBin } = await import("@sparticuz/chromium");
    // Required by @sparticuz/chromium for page.pdf() to work.
    chromiumBin.setGraphicsMode = false;
    return chromium.launch({
      headless: true,
      args: chromiumBin.args,
      executablePath: await chromiumBin.executablePath(),
    });
  }
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return chromium.launch({ headless: true, channel: "chrome" });
  }
}

async function buildDocumentHtml(values: InvoiceValues): Promise<string> {
  const body = renderInvoicePrintHtml(values);
  const fontFaceCss = await getFontFaceCss();
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <style>
      ${fontFaceCss}
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #ffffff; }
      body { font-family: "IRANSansX", "Segoe UI", Tahoma, sans-serif; }
      @page { size: A4 portrait; margin: 7mm; }
      #invoice-print {
        zoom: var(--invoice-print-scale, 1);
        width: var(--invoice-print-width, 100%);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      ${INVOICE_PRINT_CSS}
    </style>
  </head>
  <body>
    <div id="invoice-print">${body}</div>
  </body>
</html>`;
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 1_000_000) {
    return Response.json(
      { error: "حجم اطلاعات فاکتور بیش از حد مجاز است." },
      { status: 413 },
    );
  }

  let values: InvoiceValues;
  try {
    values = (await request.json()) as InvoiceValues;
  } catch {
    return Response.json(
      { error: "اطلاعات فاکتور معتبر نیست." },
      { status: 400 },
    );
  }

  if (
    !values ||
    typeof values !== "object" ||
    typeof values.type !== "string" ||
    typeof values.number !== "string" ||
    typeof values.date !== "string" ||
    !values.buyer ||
    typeof values.buyer.name !== "string" ||
    !Array.isArray(values.items) ||
    !validStampUrl(
      typeof values.stampPreview === "string" ? values.stampPreview : "",
    )
  ) {
    return Response.json(
      { error: "اطلاعات فاکتور برای ساخت PDF کامل نیست." },
      { status: 400 },
    );
  }

  let browser: Browser;
  try {
    browser = await getBrowser();
  } catch (error) {
    console.error("Invoice PDF browser launch failed:", error);
    browserPromise = undefined;
    return Response.json(
      {
        error: "ساخت فایل PDF انجام نشد. تنظیمات Playwright را بررسی کنید.",
      },
      { status: 500 },
    );
  }

  const context = await browser.newContext({
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
  });

  try {
    const page = await context.newPage();
    const html = await buildDocumentHtml(values);
    await page.setContent(html, { waitUntil: "load", timeout: 20_000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((image) =>
          image.decode().catch(() => undefined),
        ),
      );
      const sheet = document.querySelector<HTMLElement>("#invoice-print");
      if (!sheet) return;
      const availableHeight = ((297 - 14) * 96) / 25.4;
      const scale = Math.min(1.015, availableHeight / sheet.scrollHeight);
      sheet.style.setProperty("--invoice-print-scale", String(scale));
      sheet.style.setProperty("--invoice-print-width", `${100 / scale}%`);
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    const filename = safeFilename(values);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);
    return Response.json(
      {
        error: "ساخت فایل PDF انجام نشد. لطفاً دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  } finally {
    await context.close().catch(() => undefined);
  }
}
