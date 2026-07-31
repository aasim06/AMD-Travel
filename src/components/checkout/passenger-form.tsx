"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parse } from "date-fns";
import { User, Mail, CalendarIcon } from "lucide-react";

import { checkoutSchema, type CheckoutData } from "./types";

import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PhoneCodeSelect } from "@/components/ui/phone-code-select";
import { CountrySelect } from "@/components/ui/country-select";
import { cn } from "@/lib/utils";

const TITLES = ["Mr", "Mrs", "Ms", "Dr"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert "yyyy-MM-dd" string ↔ Date for the calendar */
function strToDate(val: string): Date | undefined {
  if (!val) return undefined;
  const d = parse(val, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

function dateToStr(d: Date | undefined): string {
  return d && isValid(d) ? format(d, "yyyy-MM-dd") : "";
}

// ─── Shared field label + error ───────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-slate-500 mb-1.5">{children}</p>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[11px] text-red-500 leading-none">{msg}</p>;
}

// ─── Popover Date Picker ──────────────────────────────────────────────────────

interface DatePickerProps {
  label: string;
  value: string;           // "yyyy-MM-dd" or ""
  onChange: (val: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: (date: Date) => boolean;
}

function DatePickerField({
  label, value, onChange, error, helperText,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = strToDate(value);

  // Default the calendar view to the selected date, or a sensible default
  const defaultMonth = selected ?? new Date();

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between gap-2",
              "h-10 rounded-lg border bg-white px-3.5 text-sm transition-all duration-150",
              "hover:border-slate-400 outline-none",
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            )}
          >
            <span className={selected ? "text-slate-800" : "text-slate-400"}>
              {selected ? format(selected, "dd MMM yyyy") : "Pick a date"}
            </span>
            <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          avoidCollisions
          className="w-auto p-0 shadow-lg"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(dateToStr(date));
              setOpen(false);
            }}
            defaultMonth={defaultMonth}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
      <FieldError msg={helperText} />
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { key: "passengers", label: "Passengers" },
  { key: "review",     label: "Review"     },
  { key: "payment",    label: "Payment"    },
  { key: "confirm",    label: "Confirm"    },
];

export function StepIndicator({ current }: { current: string }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              i < idx   ? "bg-emerald-500 text-white"
              : i === idx ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
              :             "bg-slate-100 text-slate-400"
            )}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={cn(
              "text-[10px] font-semibold whitespace-nowrap",
              i === idx ? "text-primary" : i < idx ? "text-emerald-600" : "text-slate-400"
            )}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 mb-4 transition-all",
              i < idx ? "bg-emerald-400" : "bg-slate-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Passenger Form ───────────────────────────────────────────────────────────

interface PassengerFormProps {
  passengerCount: number;
  defaultValues?: Partial<CheckoutData>;
  onSubmit: (data: CheckoutData) => void;
}

export function PassengerForm({ passengerCount, defaultValues, onSubmit }: PassengerFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      passengers: Array.from({ length: passengerCount }, (_, i) =>
        defaultValues?.passengers?.[i] ?? {
          title: "Mr",
          firstName: "", lastName: "", dateOfBirth: "",
          nationality: "", passportNumber: "", passportExpiry: "", passportCountry: "",
        }
      ),
      contact: defaultValues?.contact ?? { email: "", phone: "", countryCode: "+92" },
    },
  });

  const { fields } = useFieldArray({ control, name: "passengers" });

  const today = new Date();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Passenger cards ── */}
      {fields.map((field, i) => (
        <Card key={field.id} className="border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.05)] bg-white">

          {/* Card header */}
          <CardHeader className="flex-row items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Passenger {i + 1}{" "}
                {i === 0 && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1">Lead</span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">Adult traveler</p>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">

            {/* Row 1: Title + First Name + Last Name */}
            <div className="grid grid-cols-12 gap-4">

              {/* Title */}
              <div className="col-span-2">
                <FieldLabel>Title</FieldLabel>
                <Controller
                  name={`passengers.${i}.title`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={cn(
                          "w-full h-10 rounded-lg border-slate-300 bg-white text-sm",
                          "hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.passengers?.[i]?.title && "border-red-400"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TITLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* First Name */}
              <div className="col-span-5">
                <FieldLabel>First Name</FieldLabel>
                <Input
                  {...register(`passengers.${i}.firstName`)}
                  placeholder="As on passport"
                  aria-invalid={!!errors.passengers?.[i]?.firstName}
                  className="h-10 border-slate-300 hover:border-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 text-slate-800 placeholder:text-slate-400"
                />
                <FieldError msg={errors.passengers?.[i]?.firstName?.message} />
              </div>

              {/* Last Name */}
              <div className="col-span-5">
                <FieldLabel>Last Name</FieldLabel>
                <Input
                  {...register(`passengers.${i}.lastName`)}
                  placeholder="As on passport"
                  aria-invalid={!!errors.passengers?.[i]?.lastName}
                  className="h-10 border-slate-300 hover:border-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 text-slate-800 placeholder:text-slate-400"
                />
                <FieldError msg={errors.passengers?.[i]?.lastName?.message} />
              </div>
            </div>

            {/* Row 2: Date of Birth + Nationality */}
            <div className="grid grid-cols-2 gap-4">

              {/* Date of Birth — Popover Calendar */}
              <Controller
                name={`passengers.${i}.dateOfBirth`}
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label="Date of Birth"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.passengers?.[i]?.dateOfBirth}
                    helperText={errors.passengers?.[i]?.dateOfBirth?.message}
                    disabled={(date) => date > today}
                  />
                )}
              />

              {/* Nationality */}
              <div>
                <FieldLabel>Nationality</FieldLabel>
                <Controller
                  name={`passengers.${i}.nationality`}
                  control={control}
                  render={({ field }) => (
                    <CountrySelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select nationality"
                      hasError={!!errors.passengers?.[i]?.nationality}
                    />
                  )}
                />
                <FieldError msg={errors.passengers?.[i]?.nationality?.message} />
              </div>
            </div>

            {/* Passport section */}
            <div className="border-t border-dashed border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Passport / Travel Document
              </p>
              <div className="grid grid-cols-3 gap-4">

                {/* Passport Number */}
                <div>
                  <FieldLabel>Passport No.</FieldLabel>
                  <Input
                    {...register(`passengers.${i}.passportNumber`)}
                    placeholder="AB1234567"
                    aria-invalid={!!errors.passengers?.[i]?.passportNumber}
                    className="h-10 border-slate-300 hover:border-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 text-slate-800 placeholder:text-slate-400"
                  />
                  <FieldError msg={errors.passengers?.[i]?.passportNumber?.message} />
                </div>

                {/* Passport Expiry — Popover Calendar */}
                <Controller
                  name={`passengers.${i}.passportExpiry`}
                  control={control}
                  render={({ field }) => (
                    <DatePickerField
                      label="Expiry Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.passengers?.[i]?.passportExpiry}
                      helperText={errors.passengers?.[i]?.passportExpiry?.message}
                      disabled={(date) => date < today}
                    />
                  )}
                />

                {/* Issuing Country */}
                <div>
                  <FieldLabel>Issuing Country</FieldLabel>
                  <Controller
                    name={`passengers.${i}.passportCountry`}
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select country"
                        hasError={!!errors.passengers?.[i]?.passportCountry}
                      />
                    )}
                  />
                  <FieldError msg={errors.passengers?.[i]?.passportCountry?.message} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ── Contact Details ── */}
      <Card className="border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.05)] bg-white">
        <CardHeader className="flex-row items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Contact Details</p>
            <p className="text-[11px] text-slate-400">Booking confirmation will be sent here</p>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">

          {/* Email */}
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              {...register("contact.email")}
              type="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.contact?.email}
              className="h-10 border-slate-300 hover:border-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 text-slate-800 placeholder:text-slate-400"
            />
            <FieldError msg={errors.contact?.email?.message} />
          </div>

          {/* Phone: country code + number */}
          <div className="flex gap-3">

            {/* Country Code */}
            <div className="w-36 shrink-0">
              <FieldLabel>Code</FieldLabel>
              <Controller
                name="contact.countryCode"
                control={control}
                render={({ field }) => (
                  <PhoneCodeSelect
                    value={field.value}
                    onChange={field.onChange}
                    hasError={!!errors.contact?.countryCode}
                  />
                )}
              />
            </div>

            {/* Phone Number */}
            <div className="flex-1">
              <FieldLabel>Phone Number</FieldLabel>
              <Input
                {...register("contact.phone")}
                type="tel"
                placeholder="3001234567"
                aria-invalid={!!errors.contact?.phone}
                className="h-10 border-slate-300 hover:border-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 text-slate-800 placeholder:text-slate-400"
              />
              <FieldError msg={errors.contact?.phone?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
      >
        Continue to Review →
      </Button>
    </form>
  );
}
