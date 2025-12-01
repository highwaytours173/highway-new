import { getCustomerById } from "@/lib/supabase/customers";
import { notFound } from "next/navigation";
import { CustomerDetailsClient } from "./customer-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return notFound();
  }

  return <CustomerDetailsClient customer={customer} />;
}
