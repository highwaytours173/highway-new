"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  ShoppingBag,
  Newspaper,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/types";

interface CustomerDetailsClientProps {
  customer: Customer;
}

export function CustomerDetailsClient({ customer }: CustomerDetailsClientProps) {
  const customerNameInitial = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to customers</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customer.totalSpent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.posts?.length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Customer&apos;s personal and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                <AvatarFallback className="text-lg">
                  {customerNameInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{customer.name}</p>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  {customer.email}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Status</span>
                <Badge
                  variant={
                    customer.status === "active" ? "default" : "secondary"
                  }
                >
                  {customer.status || "Unknown"}
                </Badge>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Joined</span>
                <span>{format(new Date(customer.createdAt), "PPP")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Last Active</span>
                <span>{format(new Date(customer.lastActive || customer.createdAt), "PPP")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            A history of bookings made by this customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customer.bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                      {booking.bookingItems[0]?.tours?.name || "Unknown Tour"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.bookingDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>${booking.totalPrice}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No bookings found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




