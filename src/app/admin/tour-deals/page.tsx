import { Plus, MoreHorizontal, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tourDeals } from "@/lib/admin/mock-data";

const statusVariant = {
  active: "success" as const,
  draft: "warning" as const,
  archived: "muted" as const,
};

export default function AdminTourDealsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tour Deals"
        description="Manage tour packages and promotional deals."
        breadcrumbs={[{ label: "Tour Deals" }]}
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            Add Tour Deal
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">ID</TableHead>
                <TableHead>Tour Name</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tourDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="pl-4 font-mono text-xs">{deal.id}</TableCell>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.destination}</TableCell>
                  <TableCell>{deal.duration}</TableCell>
                  <TableCell className="font-semibold">€{deal.price.toLocaleString()}</TableCell>
                  <TableCell>{deal.bookings}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[deal.status]}>
                      {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm"><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
