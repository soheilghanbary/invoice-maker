import serverlessChromium from "@sparticuz/chromium";
import type { Browser, BrowserContext } from "playwright-core";
import { chromium as playwrightChromium } from "playwright-core";
import type { InvoiceValues } from "@/types/invoice";

export const runtime = "nodejs";
export const maxDuration = 60;

const databaseName = "factorino-invoices";
const storeName = "invoices";

const isVercel = process.env.VERCEL === "1";

function safeFilename(values: InvoiceValues) {
  const clean = (value: string) =>
    value
      .replace(/[\\/:*?"<>|\p{Cc}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  return `${clean(values.type || "پیش فاکتور")} - ${
    clean(values.buyer.name || "مشتری") || "مشتری"
  }.pdf`;
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

function pdfBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_URL;

  if (configured) {
    return new URL(configured).origin;
  }

  const requestUrl = new URL(request.url);

  if (
    !isVercel &&
    ["localhost", "127.0.0.1", "::1"].includes(requestUrl.hostname)
  ) {
    return requestUrl.origin;
  }

  throw new Error("NEXT_PUBLIC_URL must be configured for PDF rendering.");
}

async function launchBrowser(): Promise<Browser> {
  if (isVercel) {
    const executablePath = await serverlessChromium.executablePath();

    return playwrightChromium.launch({
      args: serverlessChromium.args,
      executablePath,
      headless: true,
    });
  }

  return playwrightChromium.launch({
    headless: true,
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > 1_000_000) {
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

  let browser: Browser | undefined;
  let context: BrowserContext | undefined;

  try {
    const baseUrl = pdfBaseUrl(request);

    browser = await launchBrowser();

    context = await browser.newContext({
      locale: "fa-IR",
      timezoneId: "Asia/Tehran",
    });

    const page = await context.newPage();

    // فقط درخواست‌های موردنیاز فاکتور مجاز هستند.
    await page.route("**/*", async (route) => {
      const url = route.request().url();

      const isInternal = url.startsWith(`${baseUrl}/`);
      const isData = url.startsWith("data:") || url.startsWith("blob:");
      const isStamp =
        Boolean(values.stampPreview) && url === values.stampPreview;

      if (isInternal || isData || isStamp) {
        await route.continue();
      } else {
        await route.abort();
      }
    });

    // بارگذاری اولیه برنامه
    await page.goto(`${baseUrl}/invoice`, {
      waitUntil: "domcontentloaded",
      timeout: 20_000,
    });

    // ثبت اطلاعات فاکتور در IndexedDB
    await page.evaluate(
      ({ id, record, dbName, objectStore }) =>
        new Promise<void>((resolve, reject) => {
          const open = indexedDB.open(dbName, 1);

          open.onupgradeneeded = () => {
            if (!open.result.objectStoreNames.contains(objectStore)) {
              open.result.createObjectStore(objectStore, {
                keyPath: "id",
                autoIncrement: true,
              });
            }
          };

          open.onerror = () => reject(open.error);

          open.onsuccess = () => {
            const db = open.result;

            if (!db.objectStoreNames.contains(objectStore)) {
              db.close();
              reject(new Error("Invoice object store not found."));
              return;
            }

            const transaction = db.transaction(objectStore, "readwrite");

            transaction.objectStore(objectStore).put({
              ...record,
              id,
            });

            transaction.oncomplete = () => {
              db.close();
              resolve();
            };

            transaction.onerror = () => {
              db.close();
              reject(transaction.error);
            };

            transaction.onabort = () => {
              db.close();
              reject(transaction.error);
            };
          };
        }),
      {
        id: 1,
        dbName: databaseName,
        objectStore: storeName,
        record: {
          number: values.number,
          type: values.type,
          date: values.date,
          buyerName: values.buyer.name,
          total: 0,
          currency: values.currency,
          createdAt: new Date().toISOString(),
          payload: values,
        },
      },
    );

    // باز کردن پیش‌نمایش فاکتور
    await page.goto(`${baseUrl}/invoice?id=1&preview=1`, {
      waitUntil: "domcontentloaded",
      timeout: 20_000,
    });

    const invoice = page.locator("#invoice-print");

    await invoice.waitFor({
      state: "visible",
      timeout: 20_000,
    });

    // اطمینان از تکمیل رندر فاکتور
    await page.waitForFunction(
      () => {
        const node = document.querySelector("#invoice-print");

        return Boolean(
          node?.textContent?.trim() &&
            !document.querySelector("#invoice-app .animate-pulse") &&
            !document.querySelector("#invoice-app .animate-spin"),
        );
      },
      undefined,
      { timeout: 20_000 },
    );

    // بارگذاری فونت‌ها و تصاویر و تنظیم مقیاس A4
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

    // تولید PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "7mm",
        right: "7mm",
        bottom: "7mm",
        left: "7mm",
      },
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
        error:
          "ساخت فایل PDF انجام نشد. تنظیمات Playwright و آدرس برنامه را بررسی کنید.",
      },
      { status: 500 },
    );
  } finally {
    // آزادسازی منابع حتی در صورت بروز خطا
    try {
      await context?.close();
    } catch (error) {
      console.error("Browser context close failed:", error);
    }

    try {
      await browser?.close();
    } catch (error) {
      console.error("Browser close failed:", error);
    }
  }
}
