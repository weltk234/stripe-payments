import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/CustomersView";
import { pageTitle } from "@/lib/account";

export const metadata: Metadata = { title: pageTitle("Customers") };

export default function CustomersPage() {
  return <CustomersView />;
}
