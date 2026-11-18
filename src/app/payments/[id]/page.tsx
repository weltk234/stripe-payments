import type { Metadata } from "next";
import { PaymentDetails } from "@/components/payments/details/PaymentDetails";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} – Payments – cramly.ai – Stripe` };
}

export default async function PaymentPage({ params }: Props) {
  const { id } = await params;
  return <PaymentDetails id={decodeURIComponent(id)} />;
}
