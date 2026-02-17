import type { Metadata, Viewport} from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configurações para o iOS entender que é um App
export const metadata: Metadata = {
  title: "Minha Cabine de Fotos",
  description: "App de fotos incrível",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cabine App",
  },
  manifest: "/manifest.json",
};

// Configuração para garantir que o zoom não quebre o layout
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Faz o app ocupar a tela toda (atrás do notch)
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
        {children}
      </body>
    </html>
  );
}
