import type { Metadata, Viewport } from "next";
import "./styles/globals.css";
import Navbar from "./components/Navbar";

const APP_NAME = "Eventos PWA";
const APP_DEFAULT_TITLE = "Eventos PWA";
const APP_TITLE_TEMPLATE = "%s | Eventos PWA";
const APP_DESCRIPTION = "App de eventos preparado para PWA, desktop e mobile.";

export const metadata: Metadata = {
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  themeColor: "#0A66FF",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#0A66FF"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0A66FF" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased flex flex-col">
        <Navbar />
        <main className="flex-1">
          {props.children}
        </main>
      </body>
    </html>
  );
}
