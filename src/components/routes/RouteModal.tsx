"use client";
import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export const airportOptions = [
  { code: "LHE", label: "Lahore — Allama Iqbal Intl (LHE)" },
  { code: "KHI", label: "Karachi — Jinnah Intl (KHI)" },
  { code: "ISB", label: "Islamabad — Islamabad Intl (ISB)" },
  { code: "LHR", label: "London — Heathrow (LHR)" },
  { code: "DXB", label: "Dubai — Dubai Intl (DXB)" },
  { code: "DOH", label: "Doha — Hamad Intl (DOH)" },
  { code: "IST", label: "Istanbul — Istanbul Airport (IST)" },
  { code: "JED", label: "Jeddah — King Abdulaziz Intl (JED)" },
  { code: "MED", label: "Madinah — Prince Mohammad Intl (MED)" },
  { code: "KUL", label: "Kuala Lumpur — KLIA (KUL)" },
  { code: "SHJ", label: "Sharjah — Sharjah Intl (SHJ)" },
];

const airlineOptions = [
  "Emirates",
  "Qatar Airways",
  "Turkish Airlines",
  "flydubai",
  "Saudi Airlines",
  "Malaysia Airlines",
  "PIA",
  "Air Arabia",
];

// Reusable airport dropdown
function AirportSelect({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = airportOptions.find((a) => a.code === value);

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`dropdown-toggle h-11 w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800 ${
          selected ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="shrink-0 inline-flex items-center justify-center rounded bg-brand-50 px-1.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {selected.code}
              </span>
              <span className="truncate">{selected.label.split(" — ")[1]}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full p-1 max-h-56 overflow-y-auto"
      >
        {airportOptions.map((ap) => (
          <DropdownItem
            key={ap.code}
            onItemClick={() => {
              onChange(ap.code);
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
              value === ap.code
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
            }`}
          >
            <span className="shrink-0 inline-flex items-center justify-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {ap.code}
            </span>
            <span>{ap.label.split(` (${ap.code})`)[0].split(" — ")[1] || ap.label}</span>
            {value === ap.code && (
              <svg className="w-3.5 h-3.5 text-brand-500 ml-auto shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routeData: any) => void;
  editData?: {
    origin: string;
    destination: string;
    baseFare: string;
    airlines: string[];
    status: "Active" | "Inactive";
  } | null;
}

export default function RouteModal({ isOpen, onClose, onSave, editData }: RouteModalProps) {
  const [origin, setOrigin] = useState(editData?.origin ?? "");
  const [destination, setDestination] = useState(editData?.destination ?? "");
  const [baseFare, setBaseFare] = useState(editData?.baseFare ?? "");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(
    editData?.airlines ?? []
  );
  const [status, setStatus] = useState<"Active" | "Inactive">(
    editData?.status ?? "Active"
  );

  // Reset state when modal opens or edit data changes
  useEffect(() => {
    if (isOpen) {
      setOrigin(editData?.origin ?? "");
      setDestination(editData?.destination ?? "");
      setBaseFare(editData?.baseFare ?? "");
      setSelectedAirlines(editData?.airlines ?? []);
      setStatus(editData?.status ?? "Active");
    }
  }, [isOpen, editData]);

  function toggleAirline(airline: string) {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((a) => a !== airline)
        : [...prev, airline]
    );
  }

  function handleSave() {
    onSave({ origin, destination, baseFare, airlines: selectedAirlines, status });
    onClose();
  }

  const isEdit = !!editData;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5 lg:p-8">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Modal Title */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </span>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {isEdit ? "Edit Flight Route" : "Add New Flight Route"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEdit
                  ? "Update the details of this flight route."
                  : "Fill in the details to add a new flight route."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          {/* Origin Airport */}
          <div className="col-span-1">
            <Label htmlFor="origin">Origin Airport</Label>
            <AirportSelect
              id="origin"
              value={origin}
              onChange={setOrigin}
              placeholder="Select origin airport"
            />
          </div>

          {/* Destination Airport */}
          <div className="col-span-1">
            <Label htmlFor="destination">Destination Airport</Label>
            <AirportSelect
              id="destination"
              value={destination}
              onChange={setDestination}
              placeholder="Select destination airport"
            />
          </div>

          {/* Base Fare */}
          <div className="col-span-1">
            <Label htmlFor="baseFare">Base Fare (USD)</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                $
              </span>
              <Input
                id="baseFare"
                type="number"
                placeholder="850"
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Status */}
          <div className="col-span-1">
            <Label>Status</Label>
            <div className="flex items-center gap-3 h-11">
              <button
                type="button"
                onClick={() => setStatus("Active")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-colors duration-150 ${
                  status === "Active"
                    ? "bg-success-50 border-success-200 text-success-600 dark:bg-success-500/10 dark:border-success-500/20 dark:text-success-400"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-success-500" />
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("Inactive")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-colors duration-150 ${
                  status === "Inactive"
                    ? "bg-error-50 border-error-200 text-error-600 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-error-500" />
                Inactive
              </button>
            </div>
          </div>

          {/* Operating Airlines */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Operating Airlines</Label>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {airlineOptions.map((airline) => {
                const checked = selectedAirlines.includes(airline);
                return (
                  <label
                    key={airline}
                    onClick={() => toggleAirline(airline)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      checked
                        ? "border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 ${
                        checked
                          ? "border-brand-500 bg-brand-500"
                          : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    {airline}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Save Route
          </button>
        </div>
      </form>
    </Modal>
  );
}
