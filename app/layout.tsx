import type { Metadata } from "next";
import "./globals.css";
import PWARegister from '@/components/ui/PWARegister'
import { PHProvider } from '@/components/ui/PosthogProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ConfirmProvider } from '@/components/ui/Confirm'
import GlobalSearch from '@/components/ui/GlobalSearch'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: "PRAIRON — Agroindustrial OS",
  description: "Sistema agroindustrial con IA nativa para gestión de fincas, animales y cultivos",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#036446" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="PRAIRON" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <I18nProvider>
        <PHProvider>
          {children}
          <GlobalSearch />
          <ToastProvider />
          <ConfirmProvider />
          <PWARegister />
        </PHProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
