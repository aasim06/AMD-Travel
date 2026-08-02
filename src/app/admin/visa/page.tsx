import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
import { visaApplications } from "@/lib/admin/mock-data";
import { Eye, MoreHorizontal } from "lucide-react";

const statusVariant = {
  processing: "warning" as const,
  approved: "success" as const,
  rejected: "destructive" as const,
  pending: "outline" as const,
};

export default function AdminVisaPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Visa Applications"
        description="Review and process visa applications from customers."
        breadcrumbs={[{ label: "Visa Applications" }]}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: visaApplications.length, variant: "outline" as const },
          { label: "Processing", value: visaApplications.filter((v) => v.status === "processing").length, variant: "warning" as const },
          { label: "Approved", value: visaApplications.filter((v) => v.status === "approved").length, variant: "success" as const },
          { label: "Rejected", value: visaApplications.filter((v) => v.status === "rejected").length, variant: "destructive" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-heading text-2xl font-bold">{stat.value}</p>
              </div>
              <Badge variant={stat.variant}>{stat.label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Visa Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visaApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="pl-4 font-mono text-xs">{app.id}</TableCell>
                  <TableCell className="font-medium">{app.applicant}</TableCell>
                  <TableCell>{app.country}</TableCell>
                  <TableCell>{app.visaType}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[app.status]}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{app.submittedAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm"><Eye className="size-3.5" /></Button>
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
