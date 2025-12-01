"use server";
import { createClient } from "./server";
import type { Customer } from "@/types";

type DbCustomer = {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  total_bookings: number | null;
  total_spent: number | null;
  created_at: string | null;
};

function toCustomer(row: DbCustomer): Customer {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? row.email,
    source: (row.source as Customer["source"]) ?? "Booking",
    totalBookings: row.total_bookings ?? 0,
    totalSpent: row.total_spent ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    bookings: [],
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(
        "id, email, name, source, total_bookings, total_spent, created_at",
      );
      
    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    
    return (data as DbCustomer[]).map(toCustomer);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Unexpected error fetching customers:", err);
    return [];
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(
        "id, email, name, source, total_bookings, total_spent, created_at",
      )
      .eq("id", id)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching customer by id:", error);
      return null;
    }
    
    if (!data) return null;
    
    const customer = toCustomer(data as DbCustomer);

    // Fetch bookings for this customer
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        *,
        booking_items (
          *,
          tours (
            name,
            slug
          )
        )
      `)
      .eq("customer_email", customer.email)
      .order("created_at", { ascending: false });

    if (!bookingsError && bookingsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customer.bookings = bookingsData.map((b: any) => ({
        id: b.id,
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        phoneNumber: b.phone_number,
        nationality: b.nationality,
        bookingDate: b.created_at, // using created_at as booking date
        totalPrice: b.total_price,
        status: b.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bookingItems: b.booking_items.map((item: any) => ({
          id: item.id,
          bookingId: item.booking_id,
          tourId: item.tour_id,
          upsellItemId: item.upsell_item_id,
          adults: item.adults,
          children: item.children,
          price: item.price,
          tours: item.tours,
        })),
      }));
    }
    
    return customer;
  } catch (err) {
    console.error("Unexpected error fetching customer by id:", err);
    return null;
  }
}