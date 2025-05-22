import type { Metadata } from "next";
import '@/app/globals.css';

import KeycloakProvider from "@/app/context/keycloakProvider";
import { ThemeProvider } from "@/app/context/themeProvider";
import { Navigation } from "@/components/navigation";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Streamtrack",
  description: "Twoja aplikacja do śledzenia filmów i seriali",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <KeycloakProvider>
          <ThemeProvider>
            <Navigation />
            <main className="container mx-auto p-4">
              {children}
            </main>
          </ThemeProvider>
        </KeycloakProvider>
      </body>
    </html>
  );
}