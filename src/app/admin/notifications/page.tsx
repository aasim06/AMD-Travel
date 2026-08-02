import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BookOpen, CreditCard, FileText, Settings, CheckCheck } from "lucide-react";

const notifications = [
  { id: 1, type: "booking", title: "New booking received", message: "Ahmed Hassan booked Economy Umrah Package for €2,499", time: "2 min ago", read: false, icon: BookOpen },
  { id: 2, type: "visa", title: "Visa application pending review", message: "Mohammed Ali submitted a Saudi Arabia Umrah Visa application", time: "15 min ago", read: false, icon: FileText },
  { id: 3, type: "payment", title: "Payment confirmed", message: "Sarah Johnson's payment of €689 has been processed successfully", time: "1 hour ago", read: false, icon: CreditCard },
  { id: 4, type: "system", title: "System update available", message: "A new version of the admin panel is available for installation", time: "3 hours ago", read: true, icon: Settings },
  { id: 5, type: "booking", title: "Booking cancelled", message: "Aisha Rahman cancelled flight booking BK-2024-1842", time: "5 hours ago", read: true, icon: BookOpen },
  { id: 6, type: "payment", title: "Refund processed", message: "Refund of €1,120 issued to Aisha Rahman for cancelled booking", time: "6 hours ago", read: true, icon: CreditCard },
];

export default function AdminNotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notifications.`}
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          <Button variant="outline" size="sm">
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`transition-all hover:shadow-sm ${!notif.read ? "border-primary/20 bg-primary/[0.02]" : ""}`}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${!notif.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <notif.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{notif.title}</p>
                  {!notif.read && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">New</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{notif.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{notif.time}</p>
              </div>
              <Bell className={`size-4 shrink-0 ${!notif.read ? "text-primary" : "text-muted-foreground/40"}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
