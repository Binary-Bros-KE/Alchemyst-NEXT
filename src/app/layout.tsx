import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientOverlays from "@/components/ClientOverlays";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alchemyst - Kenya's Number One Erotic Services Directory",
  description: "Discover Kenya's premier directory for erotic services. Hot Sexy Escorts, Erotic Massauses and Spa's and OF-Models. Browse hundreds of profile and find exactly what you are looking for!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <ClientOverlays />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
