import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientOverlays from "@/components/ClientOverlays";
import { Toaster } from "react-hot-toast";
import { ADULT_CONSENT_COOKIE, isAdultConsentTimestampValid } from "@/utils/consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kenyan Escorts | Sexy Call Girls | Erotic Services | Kenyan Prostitutes | Massage and spa | Alchemyst",
  description: "Discover verified escorts in Kenya, hot & sexy call girls, prostitutes, erotic services in nairobi, luxury spas and massage parlors. Direct contacts, no hook-up fees. Premium adult services in Nairobi, Kisumu, Mombasa & across Kenya. Discreet & independent.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialShowConsent = !isAdultConsentTimestampValid(
    cookieStore.get(ADULT_CONSENT_COOKIE)?.value
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <div className="flex flex-col min-h-screen bg-slate-900">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4500,
              }}
            />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ClientOverlays initialShowConsent={initialShowConsent} />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
