import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { topPerformingRoutes, bookingTypeLabels } from "@/lib/admin/mock-data";

export function AnalyticsRoutesTable() {
  const maxRevenue = Math.max(...topPerformingRoutes.map((r) => r.revenue));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Performing Routes</CardTitle>
        <CardDescription>Highest revenue routes and packages this period</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Route / Package</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Avg. Price</TableHead>
              <TableHead className="pr-4">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPerformingRoutes.map((route) => {
              const sharePct = Math.round((route.revenue / maxRevenue) * 100);
              return (
                <TableRow key={route.route}>
                  <TableCell className="pl-4 font-medium">{route.route}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {bookingTypeLabels[route.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{route.bookings}</TableCell>
                  <TableCell className="font-semibold">
                    €{route.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    €{route.avgPrice}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${sharePct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] text-muted-foreground">
                        {sharePct}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
