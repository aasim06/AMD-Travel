import path from "path";

// In-memory cache for loaded car image elements to eliminate HTTPS fetch latency (0ms cache hit)
const carImageCache = new Map<string, any>();

export interface CarVoucherData {
  pnr: string;
  driverName: string;
  phone: string;
  carName: string;
  carCategory: string;
  carImage?: string; // Selected vehicle image URL
  pickupLocation: string;
  pickupDate: string;
  returnDate?: string;
  totalDays: number;
  totalAmount: number | string;
  currency?: string;
  driverLicense?: string;
  status?: string;
}

/**
 * Dynamically generates a high-definition, world-class luxury PNG Voucher Card Image
 * with all live customer & booking details + selected car picture baked into the image.
 * Uses clean 'Segoe UI', Arial sans-serif typography (no broken square [] glyphs).
 * Returns base64 data URI (e.g. data:image/png;base64,...) ready for UltraMsg WhatsApp API.
 */
export async function generateDynamicCarVoucherBase64(data: CarVoucherData): Promise<string> {
  // Use dynamic require so Next.js Webpack server bundler doesn't attempt to bundle native node binaries
  const { createCanvas, loadImage } = eval("require")("@napi-rs/canvas");

  const width = 900;
  const height = 1250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const curr = data.currency === "EUR" ? "€" : "$";

  // 1. Premium Dark Luxury Background (#060D1B with linear gradient)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#060D1B");
  bgGrad.addColorStop(0.4, "#0A172E");
  bgGrad.addColorStop(1, "#050C18");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Background Lighting Glows (Gold Top Right, Cyan Bottom Left)
  const goldGlow = ctx.createRadialGradient(width - 150, 150, 10, width - 150, 150, 350);
  goldGlow.addColorStop(0, "rgba(234, 179, 8, 0.18)");
  goldGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, width, height);

  const cyanGlow = ctx.createRadialGradient(150, height - 200, 10, 150, height - 200, 400);
  cyanGlow.addColorStop(0, "rgba(14, 165, 233, 0.12)");
  cyanGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, width, height);

  // Outer Dual Gold Frame
  ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  ctx.strokeStyle = "rgba(234, 179, 8, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // ── HEADER ──
  ctx.fillStyle = "#EAB308";
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.fillText("AMD GLOBAL TRAVEL", 55, 75);

  ctx.fillStyle = "#94A3B8";
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillText("Official Luxury Rent-A-Car Digital Reservation Voucher", 55, 102);

  // PNR Badge Box (Right Top Header)
  const pnrBoxW = 260;
  const pnrBoxH = 60;
  const pnrBoxX = width - 55 - pnrBoxW;
  const pnrBoxY = 48;

  ctx.fillStyle = "rgba(234, 179, 8, 0.12)";
  ctx.strokeStyle = "#EAB308";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pnrBoxX, pnrBoxY, pnrBoxW, pnrBoxH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#F59E0B";
  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("BOOKING REFERENCE (PNR)", pnrBoxX + pnrBoxW / 2, pnrBoxY + 22);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 20px "Segoe UI", Arial, monospace';
  ctx.fillText(`#${data.pnr}`, pnrBoxX + pnrBoxW / 2, pnrBoxY + 46);
  ctx.textAlign = "left";

  // Divider Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(55, 130);
  ctx.lineTo(width - 55, 130);
  ctx.stroke();

  // ── SECTION 1: SELECTED VEHICLE CARD ──
  const card1X = 55;
  const card1Y = 155;
  const card1W = width - 110;
  const card1H = 210;

  ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(card1X, card1Y, card1W, card1H, 18);
  ctx.fill();
  ctx.stroke();

  // Vehicle Text Info
  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(data.carName, card1X + 30, card1Y + 52);

  ctx.fillStyle = "#38BDF8";
  ctx.font = '600 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`${data.carCategory || "Rental Vehicle"} • Full Coverage Included`, card1X + 30, card1Y + 84);

  ctx.fillStyle = "#94A3B8";
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Rental Rate: ${curr}${data.totalAmount} Total • Unlimited Mileage`, card1X + 30, card1Y + 116);

  // Status Badge (CONFIRMED)
  const badgeX = card1X + 30;
  const badgeY = card1Y + 140;
  ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, 150, 36, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#34D399";
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  const statusStr = (data.status || "CONFIRMED").toUpperCase();
  ctx.fillText(statusStr, badgeX + 32, badgeY + 23);

  // Draw Selected Car Image on Right Side
  if (data.carImage) {
    try {
      let loadedCarImg = carImageCache.get(data.carImage);
      if (!loadedCarImg) {
        const loadPromise = loadImage(data.carImage);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Image load timeout")), 800)
        );
        loadedCarImg = (await Promise.race([loadPromise, timeoutPromise])) as any;
        if (loadedCarImg) {
          carImageCache.set(data.carImage, loadedCarImg);
        }
      }

      const imgW = 270;
      const imgH = 166;
      const imgX = card1X + card1W - imgW - 22;
      const imgY = card1Y + 22;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 14);
      ctx.clip();
      ctx.drawImage(loadedCarImg, imgX, imgY, imgW, imgH);

      ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(imgX, imgY, imgW, imgH);
      ctx.restore();
    } catch (e) {
      console.warn("Could not load car image for voucher canvas:", (e as any)?.message || e);
    }
  }

  // ── SECTION 2: DRIVER & RESERVATION DETAILS (Clean Grid Layout) ──
  const card2X = 55;
  const card2Y = 390;
  const card2W = width - 110;
  const card2H = 580;

  ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(card2X, card2Y, card2W, card2H, 18);
  ctx.fill();
  ctx.stroke();

  // Section Header Title
  ctx.fillStyle = "#E2E8F0";
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText("RESERVATION DETAILS", card2X + 30, card2Y + 48);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(card2X + 30, card2Y + 68);
  ctx.lineTo(card2X + card2W - 30, card2Y + 68);
  ctx.stroke();

  // Grid Data Rows
  const detailsGrid = [
    { label: "PRIMARY DRIVER NAME", val: data.driverName },
    { label: "CONTACT PHONE NUMBER", val: data.phone },
    { label: "PICKUP LOCATION", val: data.pickupLocation },
    { label: "RENTAL PERIOD", val: `${data.pickupDate}${data.returnDate ? ` TO ${data.returnDate}` : ""}` },
    { label: "TOTAL RENTAL DURATION", val: `${data.totalDays} Days` },
    { label: "DRIVER LICENSE NO", val: data.driverLicense || "Verified at Pickup Counter" },
    { label: "PAYMENT STATUS", val: "Pay on Arrival (Confirmed Reservation)" },
  ];

  let startY = card2Y + 105;
  detailsGrid.forEach((row) => {
    ctx.fillStyle = "#64748B";
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.fillText(row.label, card2X + 30, startY);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = '600 17px "Segoe UI", Arial, sans-serif';
    ctx.fillText(row.val, card2X + 30, startY + 24);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(card2X + 30, startY + 38);
    ctx.lineTo(card2X + card2W - 30, startY + 38);
    ctx.stroke();

    startY += 68;
  });

  // ── SECTION 3: GRAND TOTAL PRICE BANNER ──
  const card3X = 55;
  const card3Y = 1000;
  const card3W = width - 110;
  const card3H = 120;

  const priceGrad = ctx.createLinearGradient(card3X, 0, card3X + card3W, 0);
  priceGrad.addColorStop(0, "#0F172A");
  priceGrad.addColorStop(1, "#1E293B");

  ctx.fillStyle = priceGrad;
  ctx.strokeStyle = "#EAB308";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(card3X, card3Y, card3W, card3H, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#94A3B8";
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText("TOTAL ESTIMATED RENTAL PRICE", card3X + 30, card3Y + 45);

  ctx.fillStyle = "#CBD5E1";
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`${data.totalDays} Days Rental • Zero Pre-Payment Required`, card3X + 30, card3Y + 78);

  ctx.fillStyle = "#EAB308";
  ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText(`${curr}${data.totalAmount}`, card3X + card3W - 30, card3Y + 72);
  ctx.textAlign = "left";

  // ── FOOTER ──
  ctx.fillStyle = "#64748B";
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("AMD Global Travel Fleet • Official Digital WhatsApp Voucher • www.amdglobaltravel.com", width / 2, 1160);
  ctx.fillText("Please present this PNR & original driver license at pickup counter. Safe travels!", width / 2, 1182);

  const buffer = canvas.toBuffer("image/png");
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW FUNCTION INTEGRATION: generateCarBookingCard
// ─────────────────────────────────────────────────────────────────────────────

export interface CarBookingData {
  companyName: string;
  companyTagline?: string;
  carPhotoUrl?: string | null;
  carName: string;
  customerName: string;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation: string;
  totalPrice: string;
  bookingId: string;
  companyPhone?: string;
  companyWebsite?: string;
  thankYouMessage?: string;
}

export async function generateCarBookingCard(
  data: CarBookingData
): Promise<{ dataUrl: string; buffer: Buffer }> {
  const { createCanvas, loadImage } = eval("require")("@napi-rs/canvas");

  const width = 736;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const margin = 36;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const vg = ctx.createLinearGradient(0, 0, 0, height);
  vg.addColorStop(0, "#ffffff");
  vg.addColorStop(1, "#f4f6f8");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);

  // Render exact website logo (Orange Icon + AMD Global + TRAVEL)
  drawExactWebsiteLogo(ctx, margin, 26);

  const badgeText = "Booking Confirmed";
  ctx.font = '700 14px "Segoe UI", Arial, sans-serif';
  const badgeTextW = ctx.measureText(badgeText).width;
  const badgeW = badgeTextW + 46;
  const badgeH = 36;
  const badgeX = width - margin - badgeW;
  const badgeY = 34;

  ctx.fillStyle = "#fef2e2";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(badgeX + 22, badgeY + badgeH / 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(badgeX + 17, badgeY + badgeH / 2);
  ctx.lineTo(badgeX + 21, badgeY + badgeH / 2 + 4);
  ctx.lineTo(badgeX + 28, badgeY + badgeH / 2 - 5);
  ctx.stroke();

  ctx.fillStyle = "#c2410c";
  ctx.font = '700 14px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(badgeText, badgeX + 40, badgeY + badgeH / 2 + 5);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, 98);
  ctx.lineTo(width - margin, 98);
  ctx.stroke();

  const photoX = margin, photoY = 122, photoW = width - margin * 2, photoH = 340, photoR = 24;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
  ctx.clip();

  if (data.carPhotoUrl?.trim()) {
    try {
      let carImg = carImageCache.get(data.carPhotoUrl.trim());
      if (!carImg) {
        const loadPromise = loadImage(data.carPhotoUrl.trim());
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Image load timeout")), 800)
        );
        carImg = (await Promise.race([loadPromise, timeoutPromise])) as any;
        if (carImg) {
          carImageCache.set(data.carPhotoUrl.trim(), carImg);
        }
      }

      const imgAspect = carImg.width / carImg.height;
      const boxAspect = photoW / photoH;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (imgAspect > boxAspect) {
        drawH = photoH;
        drawW = drawH * imgAspect;
        drawX = photoX - (drawW - photoW) / 2;
        drawY = photoY;
      } else {
        drawW = photoW;
        drawH = drawW / imgAspect;
        drawX = photoX;
        drawY = photoY - (drawH - photoH) / 2;
      }
      ctx.drawImage(carImg, drawX, drawY, drawW, drawH);
    } catch {
      const carGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
      carGrad.addColorStop(0, "#f1f5f9");
      carGrad.addColorStop(1, "#dbe2e8");
      ctx.fillStyle = carGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }
  } else {
    const carGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
    carGrad.addColorStop(0, "#f1f5f9");
    carGrad.addColorStop(1, "#dbe2e8");
    ctx.fillStyle = carGrad;
    ctx.fillRect(photoX, photoY, photoW, photoH);
  }
  ctx.restore();

  ctx.font = '700 18px "Segoe UI", Arial, sans-serif';
  const chipW = ctx.measureText(data.carName).width + 32;
  const chipH = 44;
  const chipX = photoX + 16;
  const chipY = photoY + photoH - chipH - 16;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#111827";
  ctx.textAlign = "left";
  ctx.fillText(data.carName, chipX + 16, chipY + chipH / 2 + 6);

  let dy = photoY + photoH + 44;
  const col1X = margin;
  const col2X = width / 2 + 10;
  const rowH = 76;

  const circleIcon = (x: number, y: number, bg: string, fg: string, label: string) => {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x + 13, y + 7, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = '700 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(label, x + 13, y + 11);
  };

  const detailRow = (x: number, iconBg: string, iconFg: string, iconLabel: string, label: string, value: string) => {
    circleIcon(x, dy - 14, iconBg, iconFg, iconLabel);
    ctx.fillStyle = "#9ca3af";
    ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(label.toUpperCase(), x + 38, dy - 4);
    ctx.fillStyle = "#111827";
    ctx.font = '700 17px "Segoe UI", Arial, sans-serif';
    ctx.fillText(value, x + 38, dy + 18);
  };

  detailRow(col1X, "#eff6ff", "#2563eb", "C", "Customer", data.customerName);
  detailRow(col2X, "#fef3e7", "#d97706", "K", "Car", data.carName);
  dy += rowH;

  detailRow(col1X, "#eef8f0", "#16a34a", "P", "Pickup", data.pickupDateTime);
  detailRow(col2X, "#fdeaea", "#dc2626", "R", "Return", data.returnDateTime);
  dy += rowH;

  detailRow(col1X, "#f2edfb", "#7c3aed", "L", "Pickup Location", data.pickupLocation);
  detailRow(col2X, "#e6f7f6", "#0d9488", "$", "Total Price", data.totalPrice);
  dy += rowH;

  ctx.strokeStyle = "#e5e7eb";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(margin, dy - rowH + 24);
  ctx.lineTo(width - margin, dy - rowH + 24);
  ctx.stroke();
  ctx.setLineDash([]);

  detailRow(col1X, "#f1f5f9", "#334155", "#", "Booking ID", data.bookingId);

  const footerY = dy + 60;
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(margin, footerY - 30);
  ctx.lineTo(width - margin, footerY - 30);
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = '700 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(
    data.thankYouMessage || `Thank you for booking with ${data.companyName}!`,
    width / 2,
    footerY
  );

  const contactParts = [data.companyPhone, data.companyWebsite].filter(Boolean);
  if (contactParts.length) {
    ctx.fillStyle = "#6b7280";
    ctx.font = '500 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText(contactParts.join("   •   "), width / 2, footerY + 28);
  }

  const buffer = canvas.toBuffer("image/png");
  const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

  return { dataUrl, buffer };
}

function drawExactWebsiteLogo(ctx: any, margin = 36, topY = 26) {
  // 1. Draw Orange Rounded Square Icon (#FF5722)
  const iconW = 44;
  const iconH = 44;
  const iconR = 12;
  const iconX = margin;
  const iconY = topY;

  ctx.fillStyle = "#FF5722";
  ctx.beginPath();
  ctx.roundRect(iconX, iconY, iconW, iconH, iconR);
  ctx.fill();

  // White Plane/Compass Icon
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.8;

  // Dashed Circle
  ctx.beginPath();
  ctx.arc(iconX + iconW / 2, iconY + iconH / 2, 11, 0, Math.PI * 2);
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([3, 2.5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1.0;

  // Plane Shape Path
  ctx.beginPath();
  const cx = iconX + iconW / 2;
  const cy = iconY + iconH / 2;
  ctx.moveTo(cx - 8, cy + 2.5);
  ctx.lineTo(cx - 3, cy - 0);
  ctx.lineTo(cx - 0.5, cy - 6);
  ctx.lineTo(cx + 1, cy - 0.5);
  ctx.lineTo(cx + 5, cy - 2);
  ctx.lineTo(cx + 4, cy + 2.5);
  ctx.lineTo(cx + 9.5, cy + 0.5);
  ctx.lineTo(cx + 6.5, cy + 5);
  ctx.lineTo(cx - 8, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Draw Text: "AMD Global" + "TRAVEL"
  const textX = iconX + iconW + 12;

  ctx.textAlign = "left";
  ctx.font = '800 22px "Segoe UI", Arial, sans-serif';

  // "AMD"
  ctx.fillStyle = "#111827";
  ctx.fillText("AMD", textX, iconY + 24);
  const amdW = ctx.measureText("AMD").width;

  // " Global"
  ctx.fillStyle = "#FF5722";
  ctx.fillText(" Global", textX + amdW, iconY + 24);

  // Subtitle: "TRAVEL"
  ctx.fillStyle = "#6B7280";
  ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText("TRAVEL", textX + 1, iconY + 40);
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW FUNCTION INTEGRATION: generateUmrahBookingCard
// ─────────────────────────────────────────────────────────────────────────────

export interface UmrahBookingCardData {
  companyName: string;
  companyTagline?: string;
  umrahPhotoUrl?: string | null;
  packageTitle: string;
  customerName: string;
  departureCity: string;
  departureDate: string;
  totalPilgrims?: string | number;
  totalPrice: string;
  bookingId: string;
  companyPhone?: string;
  companyWebsite?: string;
  thankYouMessage?: string;
}

export async function generateUmrahBookingCard(
  data: UmrahBookingCardData
): Promise<{ dataUrl: string; buffer: Buffer }> {
  const { createCanvas, loadImage } = eval("require")("@napi-rs/canvas");

  const width = 736;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const margin = 36;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const vg = ctx.createLinearGradient(0, 0, 0, height);
  vg.addColorStop(0, "#ffffff");
  vg.addColorStop(1, "#f4f6f8");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);

  // Render exact website logo (Orange Icon + AMD Global + TRAVEL)
  drawExactWebsiteLogo(ctx, margin, 26);

  const badgeText = "Reservation Confirmed";
  ctx.font = '700 14px "Segoe UI", Arial, sans-serif';
  const badgeTextW = ctx.measureText(badgeText).width;
  const badgeW = badgeTextW + 46;
  const badgeH = 36;
  const badgeX = width - margin - badgeW;
  const badgeY = 34;

  ctx.fillStyle = "#ecfdf5";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();

  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(badgeX + 22, badgeY + badgeH / 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(badgeX + 17, badgeY + badgeH / 2);
  ctx.lineTo(badgeX + 21, badgeY + badgeH / 2 + 4);
  ctx.lineTo(badgeX + 28, badgeY + badgeH / 2 - 5);
  ctx.stroke();

  ctx.fillStyle = "#047857";
  ctx.font = '700 14px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(badgeText, badgeX + 40, badgeY + badgeH / 2 + 5);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, 98);
  ctx.lineTo(width - margin, 98);
  ctx.stroke();

  const photoX = margin, photoY = 122, photoW = width - margin * 2, photoH = 340, photoR = 24;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
  ctx.clip();

  const localKaabaPath = path.join(process.cwd(), "public", "images", "umrah_kaaba.jpg");
  const targetPhotoUrl = data.umrahPhotoUrl?.trim() || localKaabaPath;

  let loadedImg: any = null;

  try {
    loadedImg = carImageCache.get(targetPhotoUrl);
    if (!loadedImg) {
      const loadPromise = loadImage(targetPhotoUrl);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image load timeout")), 5000)
      );
      loadedImg = (await Promise.race([loadPromise, timeoutPromise])) as any;
      if (loadedImg) {
        carImageCache.set(targetPhotoUrl, loadedImg);
      }
    }
  } catch (e) {
    console.warn("[Umrah Voucher Generator] Network image load failed/timed out, attempting local fallback:", (e as any)?.message);
  }

  // Failsafe: If targetPhotoUrl failed, load local umrah_kaaba.jpg from disk (takes 2ms)
  if (!loadedImg) {
    try {
      loadedImg = carImageCache.get(localKaabaPath);
      if (!loadedImg) {
        loadedImg = await loadImage(localKaabaPath);
        if (loadedImg) {
          carImageCache.set(localKaabaPath, loadedImg);
        }
      }
    } catch (localErr) {
      console.error("[Umrah Voucher Generator] Local Kaaba fallback failed:", localErr);
    }
  }

  if (loadedImg) {
    const imgAspect = loadedImg.width / loadedImg.height;
    const boxAspect = photoW / photoH;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (imgAspect > boxAspect) {
      drawH = photoH;
      drawW = drawH * imgAspect;
      drawX = photoX - (drawW - photoW) / 2;
      drawY = photoY;
    } else {
      drawW = photoW;
      drawH = drawW / imgAspect;
      drawX = photoX;
      drawY = photoY - (drawH - photoH) / 2;
    }
    ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
  } else {
    const bgGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
    bgGrad.addColorStop(0, "#064e3b");
    bgGrad.addColorStop(1, "#047857");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(photoX, photoY, photoW, photoH);
  }
  ctx.restore();

  ctx.font = '700 18px "Segoe UI", Arial, sans-serif';
  const chipW = ctx.measureText(data.packageTitle).width + 32;
  const chipH = 44;
  const chipX = photoX + 16;
  const chipY = photoY + photoH - chipH - 16;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#064e3b";
  ctx.textAlign = "left";
  ctx.fillText(data.packageTitle, chipX + 16, chipY + chipH / 2 + 6);

  let dy = photoY + photoH + 44;
  const col1X = margin;
  const col2X = width / 2 + 10;
  const rowH = 76;

  const circleIcon = (x: number, y: number, bg: string, fg: string, label: string) => {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x + 13, y + 7, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = '700 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(label, x + 13, y + 11);
  };

  const detailRow = (x: number, iconBg: string, iconFg: string, iconLabel: string, label: string, value: string) => {
    circleIcon(x, dy - 14, iconBg, iconFg, iconLabel);
    ctx.fillStyle = "#9ca3af";
    ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(label.toUpperCase(), x + 38, dy - 4);
    ctx.fillStyle = "#111827";
    ctx.font = '700 17px "Segoe UI", Arial, sans-serif';
    ctx.fillText(value, x + 38, dy + 18);
  };

  detailRow(col1X, "#ecfdf5", "#047857", "P", "Lead Pilgrim", data.customerName);
  detailRow(col2X, "#fef3e7", "#d97706", "U", "Umrah Package", data.packageTitle);
  dy += rowH;

  detailRow(col1X, "#eff6ff", "#2563eb", "D", "Departure City", data.departureCity);
  detailRow(col2X, "#fdeaea", "#dc2626", "T", "Travel Date", data.departureDate);
  dy += rowH;

  detailRow(col1X, "#f2edfb", "#7c3aed", "L", "Departure Airport", data.departureCity);
  detailRow(col2X, "#e6f7f6", "#0d9488", "$", "Total Package Amount", data.totalPrice);
  dy += rowH;

  ctx.strokeStyle = "#e5e7eb";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(margin, dy - rowH + 24);
  ctx.lineTo(width - margin, dy - rowH + 24);
  ctx.stroke();
  ctx.setLineDash([]);

  detailRow(col1X, "#f1f5f9", "#334155", "#", "Booking ID", data.bookingId);

  const footerY = dy + 60;
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(margin, footerY - 30);
  ctx.lineTo(width - margin, footerY - 30);
  ctx.stroke();

  ctx.fillStyle = "#064e3b";
  ctx.font = '700 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(
    data.thankYouMessage || `Thank you for choosing ${data.companyName} for your Umrah journey!`,
    width / 2,
    footerY
  );

  const contactParts = [data.companyPhone, data.companyWebsite].filter(Boolean);
  if (contactParts.length) {
    ctx.fillStyle = "#6b7280";
    ctx.font = '500 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText(contactParts.join("   •   "), width / 2, footerY + 28);
  }

  const buffer = canvas.toBuffer("image/png");
  const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

  return { dataUrl, buffer };
}
