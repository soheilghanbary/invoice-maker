import localFont from "next/font/local";

export const font = localFont({
  src: "./IRANSansXVF.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  preload: true,
});
