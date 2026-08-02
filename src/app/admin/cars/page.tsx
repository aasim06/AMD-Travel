import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const cars = [
  { id: "CR-001", name: "Toyota Camry", category: "Economy", location: "Dubai Airport", price: 45, status: "available" as const },
  { id: "CR-002", name: "BMW 5 Series", category: "Luxury", location: "Dubai Airport", price: 120, status: "available" as const },
  { id: "CR-003", name: "Mercedes V-Class", category: "Van", location: "Abu Dhabi", price: 95, status: "rented" as const },
  { id: "CR-004", name: "Hyundai Tucson", category: "SUV", location: "Dubai Marina", price: 65, status: "available" as const },
  { id: "CR-005", name: "Range Rover Sport", category: "Premium SUV", location: "Dubai Airport", price: 180, status: "maintenance" as const },
];

const statusVariant = {
  available: "success" as const,
  rented: "warning" as const,
  maintenance: "destructive" as const,
};

export default function AdminCarsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Car Rentals"
        description="Manage rental fleet and availability."
        breadcrumbs={[{ label: "Car Rentals" }]}
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            Add Vehicle
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Card key={car.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading font-semibold">{car.name}</p>
                  <p className="text-xs text-muted-foreground">{car.category} · {car.location}</p>
                </div>
                <Badge variant={statusVariant[car.status]}>
                  {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-heading text-lg font-bold">€{car.price}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
                <span className="font-mono text-[10px] text-muted-foreground">{car.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
