import { z } from "zod";
import type { FlightOffer } from "@/types/flight";

// ─── Passenger schema ─────────────────────────────────────────────────────────

export const passengerSchema = z.object({
  title:          z.enum(["Mr", "Mrs", "Ms", "Dr"]),
  firstName:      z.string().min(2, "First name required"),
  lastName:       z.string().min(2, "Last name required"),
  dateOfBirth:    z.string().min(1, "Date of birth required"),
  nationality:    z.string().min(2, "Nationality required"),
  passportNumber: z.string().min(5, "Passport number required"),
  passportExpiry: z.string().min(1, "Passport expiry required"),
  passportCountry: z.string().min(2, "Issuing country required"),
});

export const contactSchema = z.object({
  email:       z.string().email("Valid email required"),
  phone:       z.string().min(7, "Phone number required"),
  countryCode: z.string().min(1, "Country code required"),
});

export const checkoutSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
  contact:    contactSchema,
});

export type PassengerData  = z.infer<typeof passengerSchema>;
export type ContactData    = z.infer<typeof contactSchema>;
export type CheckoutData   = z.infer<typeof checkoutSchema>;

// ─── Checkout context types ───────────────────────────────────────────────────

export type CheckoutStep = "passengers" | "review" | "payment" | "confirmation";

export interface CheckoutState {
  step:        CheckoutStep;
  offer:       FlightOffer;
  carriers:    Record<string, string>;
  fareClass:   string;
  passengers:  number;
  formData:    Partial<CheckoutData>;
  pnr:         string | null;
}
