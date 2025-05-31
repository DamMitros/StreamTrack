import type { Metadata } from "next";
import '@/app/globals.css';

import KeycloakProvider from "@/context/keycloakProvider";
import { Navigation } from "@/components/navigation";
import { NotificationProvider } from "@/context/NotificationContext";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Streamtrack",
  description: "Twoja aplikacja do śledzenia filmów i seriali",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script src="/env.js" defer></script>
      </head>
      <body className={inter.className}>
        <KeycloakProvider>
          <NotificationProvider>
            <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
              <Navigation />
              <main className="flex flex-col min-h-screen">
                {children}
              </main>
            </div>
          </NotificationProvider>
        </KeycloakProvider>
      </body>
    </html>
  );
}