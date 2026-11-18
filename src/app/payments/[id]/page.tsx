import type { Metadata } from "next";
import { PaymentDetails } from "@/components/payments/details/PaymentDetails";
import { pageTitle } from "@/lib/account";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: pageTitle(id, "Payments") };
}

export default async function PaymentPage({ params }: Props) {
  const { id } = await params;
  return <PaymentDetails id={decodeURIComponent(id)} />;
}
