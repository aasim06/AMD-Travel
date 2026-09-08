import type { FlightOffer } from "@/types/flight";
import { AIRLINE_NAMES } from "@/types/flight";
import type { CheckoutData } from "@/components/checkout/types";

export interface FlightTicketPdfOptions {
  pnr: string;
  offer: FlightOffer;
  formData: CheckoutData;
  carriers: Record<string, string>;
  selectedPrice: number;
  formattedPrice: string;
  bookingSource?: string | null;
}

function parseDuration(iso?: string | null): string {
  if (!iso || typeof iso !== "string") return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  return [m[1] ? `${m[1]}h` : "", m[2] ? `${m[2]}m` : ""].filter(Boolean).join(" ");
}

function formatCleanDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCleanTime(iso?: string | null): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Draws crisp simulated airline barcode bars
 */
function drawBarcode(doc: any, x: number, y: number, w: number, h: number, code: string) {
  const pattern = [
    2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2,
    3, 1, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 1, 2, 1, 3, 1, 2, 2, 1,
  ];

  let curX = x;
  doc.setFillColor(15, 23, 42); // slate-900

  for (let i = 0; i < pattern.length; i++) {
    const barW = pattern[i] * 0.9;
    if (i % 2 === 0) {
      doc.rect(curX, y, barW, h, "F");
    }
    curX += barW + 1.1;
    if (curX > x + w - 4) break;
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`* ETKT-${code}-AMADEUS *`, x + w / 2, y + h + 8, { align: "center" });
}

/**
 * Draws a clean vector airplane silhouette on the route trajectory line
 */
function drawAirplaneVector(doc: any, cx: number, cy: number, color = [30, 64, 175]) {
  doc.setFillColor(color[0], color[1], color[2]);
  // Fuselage (main body)
  doc.roundedRect(cx - 9, cy - 1.5, 17, 3, 1.5, 1.5, "F");
  // Nose tip
  doc.triangle(cx + 8, cy - 1.5, cx + 12, cy, cx + 8, cy + 1.5, "F");
  // Swept wings (top & bottom)
  doc.triangle(cx + 2, cy - 8.5, cx + 5, cy, cx - 4, cy, "F");
  doc.triangle(cx + 2, cy + 8.5, cx + 5, cy, cx - 4, cy, "F");
  // Tail stabilizers
  doc.triangle(cx - 7, cy - 4.5, cx - 4.5, cy, cx - 8.5, cy, "F");
  doc.triangle(cx - 7, cy + 4.5, cx - 4.5, cy, cx - 8.5, cy, "F");
}

export async function generateFlightTicketPdf({
  pnr,
  offer,
  formData,
  carriers,
  selectedPrice,
  formattedPrice,
  bookingSource,
}: FlightTicketPdfOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  const W = doc.internal.pageSize.getWidth(); // 595.28 pt
  const margin = 32;
  const contentW = W - margin * 2; // 531.28 pt
  let y = 0;

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. CLEAN EXECUTIVE LUXURY HEADER (NO CARTOON ICON)
  // ══════════════════════════════════════════════════════════════════════════════
  const headerHeight = 70;
  doc.setFillColor(10, 22, 41); // #0A1629 deep executive navy
  doc.rect(0, 0, W, headerHeight, "F");

  // Gold accent stripe
  doc.setFillColor(217, 119, 6); // amber-600 gold
  doc.rect(0, headerHeight, W, 3, "F");

  // Company Name - Clean modern luxury typography aligned cleanly at margin
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("AMD GLOBAL TRAVEL", margin, 33);

  // Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(212, 160, 23); // gold amber
  doc.text("OFFICIAL PASSENGER ELECTRONIC TICKET & ITINERARY RECEIPT", margin, 47);

  // Corporate subtext
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(180, 198, 225);
  doc.text("Frankfurt am Main, Germany · www.amdglobal.de", margin, 58);

  // Header Right: Status & Agency Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("IATA ACCREDITED AGENCY #DE-892140", W - margin, 24, { align: "right" });

  // Confirmed Pill
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(W - margin - 130, 30, 130, 18, 9, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CONFIRMED & ISSUED", W - margin - 65, 42, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(`ISSUED: ${nowStr} · AMADEUS LIVE`, W - margin, 58, { align: "right" });

  y = 86;

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. HERO PNR & BOARDING PASS CARD (NO OVERLAPPING - AMPLE ROOM FOR PNR)
  // ══════════════════════════════════════════════════════════════════════════════
  const pnrBoxH = 66;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentW, pnrBoxH, 8, 8, "FD");

  // Decorative left vertical color accent
  doc.setFillColor(30, 64, 175); // blue-700
  doc.roundedRect(margin, y, 6, pnrBoxH, 3, 3, "F");

  // Left Section: PNR Header
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("AIRLINE RECORD LOCATOR (PNR)", margin + 18, y + 17);

  // Dynamic PNR Font Size so even 15+ character references NEVER cut or overlap!
  let pnrFontSize = 23;
  if (pnr.length > 15) pnrFontSize = 16;
  else if (pnr.length > 11) pnrFontSize = 18;
  else if (pnr.length > 8) pnrFontSize = 20;

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("courier", "bold");
  doc.setFontSize(pnrFontSize);
  doc.text(pnr, margin + 18, y + 40);

  // Subtitle row: Amadeus status & baggage information (underneath PNR, not beside it)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const isLive = bookingSource === "AMADEUS_LIVE";
  doc.text(
    `Live GDS Reference (${isLive ? "Amadeus Certified" : "Verified"}) · ${formData.passengers.length} Passenger(s) · Cabin: Economy Standard · Baggage: 23kg + 7kg Included`,
    margin + 18,
    y + 55
  );

  // Right Section: Vector Barcode (Aligned far to the right, completely separated from PNR)
  const barcodeW = 145;
  const barcodeX = W - margin - barcodeW - 12;
  drawBarcode(doc, barcodeX, y + 12, barcodeW, 30, pnr);

  y += pnrBoxH + 12;

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. FLIGHT ITINERARIES
  // ══════════════════════════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("FLIGHT ITINERARY DETAILS", margin, y);
  y += 10;

  offer.itineraries.forEach((itin, idx) => {
    const s0 = itin.segments[0];
    const sLast = itin.segments.at(-1)!;
    const isMulti = offer.itineraries.length > 2;
    const isReturn = idx === 1 && offer.itineraries.length === 2;
    const label = isMulti ? `FLIGHT ${idx + 1}` : isReturn ? "RETURN FLIGHT" : "OUTBOUND FLIGHT";
    const airlineName = carriers[s0.carrierCode] ?? AIRLINE_NAMES[s0.carrierCode] ?? s0.carrierCode;
    const flightNumber = `${s0.carrierCode} ${s0.flightNumber}`;
    const stopsCount = itin.segments.length - 1;
    const durationStr = parseDuration(itin.duration);

    const cardH = 88;

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentW, cardH, 6, 6, "FD");

    // Top Header Bar inside card
    const headerBg = isReturn ? [30, 41, 59] : [29, 78, 216]; // slate-800 or blue-700
    doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
    doc.roundedRect(margin, y, contentW, 20, 6, 6, "F");
    // Flatten bottom corners of the header bar
    doc.rect(margin, y + 12, contentW, 8, "F");

    // Flight Label
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, margin + 12, y + 14);

    // Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const dateStr = formatCleanDate(s0.departure.at);
    doc.text(dateStr.toUpperCase(), W - margin - 12, y + 14, { align: "right" });

    // ── Route Body ──
    const bodyY = y + 26;

    // Departure City/IATA
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(s0.departure.iataCode, margin + 16, bodyY + 22);

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text(formatCleanTime(s0.departure.at), margin + 16, bodyY + 37);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Departure Airport", margin + 16, bodyY + 48);

    // Middle Trajectory Line & Badges
    const lineStartX = margin + 110;
    const lineEndX = W - margin - 110;
    const lineY = bodyY + 20;

    // Flight line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1.5);
    doc.line(lineStartX, lineY, lineEndX, lineY);

    // Start circle
    doc.setFillColor(30, 64, 175);
    doc.circle(lineStartX, lineY, 2.5, "F");

    // End circle
    doc.setFillColor(30, 64, 175);
    doc.circle(lineEndX, lineY, 2.5, "F");

    // Airplane symbol in center
    const midPointX = (lineStartX + lineEndX) / 2;
    drawAirplaneVector(doc, midPointX, lineY, [30, 64, 175]);

    // Duration Pill Badge
    if (durationStr) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(midPointX - 35, lineY - 18, 70, 13, 6, 6, "F");
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(durationStr, midPointX, lineY - 9, { align: "center" });
    }

    // Stops Badge
    const stopsLabel = stopsCount === 0 ? "NON-STOP" : `${stopsCount} STOP${stopsCount > 1 ? "S" : ""}`;
    const stopColor = stopsCount === 0 ? [16, 185, 129] : [217, 119, 6];
    doc.setTextColor(stopColor[0], stopColor[1], stopColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(stopsLabel, midPointX, lineY + 12, { align: "center" });

    // Arrival City/IATA
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(sLast.arrival.iataCode, W - margin - 16, bodyY + 22, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text(formatCleanTime(sLast.arrival.at), W - margin - 16, bodyY + 37, { align: "right" });

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Arrival Airport", W - margin - 16, bodyY + 48, { align: "right" });

    // Bottom Stripe of Card: Airline Info
    doc.setFillColor(248, 250, 252);
    doc.rect(margin + 1, y + cardH - 18, contentW - 2, 17, "F");
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + cardH - 18, margin + contentW, y + cardH - 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Operating Carrier: ${airlineName} (${flightNumber})`, margin + 12, y + cardH - 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Status: Seat Confirmed at Check-in", W - margin - 12, y + cardH - 6, { align: "right" });

    y += cardH + 10;
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. PASSENGER MANIFEST TABLE
  // ══════════════════════════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("PASSENGER MANIFEST", margin, y + 6);
  y += 14;

  const rowH = 18;
  const colWidths = [24, 160, 60, 100, 100, 87];

  // Table Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentW, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);

  let colX = margin + 8;
  doc.text("#", colX, y + 12);
  colX += colWidths[0];
  doc.text("PASSENGER NAME", colX, y + 12);
  colX += colWidths[1];
  doc.text("TYPE", colX, y + 12);
  colX += colWidths[2];
  doc.text("PASSPORT NO.", colX, y + 12);
  colX += colWidths[3];
  doc.text("NATIONALITY", colX, y + 12);
  colX += colWidths[4];
  doc.text("STATUS", colX, y + 12);

  y += 18;

  formData.passengers.forEach((p, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentW, rowH, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y + rowH, margin + contentW, y + rowH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    let cx = margin + 8;
    doc.text(`${idx + 1}`, cx, y + 12);
    cx += colWidths[0];

    doc.setFont("helvetica", "bold");
    doc.text(`${p.title} ${p.firstName} ${p.lastName}`, cx, y + 12);
    cx += colWidths[1];

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("ADULT", cx, y + 12);
    cx += colWidths[2];

    doc.setFont("courier", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(p.passportNumber || "ON FILE", cx, y + 12);
    cx += colWidths[3];

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text((p.nationality || "N/A").toUpperCase(), cx, y + 12);
    cx += colWidths[4];

    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("CONFIRMED", cx, y + 12);

    y += rowH;
  });

  y += 12;

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. PAYMENT & FARE RECEIPT CARD
  // ══════════════════════════════════════════════════════════════════════════════
  const payH = 50;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentW, payH, 6, 6, "FD");

  // Left side: Gateway details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("PAYMENT METHOD", margin + 12, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("PAYONE GmbH (Germany) · Online Banking / Card", margin + 12, y + 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Transaction Ref: TXID-${pnr}-PAYONE · All aviation fuel, security charges & taxes included.`,
    margin + 12,
    y + 40
  );

  // Right side: Total Paid Badge
  const totalBoxW = 160;
  const totalBoxX = W - margin - totalBoxW - 8;
  doc.setFillColor(30, 64, 175); // blue-700
  doc.roundedRect(totalBoxX, y + 8, totalBoxW, 34, 4, 4, "F");

  doc.setTextColor(219, 234, 254);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("TOTAL AMOUNT PAID", totalBoxX + 10, y + 22);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(formattedPrice, totalBoxX + totalBoxW - 10, y + 30, { align: "right" });

  y += payH + 12;

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. IMPORTANT AIRLINE TRAVEL REGULATIONS & ADVICE (WITH WWW.AMDGLOBAL.DE)
  // ══════════════════════════════════════════════════════════════════════════════
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(margin, y, contentW, 46, 6, 6, "FD");

  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("IMPORTANT TRAVEL ADVICE & PASSENGER CHECK-IN INSTRUCTIONS", margin + 10, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 53, 15);
  doc.text(
    "1. Airport Counter Check-in opens 3 hours prior and strictly closes 60 minutes before departure.",
    margin + 10,
    y + 24
  );
  doc.text(
    "2. Valid Passport (minimum 6 months validity) & necessary destination/transit visas must be presented at the gate.",
    margin + 10,
    y + 33
  );
  doc.text(
    "3. For 24/7 Airline Assistance or Schedule Changes, contact: support@amdglobal.de | www.amdglobal.de",
    margin + 10,
    y + 42
  );

  y += 56;

  // ══════════════════════════════════════════════════════════════════════════════
  // 7. FOOTER MICROPRINT & DOCUMENT INTEGRITY SEAL
  // ══════════════════════════════════════════════════════════════════════════════
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "AMD Global Travel GmbH · Frankfurt am Main, Germany · www.amdglobal.de · support@amdglobal.de",
    W / 2,
    y + 11,
    { align: "center" }
  );

  doc.save(`AMD-${pnr}-Ticket.pdf`);
}
