"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";
import { Save, Globe, Bell, Shield, Palette } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Configure your site, notifications, and admin preferences."
        breadcrumbs={[{ label: "Settings" }]}
        actions={
          <Button size="sm">
            <Save className="size-4" />
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="size-4" /> General</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="size-4" /> Security</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-4" /> Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic information about your travel website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input defaultValue={siteConfig.name} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input defaultValue={siteConfig.tagline} />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input defaultValue={siteConfig.contact.email} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue={siteConfig.contact.phone} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Locale Settings</CardTitle>
              <CardDescription>Currency and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input defaultValue={siteConfig.locale.defaultCurrency} />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Input defaultValue={siteConfig.locale.defaultLanguage} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New booking received", desc: "Get notified when a customer makes a booking" },
                { label: "Payment confirmed", desc: "Notification when a payment is successfully processed" },
                { label: "Visa application submitted", desc: "Alert when a new visa application is received" },
                { label: "Low inventory alert", desc: "Notify when package availability is running low" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 rounded border-gray-300 accent-primary" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <Button variant="outline" size="sm">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Branding</CardTitle>
              <CardDescription>Customize the look of your admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { name: "Light", active: true },
                  { name: "Dark", active: false },
                  { name: "System", active: false },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      theme.active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`mx-auto mb-2 size-12 rounded-lg ${theme.name === "Dark" ? "bg-slate-900" : "bg-white border"}`} />
                    <p className="text-sm font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
