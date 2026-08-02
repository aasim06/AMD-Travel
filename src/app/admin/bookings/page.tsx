import { Plus, Download, Filter } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BookingsTable } from "@/components/admin/bookings-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allBookings } from "@/lib/admin/mock-data";

export default function AdminBookingsPage() {
  const confirmed = allBookings.filter((b) => b.status === "confirmed");
  const pending = allBookings.filter((b) => b.status === "pending");
  const cancelled = allBookings.filter((b) => b.status === "cancelled");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bookings"
        description="Manage and track all customer bookings across services."
        breadcrumbs={[{ label: "Bookings" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
              Add Booking
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input placeholder="Search by ID, customer, or destination..." className="sm:max-w-sm" />
            <Button variant="outline" size="sm" className="sm:ml-auto">
              <Filter className="size-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({allBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card><CardContent className="p-0"><BookingsTable bookings={allBookings} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="confirmed" className="mt-4">
          <Card><CardContent className="p-0"><BookingsTable bookings={confirmed} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card><CardContent className="p-0"><BookingsTable bookings={pending} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          <Card><CardContent className="p-0"><BookingsTable bookings={cancelled} /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
