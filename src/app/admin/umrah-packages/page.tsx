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
import { umrahPackages } from "@/lib/admin/mock-data";

const statusVariant = {
  active: "success" as const,
  draft: "warning" as const,
  archived: "muted" as const,
};

export default function AdminUmrahPackagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Umrah Packages"
        description="Create and manage Umrah travel packages."
        breadcrumbs={[{ label: "Umrah Packages" }]}
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            Add Package
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">ID</TableHead>
                <TableHead>Package Name</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {umrahPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="pl-4 font-mono text-xs">{pkg.id}</TableCell>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.destination}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell className="font-semibold">€{pkg.price.toLocaleString()}</TableCell>
                  <TableCell>{pkg.bookings}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[pkg.status]}>
                      {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
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
