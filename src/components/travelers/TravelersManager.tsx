"use client";
import React, { useState, useEffect } from "react";
import TravelersHeader, { bookingFilters } from "./TravelersHeader";
import TravelersTable, { Traveler } from "./TravelersTable";

const initialTravelers: Traveler[] = [
  {
    id: 1,
    name: "Mohammad Asim Ameer",
    email: "asim.ameer@gmail.com",
    initials: "MA",
    avatarColor: "bg-brand-500",
    phone: "+92 312 3456789",
    passportNumber: "PK-82910492",
    nationality: "Pakistani",
    totalBookings: 8,
    totalSpent: "$4,120.00",
    joinedDate: "12 Jan 2024",
    recentBookings: [
      { id: "BK-9041", route: "Lahore (LHE) ➔ London (LHR)", flightNo: "EK-623", date: "15 May 2024", status: "Completed", amount: "$1,100.00" },
      { id: "BK-8812", route: "Karachi (KHI) ➔ Dubai (DXB)", flightNo: "FZ-334", date: "02 Feb 2024", status: "Completed", amount: "$480.00" },
      { id: "BK-9420", route: "Islamabad (ISB) ➔ Jeddah (JED)", flightNo: "SV-722", date: "10 Aug 2024", status: "Confirmed", amount: "$940.00" },
    ],
  },
  {
    id: 2,
    name: "Sana Khalid",
    email: "sana.khalid@hotmail.com",
    initials: "SK",
    avatarColor: "bg-purple-500",
    phone: "+92 333 9876543",
    passportNumber: "PK-49201948",
    nationality: "Pakistani",
    totalBookings: 5,
    totalSpent: "$2,450.00",
    joinedDate: "03 Mar 2024",
    recentBookings: [
      { id: "BK-7711", route: "Lahore (LHE) ➔ Istanbul (IST)", flightNo: "TK-715", date: "20 Mar 2024", status: "Completed", amount: "$820.00" },
    ],
  },
  {
    id: 3,
    name: "Usman Tariq",
    email: "usman.tariq@yahoo.com",
    initials: "UT",
    avatarColor: "bg-teal-500",
    phone: "+92 300 1122334",
    passportNumber: "PK-10293847",
    nationality: "Pakistani",
    totalBookings: 3,
    totalSpent: "$1,380.00",
    joinedDate: "19 Apr 2024",
    recentBookings: [
      { id: "BK-6602", route: "Islamabad (ISB) ➔ Doha (DOH)", flightNo: "QR-633", date: "01 May 2024", status: "Completed", amount: "$760.00" },
    ],
  },
  {
    id: 4,
    name: "Fatima Noor",
    email: "fatima.noor@gmail.com",
    initials: "FN",
    avatarColor: "bg-pink-500",
    phone: "+92 321 5544332",
    passportNumber: "PK-99482019",
    nationality: "Pakistani",
    totalBookings: 6,
    totalSpent: "$3,060.00",
    joinedDate: "07 May 2024",
    recentBookings: [
      { id: "BK-5109", route: "Lahore (LHE) ➔ Dubai (DXB)", flightNo: "EK-624", date: "12 Jun 2024", status: "Confirmed", amount: "$510.00" },
    ],
  },
  {
    id: 5,
    name: "Ali Hassan Raza",
    email: "ali.raza@gmail.com",
    initials: "AH",
    avatarColor: "bg-orange-500",
    phone: "+92 345 7788990",
    passportNumber: "PK-33829104",
    nationality: "Pakistani",
    totalBookings: 2,
    totalSpent: "$874.00",
    joinedDate: "22 Jun 2024",
    recentBookings: [],
  },
  {
    id: 6,
    name: "Ayesha Farooq",
    email: "ayesha.farooq@gmail.com",
    initials: "AF",
    avatarColor: "bg-rose-500",
    phone: "+92 311 2233445",
    passportNumber: "PK-55102938",
    nationality: "Pakistani",
    totalBookings: 10,
    totalSpent: "$6,780.00",
    joinedDate: "14 Feb 2024",
    recentBookings: [
      { id: "BK-9910", route: "Islamabad (ISB) ➔ Manchester (MAN)", flightNo: "PK-701", date: "04 Feb 2024", status: "Completed", amount: "$1,250.00" },
    ],
  },
  {
    id: 7,
    name: "Bilal Mehmood",
    email: "bilal.mehmood@outlook.com",
    initials: "BM",
    avatarColor: "bg-indigo-500",
    phone: "+92 302 9988776",
    passportNumber: "PK-77392019",
    nationality: "Pakistani",
    totalBookings: 1,
    totalSpent: "$520.00",
    joinedDate: "30 Jul 2024",
    recentBookings: [],
  },
  {
    id: 8,
    name: "Hira Zubair",
    email: "hira.zubair@gmail.com",
    initials: "HZ",
    avatarColor: "bg-green-600",
    phone: "+92 323 6677889",
    passportNumber: "PK-11029384",
    nationality: "Pakistani",
    totalBookings: 4,
    totalSpent: "$1,960.00",
    joinedDate: "11 Aug 2024",
    recentBookings: [],
  },
  {
    id: 9,
    name: "Kamran Javed",
    email: "kamran.javed@gmail.com",
    initials: "KJ",
    avatarColor: "bg-yellow-600",
    phone: "+92 315 4433221",
    passportNumber: "PK-66392019",
    nationality: "Pakistani",
    totalBookings: 7,
    totalSpent: "$3,850.00",
    joinedDate: "05 Sep 2024",
    recentBookings: [],
  },
  {
    id: 10,
    name: "Zara Ijaz",
    email: "zara.ijaz@hotmail.com",
    initials: "ZI",
    avatarColor: "bg-cyan-600",
    phone: "+92 341 8899001",
    passportNumber: "PK-44920193",
    nationality: "Pakistani",
    totalBookings: 0,
    totalSpent: "$0.00",
    joinedDate: "18 Oct 2024",
    recentBookings: [],
  },
];

const avatarColors = [
  "bg-brand-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-green-600",
  "bg-yellow-600",
  "bg-cyan-600",
];

function getInitials(name: string) {
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function TravelersManager() {
  const [travelers, setTravelers] = useState<Traveler[]>(initialTravelers);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(bookingFilters[0]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingTraveler, setViewingTraveler] = useState<Traveler | null>(null);
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null);
  const [deletingTravelerId, setDeletingTravelerId] = useState<number | string | null>(null);

  // WhatsApp Modal State
  const [whatsAppTraveler, setWhatsAppTraveler] = useState<Traveler | null>(null);
  const [whatsAppTemplate, setWhatsAppTemplate] = useState<"welcome" | "ticket" | "docs" | "custom">("welcome");
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);

  // Load live travelers from backend API
  useEffect(() => {
    async function loadTravelers() {
      try {
        const res = await fetch("/api/admin/travelers");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.travelers) && data.travelers.length > 0) {
            // Merge with initial, avoiding duplicates by email
            setTravelers((prev) => {
              const existingEmails = new Set(data.travelers.map((t: any) => t.email.toLowerCase()));
              const preservedInitial = prev.filter((t) => !existingEmails.has(t.email.toLowerCase()));
              return [...data.travelers, ...preservedInitial];
            });
          }
        }
      } catch (err) {
        console.warn("[TravelersManager] API sync warning:", err);
      }
    }
    loadTravelers();
  }, []);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    passportNumber: "",
    nationality: "Pakistani",
    totalBookings: 0,
    totalSpent: "$0.00",
  });

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "+92 ",
      passportNumber: "",
      nationality: "Pakistani",
      totalBookings: 0,
      totalSpent: "$0.00",
    });
    setIsAddModalOpen(true);
  };

  // Helper to generate template messages
  const generateMessageText = (template: "welcome" | "ticket" | "docs" | "custom", name: string, phone: string) => {
    const cleanName = name || "Valued Traveler";
    if (template === "welcome") {
      return `Assalam-o-Alaikum ${cleanName},\n\nWelcome to *AMD Global Travel*! ✈️\nYour traveler profile has been successfully registered. You can now book flights, umrah packages, and visa services with exclusive agency rates.\n\n📞 24/7 Helpline: +92 312 3456789\n🌐 Website: www.amdglobaltravel.com\n\n_Thank you for choosing AMD Global Travel!_`;
    } else if (template === "ticket") {
      return `Assalam-o-Alaikum ${cleanName},\n\nYour flight booking with *AMD Global Travel* is confirmed! 🎫\n\n📌 *Passenger:* ${cleanName}\n🛫 *Status:* Ticket Issued & Verified\n🛡️ *Agency:* AMD Global Travel Management\n\nPlease find your electronic ticket & itinerary attached. For any adjustments or baggage assistance, reply to this message.\n\n_Fly Smarter, Travel Further!_`;
    } else if (template === "docs") {
      return `Assalam-o-Alaikum ${cleanName},\n\nThis is from *AMD Global Travel Documentation Desk*.\nKindly share a clear copy of your *Passport (First 2 Pages)* and valid visa copy for your upcoming flight issuance.\n\n_AMD Global Operations Team_`;
    }
    return `Assalam-o-Alaikum ${cleanName},\n\nGreetings from *AMD Global Travel*! How can we assist you with your flight reservations today?`;
  };

  // Open WhatsApp Modal for a traveler
  const handleOpenWhatsApp = (traveler: Traveler, templateType: "welcome" | "ticket" | "docs" | "custom" = "welcome") => {
    setWhatsAppTraveler(traveler);
    setWhatsAppTemplate(templateType);
    setWhatsAppMessage(generateMessageText(templateType, traveler.name, traveler.phone));
    setWhatsAppNotice(null);
  };

  // Dispatch WhatsApp message
  const handleSendWhatsApp = async (openDirect = false) => {
    if (!whatsAppTraveler) return;

    if (openDirect) {
      const clean = whatsAppTraveler.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${clean}?text=${encodeURIComponent(whatsAppMessage)}`, "_blank");
      return;
    }

    setIsSendingWhatsApp(true);
    setWhatsAppNotice(null);

    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: whatsAppTraveler.phone,
          message: whatsAppMessage,
          customerName: whatsAppTraveler.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.sentViaSocket) {
          setWhatsAppNotice(`✅ WhatsApp message sent directly to ${whatsAppTraveler.name}!`);
        } else {
          setWhatsAppNotice(`WhatsApp message prepared. Opening WhatsApp Web...`);
          window.open(data.whatsappUrl, "_blank");
        }
      } else {
        // Fallback open WhatsApp web
        const clean = whatsAppTraveler.phone.replace(/\D/g, "");
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(whatsAppMessage)}`, "_blank");
      }
    } catch {
      const clean = whatsAppTraveler.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${clean}?text=${encodeURIComponent(whatsAppMessage)}`, "_blank");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Submit Add Traveler
  const handleSaveAdd = async (e: React.FormEvent, sendWhatsApp = false) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newId = Date.now();
    const initials = getInitials(formData.name);
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newTraveler: Traveler = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "+92 300 0000000",
      passportNumber: formData.passportNumber || "PK-" + Math.floor(10000000 + Math.random() * 90000000),
      nationality: formData.nationality || "Pakistani",
      initials,
      avatarColor: color,
      totalBookings: Number(formData.totalBookings) || 0,
      totalSpent: formData.totalSpent.startsWith("$") ? formData.totalSpent : `$${formData.totalSpent}`,
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      recentBookings: [],
    };

    // Sync with backend API
    try {
      fetch("/api/admin/travelers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTraveler),
      });
    } catch (err) {
      console.warn("DB save sync:", err);
    }

    setTravelers((prev) => [newTraveler, ...prev]);
    setIsAddModalOpen(false);

    // If user clicked "Save & Send WhatsApp"
    if (sendWhatsApp) {
      handleOpenWhatsApp(newTraveler, "welcome");
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (traveler: Traveler) => {
    setEditingTraveler(traveler);
    setFormData({
      name: traveler.name,
      email: traveler.email,
      phone: traveler.phone,
      passportNumber: traveler.passportNumber || "",
      nationality: traveler.nationality || "Pakistani",
      totalBookings: traveler.totalBookings,
      totalSpent: traveler.totalSpent,
    });
  };

  // Submit Edit Traveler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraveler || !formData.name) return;

    setTravelers((prev) =>
      prev.map((t) =>
        t.id === editingTraveler.id
          ? {
              ...t,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              passportNumber: formData.passportNumber,
              nationality: formData.nationality,
              initials: getInitials(formData.name),
              totalBookings: Number(formData.totalBookings),
              totalSpent: formData.totalSpent.startsWith("$") ? formData.totalSpent : `$${formData.totalSpent}`,
            }
          : t
      )
    );
    setEditingTraveler(null);
  };

  // Confirm Delete Traveler
  const handleConfirmDelete = () => {
    if (deletingTravelerId !== null) {
      setTravelers((prev) => prev.filter((t) => t.id !== deletingTravelerId));
      setDeletingTravelerId(null);
    }
  };

  // Filter & Search Logic
  const filteredTravelers = travelers.filter((t) => {
    // Search matching
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      (t.passportNumber && t.passportNumber.toLowerCase().includes(q));

    // Filter matching
    let matchesFilter = true;
    if (selectedFilter.value === "5plus") {
      matchesFilter = t.totalBookings >= 5;
    } else if (selectedFilter.value === "3to5") {
      matchesFilter = t.totalBookings >= 3 && t.totalBookings <= 5;
    } else if (selectedFilter.value === "1to2") {
      matchesFilter = t.totalBookings >= 1 && t.totalBookings <= 2;
    } else if (selectedFilter.value === "none") {
      matchesFilter = t.totalBookings === 0;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <TravelersHeader
        search={search}
        setSearch={setSearch}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onAddTraveler={handleOpenAddModal}
      />

      <TravelersTable
        travelers={filteredTravelers}
        onViewTraveler={(t) => setViewingTraveler(t)}
        onEditTraveler={(t) => handleOpenEditModal(t)}
        onDeleteTraveler={(id) => setDeletingTravelerId(id)}
        onWhatsAppTraveler={(t) => handleOpenWhatsApp(t)}
      />

      {/* ========================================================================= */}
      {/* 1. ADD TRAVELER MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Add New Traveler
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asim Ameer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. traveler@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Passport / CNIC No.
                  </label>
                  <input
                    type="text"
                    placeholder="PK-12345678"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Initial Bookings
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalBookings}
                    onChange={(e) => setFormData({ ...formData, totalBookings: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Total Spent ($)
                  </label>
                  <input
                    type="text"
                    placeholder="$0.00"
                    value={formData.totalSpent}
                    onChange={(e) => setFormData({ ...formData, totalSpent: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  Save Only
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveAdd(e, true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-emerald-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.897 2.796.897 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.385 8.167c-.145.407-.723.754-1.026.8-.297.045-.67.064-1.082-.068-.255-.082-.581-.194-1.002-.375-1.776-.767-2.934-2.55-3.023-2.668-.088-.117-.722-.961-.722-1.832 0-.871.455-1.301.617-1.477.162-.176.353-.22.47-.22.118 0 .235.001.338.006.11.005.257-.042.403.308.146.352.5 1.22.544 1.309.044.088.073.191.015.308-.059.117-.088.19-.176.293-.088.103-.186.23-.265.31-.088.088-.18.184-.078.36.103.176.457.755.981 1.221.674.6 1.242.787 1.418.874.177.088.28.074.383-.044.103-.117.441-.513.559-.69.117-.176.235-.146.397-.088.162.059 1.029.485 1.206.573.176.088.294.132.338.206.044.073.044.426-.101.833z"/>
                  </svg>
                  Save & Send WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT TRAVELER MODAL */}
      {/* ========================================================================= */}
      {editingTraveler && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Edit Traveler Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTraveler(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Passport / CNIC No.
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Total Bookings
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalBookings}
                    onChange={(e) => setFormData({ ...formData, totalBookings: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Total Spent
                  </label>
                  <input
                    type="text"
                    value={formData.totalSpent}
                    onChange={(e) => setFormData({ ...formData, totalSpent: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingTraveler(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PREVIEW / VIEW DETAILS MODAL */}
      {/* ========================================================================= */}
      {viewingTraveler && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${viewingTraveler.avatarColor} text-white font-bold text-lg`}>
                  {viewingTraveler.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {viewingTraveler.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Member since {viewingTraveler.joinedDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTraveler(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Info Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/40">
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Total Bookings</span>
                <span className="mt-1 text-lg font-bold text-brand-600 dark:text-brand-400">{viewingTraveler.totalBookings} Flights</span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/40">
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Total Spent</span>
                <span className="mt-1 text-lg font-bold text-success-600 dark:text-success-400">{viewingTraveler.totalSpent}</span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/40">
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Passport No.</span>
                <span className="mt-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">{viewingTraveler.passportNumber || "PK-82910492"}</span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/40">
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Nationality</span>
                <span className="mt-1 text-xs font-semibold text-gray-800 dark:text-gray-200">{viewingTraveler.nationality || "Pakistani"}</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📧 Email:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{viewingTraveler.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞 Phone:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{viewingTraveler.phone}</span>
                </div>
              </div>
            </div>

            {/* Flight History Timeline */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Recent Flight Booking History
              </h4>

              {viewingTraveler.recentBookings && viewingTraveler.recentBookings.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {viewingTraveler.recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-[10px]">
                          PNR
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {b.route}
                          </p>
                          <span className="text-xs text-gray-400">
                            Flight: {b.flightNo} • {b.date}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-sm font-bold text-gray-800 dark:text-white">
                          {b.amount}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            b.status === "Confirmed"
                              ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400"
                              : "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No recent booking history found for this traveler.
                  </p>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewingTraveler(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = viewingTraveler;
                  handleOpenWhatsApp(t);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.897 2.796.897 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.385 8.167c-.145.407-.723.754-1.026.8-.297.045-.67.064-1.082-.068-.255-.082-.581-.194-1.002-.375-1.776-.767-2.934-2.55-3.023-2.668-.088-.117-.722-.961-.722-1.832 0-.871.455-1.301.617-1.477.162-.176.353-.22.47-.22.118 0 .235.001.338.006.11.005.257-.042.403.308.146.352.5 1.22.544 1.309.044.088.073.191.015.308-.059.117-.088.19-.176.293-.088.103-.186.23-.265.31-.088.088-.18.184-.078.36.103.176.457.755.981 1.221.674.6 1.242.787 1.418.874.177.088.28.074.383-.044.103-.117.441-.513.559-.69.117-.176.235-.146.397-.088.162.059 1.029.485 1.206.573.176.088.294.132.338.206.044.073.044.426-.101.833z"/>
                </svg>
                Send WhatsApp Message
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = viewingTraveler;
                  setViewingTraveler(null);
                  handleOpenEditModal(t);
                }}
                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                Edit Traveler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE TRAVELER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingTravelerId !== null && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Delete Traveler Record?
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to remove this traveler profile? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingTravelerId(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-error-600 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-error-700"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DIRECT WHATSAPP MESSAGING MODAL */}
      {/* ========================================================================= */}
      {whatsAppTraveler && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.897 2.796.897 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.385 8.167c-.145.407-.723.754-1.026.8-.297.045-.67.064-1.082-.068-.255-.082-.581-.194-1.002-.375-1.776-.767-2.934-2.55-3.023-2.668-.088-.117-.722-.961-.722-1.832 0-.871.455-1.301.617-1.477.162-.176.353-.22.47-.22.118 0 .235.001.338.006.11.005.257-.042.403.308.146.352.5 1.22.544 1.309.044.088.073.191.015.308-.059.117-.088.19-.176.293-.088.103-.186.23-.265.31-.088.088-.18.184-.078.36.103.176.457.755.981 1.221.674.6 1.242.787 1.418.874.177.088.28.074.383-.044.103-.117.441-.513.559-.69.117-.176.235-.146.397-.088.162.059 1.029.485 1.206.573.176.088.294.132.338.206.044.073.044.426-.101.833z"/>
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    Send WhatsApp Message
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    To: <span className="font-semibold text-gray-800 dark:text-white">{whatsAppTraveler.name}</span> ({whatsAppTraveler.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppTraveler(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Template Selector */}
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Select Quick Template
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppTemplate("welcome");
                    setWhatsAppMessage(generateMessageText("welcome", whatsAppTraveler.name, whatsAppTraveler.phone));
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                    whatsAppTemplate === "welcome"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  👋 Welcome
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppTemplate("ticket");
                    setWhatsAppMessage(generateMessageText("ticket", whatsAppTraveler.name, whatsAppTraveler.phone));
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                    whatsAppTemplate === "ticket"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  🎫 Ticket Issue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppTemplate("docs");
                    setWhatsAppMessage(generateMessageText("docs", whatsAppTraveler.name, whatsAppTraveler.phone));
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                    whatsAppTemplate === "docs"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  🛂 Passport Req
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppTemplate("custom");
                    setWhatsAppMessage(generateMessageText("custom", whatsAppTraveler.name, whatsAppTraveler.phone));
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                    whatsAppTemplate === "custom"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  ✏️ Custom
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                WhatsApp Message Content
              </label>
              <textarea
                rows={6}
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                placeholder="Type WhatsApp message..."
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs leading-relaxed text-gray-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {whatsAppNotice && (
              <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
                {whatsAppNotice}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setWhatsAppTraveler(null)}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(true)}
                  className="rounded-lg border border-emerald-500 px-3.5 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  title="Open WhatsApp Web or WhatsApp Desktop directly"
                >
                  Open in WhatsApp Web
                </button>
                <button
                  type="button"
                  disabled={isSendingWhatsApp}
                  onClick={() => handleSendWhatsApp(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-theme-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.897 2.796.897 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.385 8.167c-.145.407-.723.754-1.026.8-.297.045-.67.064-1.082-.068-.255-.082-.581-.194-1.002-.375-1.776-.767-2.934-2.55-3.023-2.668-.088-.117-.722-.961-.722-1.832 0-.871.455-1.301.617-1.477.162-.176.353-.22.47-.22.118 0 .235.001.338.006.11.005.257-.042.403.308.146.352.5 1.22.544 1.309.044.088.073.191.015.308-.059.117-.088.19-.176.293-.088.103-.186.23-.265.31-.088.088-.18.184-.078.36.103.176.457.755.981 1.221.674.6 1.242.787 1.418.874.177.088.28.074.383-.044.103-.117.441-.513.559-.69.117-.176.235-.146.397-.088.162.059 1.029.485 1.206.573.176.088.294.132.338.206.044.073.044.426-.101.833z"/>
                  </svg>
                  {isSendingWhatsApp ? "Sending..." : "Send WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
