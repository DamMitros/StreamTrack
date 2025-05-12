import type { Metadata } from "next";
// import "./globals.css"; (kiedyś będzie)

import KeycloakProvider from "@/app/context/keycloakProvider";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Streamtrack",
  description: "Twoja aplikacja do śledzenia filmów i seriali",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="pl">
      <body>
        <KeycloakProvider>
          <Navigation />
            <main>
              {children}
            </main>
        </KeycloakProvider>
      </body>
    </html>
  );
}