"use client";

import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  FileText, User, Upload, RotateCcw, Send,
  CheckCircle2, X, Globe, CreditCard, ChevronDown, CalendarDays, Phone, Mail,
} from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile { name: string; size: number }

interface FormState {
  visaType: string;    visaPlan: string;    country: string;
  firstName: string;   middleName: string;  surname: string;
  fatherName: string;  motherName: string;  placeOfBirth: string;
  occupation: string;  religion: string;    maritalStatus: string;
  nationality: string; passportNo: string;
  gender: "male" | "female";
  email: string; phone: string;
  issueDate: string;   expiryDate: string;  dob: string;
  passportFront: UploadedFile | null;  passportFrontPreview: string | null;
  passportBack:  UploadedFile | null;  passportBackPreview:  string | null;
  passportPhoto: UploadedFile | null;  passportPhotoPreview: string | null;
  additionalDoc: UploadedFile | null;  additionalDocPreview: string | null;
  agreed: boolean;
}

const EMPTY: FormState = {
  visaType: "", visaPlan: "", country: "",
  firstName: "", middleName: "", surname: "",
  fatherName: "", motherName: "", placeOfBirth: "",
  occupation: "", religion: "", maritalStatus: "",
  nationality: "", passportNo: "",
  gender: "male", email: "", phone: "", issueDate: "", expiryDate: "", dob: "",
  passportFront: null, passportFrontPreview: null,
  passportBack:  null, passportBackPreview:  null,
  passportPhoto: null, passportPhotoPreview: null,
  additionalDoc: null, additionalDocPreview: null,
  agreed: false,
};

const VISA_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Schengen (Europe)", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other",
];

const VISA_TYPES: Record<string, string[]> = {
  "United Arab Emirates": ["Tourist Visa", "Business Visa", "Transit Visa", "Family Visa"],
  "Saudi Arabia":         ["Tourist Visa", "Umrah Visa", "Business Visa", "Work Visa"],
  "United Kingdom":       ["Tourist Visa", "Student Visa", "Work Visa", "Family Visa"],
  default:                ["Tourist Visa", "Business Visa", "Student Visa", "Work Visa", "Transit Visa", "Family Visa"],
};

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-primary">{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, required = false, children, className }: {
  label: string; required?: boolean;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Date picker field ────────────────────────────────────────────────────────

function DateField({ label, required = false, value, onChange, placeholder, maxDate, minDate }: {
  label: string; required?: boolean;
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "h-10 w-full flex items-center justify-between px-3.5 rounded-xl border text-sm transition-all text-left",
              open
                ? "border-primary ring-2 ring-primary/15 bg-primary/5 shadow-sm"
                : "border-input hover:border-primary/40 bg-white hover:bg-slate-50/80",
              !selected && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className={cn("h-4 w-4 shrink-0", selected ? "text-primary" : "text-slate-400")} />
              <span className={cn(selected ? "text-slate-800 font-medium" : "")}>
                {selected ? format(selected, "dd MMM yyyy") : (placeholder ?? "Pick a date")}
              </span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-xl border-slate-200 rounded-2xl overflow-hidden"
          align="start"
          sideOffset={6}
        >
          <div className="bg-primary/5 border-b border-slate-100 px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-600">{label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {selected ? format(selected, "EEEE, MMMM d, yyyy") : "No date selected"}
            </p>
          </div>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(day) => {
              if (day) { onChange(format(day, "yyyy-MM-dd")); setOpen(false); }
            }}
            defaultMonth={selected}
            disabled={(d) => {
              if (maxDate && d > maxDate) return true;
              if (minDate && d < minDate) return true;
              return false;
            }}
            initialFocus
          />
          {selected && (
            <div className="border-t border-slate-100 px-3 py-2 flex justify-end">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function UploadBox({ label, required = false, optional = false, file, preview, onChange }: {
  label: string; required?: boolean; optional?: boolean;
  file: UploadedFile | null;
  preview: string | null;
  onChange: (f: UploadedFile | null, preview: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    if (isImage) {
      const compressed = await compressImage(f, 1000, 1000, 0.7);
      onChange({ name: f.name, size: f.size }, compressed);
    } else {
      onChange({ name: f.name, size: f.size }, null);
    }
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
        {optional && <span className="text-slate-400 normal-case font-normal ml-1">(optional)</span>}
      </Label>
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handle} />

      {file ? (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          {/* Image preview */}
          {preview ? (
            <div className="relative group">
              <img src={preview} alt={file.name}
                className="w-full h-36 object-cover" />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button type="button" onClick={() => ref.current?.click()}
                  className="h-8 px-3 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                  Change
                </button>
                <button type="button" onClick={() => onChange(null, null)}
                  className="h-8 px-3 rounded-lg bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ) : null}
          {/* File info bar */}
          <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/5 border-t border-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button type="button" onClick={() => onChange(null, null)}
              className="h-6 w-6 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="flex flex-col items-center justify-center gap-2.5 py-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:border-primary/40 hover:bg-primary/5 transition-all group">
          <div className="h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-primary/30 transition-all">
            <Upload className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600 group-hover:text-primary transition-colors">
              Click to upload{optional ? " (optional)" : ""}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF · Max 5MB</p>
          </div>
        </button>
      )}
    </div>
  );
}

// ─── Nationality Searchable Combobox ─────────────────────────────────────────

function NationalityCombobox({ value, onChange, error, placeholder = "Select nationality" }: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-10 w-full flex items-center justify-between px-3.5 rounded-xl border text-sm transition-all text-left",
            open ? "border-primary ring-2 ring-primary/15 bg-primary/5 shadow-sm" : "border-input hover:border-primary/40 bg-white hover:bg-slate-50/80",
            error && "border-rose-400 ring-1 ring-rose-300",
            !value && "text-muted-foreground"
          )}
        >
          <span className={value ? "text-slate-800 font-medium" : ""}>{value || placeholder}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 shadow-xl border-slate-200 rounded-2xl overflow-hidden" align="start" sideOffset={6}>
        <Command>
          <CommandInput placeholder="Search..." className="h-9 text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none" />
          <CommandList className="max-h-56">
            <CommandEmpty className="py-4 text-center text-xs text-slate-400">No country found.</CommandEmpty>
            <CommandGroup>
              {VISA_COUNTRIES.map(c => (
                <CommandItem key={c} value={c} onSelect={() => { onChange(c); setOpen(false); }}
                  className="text-sm cursor-pointer">
                  {c}
                  {value === c && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Types (errors) ─────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof FormState, string>>;

// ─── Main form ────────────────────────────────────────────────────────────────

export function VisaApplicationForm() {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]   = useState<FormErrors>({});

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.country)       e.country       = "Destination country is required";
    if (!form.visaType)      e.visaType      = "Visa type is required";
    if (!form.visaPlan)      e.visaPlan      = "Visa plan is required";
    if (!form.firstName.trim())   e.firstName   = "First name is required";
    if (!form.surname.trim())     e.surname     = "Surname is required";
    if (!form.fatherName.trim())  e.fatherName  = "Father's name is required";
    if (!form.motherName.trim())  e.motherName  = "Mother's name is required";
    if (!form.dob)           e.dob           = "Date of birth is required";
    if (!form.placeOfBirth.trim()) e.placeOfBirth = "Place of birth is required";
    if (!form.maritalStatus) e.maritalStatus = "Marital status is required";
    if (!form.occupation.trim())  e.occupation  = "Occupation is required";
    if (!form.religion.trim())    e.religion    = "Religion is required";
    if (!form.nationality)   e.nationality   = "Nationality is required";
    if (!form.email.trim())   e.email         = "Email is required";
    if (!form.phone.trim())   e.phone         = "Phone number is required";
    if (!form.passportNo.trim())  e.passportNo  = "Passport number is required";
    if (!form.issueDate)     e.issueDate     = "Issue date is required";
    if (!form.expiryDate)    e.expiryDate    = "Expiry date is required";
    if (!form.passportFront) e.passportFront = "Passport front page is required";
    if (!form.passportBack)  e.passportBack  = "Passport back page is required";
    if (!form.passportPhoto) e.passportPhoto = "Passport photo is required";
    if (!form.agreed)        e.agreed        = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const [appNo, setAppNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      passportFront: form.passportFrontPreview || form.passportFront?.name,
      passportBack: form.passportBackPreview || form.passportBack?.name,
      passportPhoto: form.passportPhotoPreview || form.passportPhoto?.name,
      additionalDoc: form.additionalDocPreview || form.additionalDoc?.name,
    };

    try {
      const res = await fetch("/api/visa/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.success) {
        setAppNo(json.applicationNo || "VSA-981240");
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit visa application", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visaTypes = form.country
    ? (VISA_TYPES[form.country] ?? VISA_TYPES.default)
    : VISA_TYPES.default;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1 text-xs font-bold text-blue-600 border border-blue-200">
            Application Reference #: {appNo}
          </span>
          <h2 className="text-xl font-bold text-slate-800">Application Submitted Successfully!</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your visa application has been securely saved to our database. Our embassy verification team will review your details and contact you via email ({form.email}) or WhatsApp ({form.phone}).
          </p>
        </div>
        <Button variant="outline" onClick={() => { setForm(EMPTY); setSubmitted(false); }}
          className="mt-2 gap-2 rounded-xl h-11 px-6">
          <RotateCcw className="h-4 w-4" /> Submit another application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Section 1: Visa Information ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <SectionHeader
          icon={<Globe className="h-4.5 w-4.5" />}
          title="Visa Information"
          subtitle="Select the country and type of visa you are applying for"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Destination Country" required>
            <NationalityCombobox
              value={form.country}
              onChange={v => { set("country", v); set("visaType", ""); }}
              error={errors.country}
              placeholder="Select country"
            />
            {errors.country && <p className="text-[11px] text-rose-500 mt-0.5">{errors.country}</p>}
          </Field>
          <Field label="Visa Type" required>
            <Select value={form.visaType} onValueChange={v => set("visaType", v)} disabled={!form.country}>
              <SelectTrigger className={cn("h-10 w-full rounded-xl text-sm", errors.visaType && "border-rose-400 ring-1 ring-rose-300")}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {visaTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.visaType && <p className="text-[11px] text-rose-500 mt-0.5">{errors.visaType}</p>}
          </Field>
          <Field label="Visa Plan" required>
            <Select value={form.visaPlan} onValueChange={v => set("visaPlan", v)}>
              <SelectTrigger className={cn("h-10 w-full rounded-xl text-sm", errors.visaPlan && "border-rose-400 ring-1 ring-rose-300")}>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {["Single Entry", "Multiple Entry (30 days)", "Multiple Entry (90 days)", "Long Term"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.visaPlan && <p className="text-[11px] text-rose-500 mt-0.5">{errors.visaPlan}</p>}
          </Field>
        </div>
      </div>

      {/* ── Section 2: Personal Details ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <SectionHeader
          icon={<User className="h-4.5 w-4.5" />}
          title="Passenger Details"
          subtitle="Enter personal information exactly as it appears on your passport"
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="First Name" required>
              <Input className={cn("h-10 rounded-xl", errors.firstName && "border-rose-400 ring-1 ring-rose-300")} placeholder="First name"
                value={form.firstName} onChange={e => set("firstName", e.target.value)} />
              {errors.firstName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.firstName}</p>}
            </Field>
            <Field label="Middle Name">
              <Input className="h-10 rounded-xl" placeholder="Middle name (optional)"
                value={form.middleName} onChange={e => set("middleName", e.target.value)} />
            </Field>
            <Field label="Surname" required>
              <Input className={cn("h-10 rounded-xl", errors.surname && "border-rose-400 ring-1 ring-rose-300")} placeholder="Surname"
                value={form.surname} onChange={e => set("surname", e.target.value)} />
              {errors.surname && <p className="text-[11px] text-rose-500 mt-0.5">{errors.surname}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Father's Name" required>
              <Input className={cn("h-10 rounded-xl", errors.fatherName && "border-rose-400 ring-1 ring-rose-300")} placeholder="Father's name"
                value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
              {errors.fatherName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.fatherName}</p>}
            </Field>
            <Field label="Mother's Name" required>
              <Input className={cn("h-10 rounded-xl", errors.motherName && "border-rose-400 ring-1 ring-rose-300")} placeholder="Mother's name"
                value={form.motherName} onChange={e => set("motherName", e.target.value)} />
              {errors.motherName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.motherName}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <DateField label="Date of Birth" required
                value={form.dob} onChange={v => set("dob", v)}
                placeholder="Select date of birth"
                maxDate={new Date()} />
              {errors.dob && <p className="text-[11px] text-rose-500 mt-0.5">{errors.dob}</p>}
            </div>
            <Field label="Place of Birth" required>
              <Input className={cn("h-10 rounded-xl", errors.placeOfBirth && "border-rose-400 ring-1 ring-rose-300")} placeholder="City of birth"
                value={form.placeOfBirth} onChange={e => set("placeOfBirth", e.target.value)} />
              {errors.placeOfBirth && <p className="text-[11px] text-rose-500 mt-0.5">{errors.placeOfBirth}</p>}
            </Field>
            <Field label="Marital Status" required>
              <Select value={form.maritalStatus} onValueChange={v => set("maritalStatus", v)}>
                <SelectTrigger className={cn("h-10 min-h-10 w-full rounded-xl text-sm", errors.maritalStatus && "border-rose-400 ring-1 ring-rose-300")}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {["Single", "Married", "Divorced", "Widowed"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.maritalStatus && <p className="text-[11px] text-rose-500 mt-0.5">{errors.maritalStatus}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Occupation" required>
              <Input className={cn("h-10 rounded-xl", errors.occupation && "border-rose-400 ring-1 ring-rose-300")} placeholder="e.g. Software Engineer"
                value={form.occupation} onChange={e => set("occupation", e.target.value)} />
              {errors.occupation && <p className="text-[11px] text-rose-500 mt-0.5">{errors.occupation}</p>}
            </Field>
            <Field label="Religion" required>
              <Input className={cn("h-10 rounded-xl", errors.religion && "border-rose-400 ring-1 ring-rose-300")} placeholder="e.g. Islam"
                value={form.religion} onChange={e => set("religion", e.target.value)} />
              {errors.religion && <p className="text-[11px] text-rose-500 mt-0.5">{errors.religion}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nationality" required>
              <NationalityCombobox
                value={form.nationality}
                onChange={v => set("nationality", v)}
                error={errors.nationality}
              />
              {errors.nationality && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nationality}</p>}
            </Field>
            <Field label="Gender" required>
              <div className="flex items-center gap-6 h-10">
                {(["male", "female"] as const).map(g => (
                  <label
                    key={g}
                    onClick={() => set("gender", g)}
                    className="flex items-center gap-2.5 cursor-pointer group select-none py-1"
                  >
                    <div
                      className={cn(
                        "h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shrink-0",
                        form.gender === g ? "border-primary bg-primary" : "border-slate-300 group-hover:border-primary/60"
                      )}
                    >
                      {form.gender === g && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 capitalize group-hover:text-primary transition-colors">
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email Address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className={cn("h-10 rounded-xl pl-9", errors.email && "border-rose-400 ring-1 ring-rose-300")}
                  placeholder="email@example.com" type="email"
                  value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500 mt-0.5">{errors.email}</p>}
            </Field>
            <Field label="Phone / WhatsApp" required>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className={cn("h-10 rounded-xl pl-9", errors.phone && "border-rose-400 ring-1 ring-rose-300")}
                  placeholder="+49 123 456 7890" type="tel"
                  value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone}</p>}
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 3: Passport Details ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <SectionHeader
          icon={<CreditCard className="h-4.5 w-4.5" />}
          title="Passport Details"
          subtitle="Your passport must be valid for at least 6 months from the travel date"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Passport Number" required>
            <Input className={cn("h-10 rounded-xl font-mono tracking-wider uppercase", errors.passportNo && "border-rose-400 ring-1 ring-rose-300")} placeholder="A12345678" maxLength={9}
              value={form.passportNo} onChange={e => set("passportNo", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9))} />
            {errors.passportNo && <p className="text-[11px] text-rose-500 mt-0.5">{errors.passportNo}</p>}
          </Field>
          <div className="flex flex-col gap-1.5">
            <DateField label="Issue Date" required
              value={form.issueDate} onChange={v => set("issueDate", v)}
              placeholder="Select issue date"
              maxDate={new Date()} />
            {errors.issueDate && <p className="text-[11px] text-rose-500 mt-0.5">{errors.issueDate}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <DateField label="Expiry Date" required
              value={form.expiryDate} onChange={v => set("expiryDate", v)}
              placeholder="Select expiry date"
              minDate={new Date()} />
            {errors.expiryDate && <p className="text-[11px] text-rose-500 mt-0.5">{errors.expiryDate}</p>}
          </div>
        </div>
      </div>

      {/* ── Section 4: Document Uploads ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <SectionHeader
          icon={<Upload className="h-4.5 w-4.5" />}
          title="Document Uploads"
          subtitle="Upload clear, colour scans. Max 5MB per file."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <UploadBox label="Passport Front Page" required
              file={form.passportFront} preview={form.passportFrontPreview}
              onChange={(f, p) => { setForm(v => ({ ...v, passportFront: f, passportFrontPreview: p })); if (f) setErrors(prev => ({ ...prev, passportFront: undefined })); }} />
            {errors.passportFront && <p className="text-[11px] text-rose-500 mt-1">{errors.passportFront}</p>}
          </div>
          <div>
            <UploadBox label="Passport Back Page" required
              file={form.passportBack} preview={form.passportBackPreview}
              onChange={(f, p) => { setForm(v => ({ ...v, passportBack: f, passportBackPreview: p })); if (f) setErrors(prev => ({ ...prev, passportBack: undefined })); }} />
            {errors.passportBack && <p className="text-[11px] text-rose-500 mt-1">{errors.passportBack}</p>}
          </div>
          <div>
            <UploadBox label="Passport Size Photo" required
              file={form.passportPhoto} preview={form.passportPhotoPreview}
              onChange={(f, p) => { setForm(v => ({ ...v, passportPhoto: f, passportPhotoPreview: p })); if (f) setErrors(prev => ({ ...prev, passportPhoto: undefined })); }} />
            {errors.passportPhoto && <p className="text-[11px] text-rose-500 mt-1">{errors.passportPhoto}</p>}
          </div>
          <UploadBox label="Additional Document" optional
            file={form.additionalDoc} preview={form.additionalDocPreview}
            onChange={(f, p) => setForm(v => ({ ...v, additionalDoc: f, additionalDocPreview: p }))} />
        </div>
      </div>

      {/* ── Agreement + Actions ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mb-2" onClick={() => set("agreed", !form.agreed)}>
          <div
            className={cn(
              "mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer",
              form.agreed ? "border-primary bg-primary" : "border-slate-300 group-hover:border-primary/60"
            )}>
            {form.agreed && (
              <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-slate-600 leading-relaxed">
            I/we agree to the{" "}
            <span className="text-primary font-semibold hover:underline cursor-pointer">terms &amp; conditions</span>,{" "}
            <span className="text-primary font-semibold hover:underline cursor-pointer">visa fee</span>{" "}
            and{" "}
            <span className="text-primary font-semibold hover:underline cursor-pointer">service charges</span>{" "}
            applicable for this application.
          </span>
        </label>
        {errors.agreed && <p className="text-[11px] text-rose-500 mb-4">{errors.agreed}</p>}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline"
            onClick={() => setForm(EMPTY)}
            className="flex-1 sm:flex-none sm:px-8 h-11 rounded-xl gap-2 text-sm font-semibold border-slate-200">
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Form
          </Button>
          <Button type="submit" disabled={isSubmitting}
            className="flex-1 sm:flex-none sm:px-10 h-11 rounded-xl gap-2 text-sm font-semibold shadow-sm shadow-primary/25 disabled:opacity-60 cursor-pointer">
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </div>

    </form>
  );
}
