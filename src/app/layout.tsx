import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { TooltipProvider } from "@/components/ui/Tooltip";
import "./globals.css";
import { pageTitle } from "@/lib/account";

export const metadata: Metadata = {
  title: pageTitle("Payments"),
  description: "Stripe Dashboard Payments screen rebuilt with Next.js and TypeScript.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-white px-3 py-2 text-[14px] font-medium text-brand-text shadow-[var(--shadow-popover)] focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <TooltipProvider delayDuration={300} skipDelayDuration={100}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Suspense fallback={<div className="h-14" />}>
                <TopBar />
              </Suspense>
              <main id="main" className="min-w-0 flex-1 px-10">
                {children}
              </main>
            </div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
