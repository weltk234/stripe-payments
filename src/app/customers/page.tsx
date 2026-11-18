import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/CustomersView";

export const metadata: Metadata = { title: "Customers – cramly.ai – Stripe" };

export default function CustomersPage() {
  return <CustomersView />;
}
