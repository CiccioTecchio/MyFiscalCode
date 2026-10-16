import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calcola codice fiscale",
  description: "Calcola il tuo codice fiscale online",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={roboto.className}>
      <AppRouterCacheProvider options={{ key: "css" }}>
        <body className="flex min-h-dvh flex-col bg-gradient-to-br from-[#7f9fb3] via-[#a9bdc4] to-[#d8cfbd]">
          <Navbar />
          <div className="flex flex-1">{children}</div>
          <Footer />
        </body>
      </AppRouterCacheProvider>
    </html>
  );
}
