import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calcola codice fiscale",
  description:
    "Calcola il tuo codice fiscale online, senza tracker e senza ads!",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={roboto.className}>
      <body className="flex min-h-dvh flex-col bg-linear-to-br from-[#7f9fb3] via-[#a9bdc4] to-[#d8cfbd]">
        <AppRouterCacheProvider options={{ key: "css" }}>
          <NextIntlClientProvider>
            <Navbar />
            <div className="flex flex-1">{children}</div>
            <Footer />
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
