import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
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
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

const payments = [
  { id: "PAY-001", booking: "BK-2024-1847", customer: "Ahmed Hassan", amount: 2499, method: "Visa", status: "completed" as const, date: "2026-08-02" },
  { id: "PAY-002", booking: "BK-2024-1846", customer: "Sarah Johnson", amount: 689, method: "Mastercard", status: "pending" as const, date: "2026-08-02" },
  { id: "PAY-003", booking: "BK-2024-1845", customer: "Mohammed Ali", amount: 189, method: "PayPal", status: "completed" as const, date: "2026-08-01" },
  { id: "PAY-004", booking: "BK-2024-1842", customer: "Aisha Rahman", amount: 1120, method: "Visa", status: "refunded" as const, date: "2026-07-31" },
  { id: "PAY-005", booking: "BK-2024-1840", customer: "Emily Chen", amount: 4599, method: "Amex", status: "pending" as const, date: "2026-07-30" },
];

const statusConfig = {
  completed: { variant: "success" as const, icon: CheckCircle },
  pending: { variant: "warning" as const, icon: Clock },
  refunded: { variant: "destructive" as const, icon: XCircle },
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Track and manage all payment transactions."
        breadcrumbs={[{ label: "Payments" }]}
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Export Report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Processed" value="€284,520" change={12.5} changeLabel="this month" icon={<CreditCard className="size-5" />} />
        <StatCard label="Pending Payments" value="€5,288" change={-2.1} changeLabel="awaiting" icon={<Clock className="size-5" />} />
        <StatCard label="Refunded" value="€1,120" change={0.5} changeLabel="this month" icon={<XCircle className="size-5" />} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Payment ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const config = statusConfig[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="pl-4 font-mono text-xs">{payment.id}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.booking}</TableCell>
                    <TableCell className="font-medium">{payment.customer}</TableCell>
                    <TableCell className="font-semibold">€{payment.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{payment.method}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
