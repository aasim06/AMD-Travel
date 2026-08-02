"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bookingStatusColors,
  bookingTypeLabels,
  type Booking,
} from "@/lib/admin/mock-data";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";

interface BookingsTableProps {
  bookings: Booking[];
  showViewAll?: boolean;
}

export function BookingsTable({ bookings, showViewAll = false }: BookingsTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Booking ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="pl-4 font-mono text-xs font-medium">
                {booking.id}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{booking.customer}</p>
                  <p className="text-xs text-muted-foreground">{booking.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{bookingTypeLabels[booking.type]}</Badge>
              </TableCell>
              <TableCell className="max-w-[160px] truncate">{booking.destination}</TableCell>
              <TableCell className="font-semibold">
                {booking.currency === "EUR" ? "€" : "$"}
                {booking.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant={bookingStatusColors[booking.status]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{booking.date}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showViewAll && (
        <div className="flex justify-center border-t p-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/bookings">
              View all bookings
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
