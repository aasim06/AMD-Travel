"use client";

import { useState } from "react";
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = { name: "", email: "", phone: "", subject: "", message: "" };

const SUBJECTS = [
  "Flight Booking Inquiry",
  "Visa Application Support",
  "Umrah Package Inquiry",
  "Tour Package Inquiry",
  "Booking Cancellation / Refund",
  "General Inquiry",
  "Other",
];

function Field({ label, required = false, children, error }: {
  label: string; required?: boolean;
  children: React.ReactNode; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim())    e.name    = "Full name is required";
    if (!form.email.trim())   e.email   = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.subject)        e.subject = "Please select a subject";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-800">Message Sent!</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Thank you for reaching out. Our team will get back to you within 24 hours.
          </p>
        </div>
        <Button variant="outline" onClick={() => { setForm(EMPTY); setSubmitted(false); }}
          className="mt-1 rounded-xl h-10 px-6 gap-2 text-sm font-semibold">
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={e => { e.preventDefault(); if (validate()) setSubmitted(true); }}
      className="space-y-5">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Name" required error={errors.name}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              className={cn("h-11 rounded-xl pl-9", errors.name && "border-rose-400 ring-1 ring-rose-300")}
              placeholder="Your full name"
              value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="email"
              className={cn("h-11 rounded-xl pl-9", errors.email && "border-rose-400 ring-1 ring-rose-300")}
              placeholder="you@example.com"
              value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Phone Number">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              className="h-11 rounded-xl pl-9"
              placeholder="+49 179 000 0000"
              value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
        </Field>

        <Field label="Subject" required error={errors.subject}>
          <Select value={form.subject} onValueChange={v => set("subject", v)}>
            <SelectTrigger className={cn("h-11 w-full rounded-xl text-sm", errors.subject && "border-rose-400 ring-1 ring-rose-300")}>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Message" required error={errors.message}>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <Textarea
            className={cn("rounded-xl pl-9 min-h-[140px] resize-none text-sm", errors.message && "border-rose-400 ring-1 ring-rose-300")}
            placeholder="Tell us how we can help you..."
            value={form.message} onChange={e => set("message", e.target.value)} />
        </div>
      </Field>

      <Button type="submit"
        className="w-full h-11 rounded-xl gap-2 text-sm font-semibold shadow-sm shadow-primary/25">
        <Send className="h-4 w-4" />
        Send Message
      </Button>
    </form>
  );
}
