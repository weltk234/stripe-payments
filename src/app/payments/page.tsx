import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsView } from "@/components/payments/PaymentsView";
import { pageTitle } from "@/lib/account";

export const metadata: Metadata = { title: pageTitle("Payments") };

export default function PaymentsPage() {
  // PaymentsView reads the URL (useSearchParams) and formats dates in the
  // viewer's time zone, so it renders on the client.
  return (
    <Suspense fallback={<div className="h-[600px]" aria-busy="true" />}>
      <PaymentsView />
    </Suspense>
  );
}
