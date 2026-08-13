import { Resend } from "resend";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[Resend Email] RESEND_API_KEY is not configured in environment variables.");
    return null;
  }
  return new Resend(key);
}

// Sender address configuration
const DEFAULT_FROM = process.env.EMAIL_FROM || "AMD Global <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "aasimameer06@gmail.com";

// Helper: Resend testing mode (onboarding@resend.dev) restricts delivery exclusively to the verified account owner email
function resolveRecipients(primaryEmail?: string): string[] {
  const isTestSender = DEFAULT_FROM.includes("onboarding@resend.dev");
  if (isTestSender) {
    return [ADMIN_EMAIL];
  }
  const list: string[] = [];
  if (primaryEmail && primaryEmail.trim()) {
    list.push(primaryEmail.trim());
  }
  if (ADMIN_EMAIL && !list.includes(ADMIN_EMAIL)) {
    list.push(ADMIN_EMAIL);
  }
  return list.length ? list : [ADMIN_EMAIL];
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PNRNotificationData {
  pnrNumber: string;
  passengerName: string;
  passengerEmail?: string;
  flightDetails: {
    airline?: string;
    flightNumber?: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    cabinClass?: string;
    totalAmount?: string | number;
  };
  status?: string;
  bookingDate?: string;
}

export interface VisaSubmissionNotificationData {
  applicationId: string;
  applicantName: string;
  applicantEmail?: string;
  country: string;
  visaType: string;
  visaPlan?: string;
  passportNumber: string;
  submissionDate?: string;
  status?: string;
  phone?: string;
}

// ─── Email Template Helpers ──────────────────────────────────────────────────

function getHeaderHTML(title: string, subtitle: string) {
  return `
    <div style="background-color: #0f172a; padding: 24px 32px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
      <h1 style="color: #f97316; margin: 0; font-size: 24px; font-family: 'Outfit', Arial, sans-serif; font-weight: 800; letter-spacing: 0.5px;">
        AMD GLOBAL TRAVEL
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; font-family: Arial, sans-serif; text-transform: uppercase; tracking: 1px;">
        ${title}
      </p>
    </div>
    <div style="background-color: #f97316; height: 4px; width: 100%;"></div>
  `;
}

function getFooterHTML() {
  return `
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; font-family: Arial, sans-serif;">
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #334155;">AMD Global Travel Portal</p>
      <p style="margin: 0 0 8px 0;">Worldwide Flight Bookings · Visa Services · Travel Solutions</p>
      <p style="margin: 0; color: #94a3b8;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
}

// ─── 1. PNR Notification Email ───────────────────────────────────────────────

export async function sendPNRNotification(pnrData: PNRNotificationData) {
  try {
    const {
      pnrNumber,
      passengerName,
      passengerEmail,
      flightDetails,
      status = "CONFIRMED",
      bookingDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    } = pnrData;

    const recipientList = resolveRecipients(passengerEmail);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New PNR Generated - AMD Global Travel</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: Arial, sans-serif; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          ${getHeaderHTML("Booking Confirmation & PNR", "New PNR Generated")}
          
          <div style="padding: 32px;">
            <!-- PNR Banner -->
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                Record Locator / PNR Number
              </span>
              <span style="font-size: 28px; font-weight: 800; color: #1e40af; font-family: monospace; letter-spacing: 2px;">
                ${pnrNumber}
              </span>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
              Dear <strong>${passengerName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Your flight itinerary has been processed and a live Record Locator (PNR) has been generated with AMD Global Travel.
            </p>

            <!-- Flight Details Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left;">
                  <th colSpan="2" style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                    Flight Details & Itinerary
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Route:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${flightDetails.origin} &rarr; ${flightDetails.destination}
                  </td>
                </tr>
                ${flightDetails.airline || flightDetails.flightNumber ? `
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Airline & Flight:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${flightDetails.airline || ""} ${flightDetails.flightNumber || ""}
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Departure Date:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${flightDetails.departureDate}
                  </td>
                </tr>
                ${flightDetails.returnDate ? `
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Return Date:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${flightDetails.returnDate}
                  </td>
                </tr>` : ""}
                ${flightDetails.cabinClass ? `
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Cabin Class:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${flightDetails.cabinClass}
                  </td>
                </tr>` : ""}
                ${flightDetails.totalAmount ? `
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Total Amount:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #16a34a; border-bottom: 1px solid #e2e8f0;">
                    ${flightDetails.totalAmount}
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b;">Booking Status:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #2563eb;">
                    ${status.toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>

            ${getFooterHTML()}
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending PNR notification (${pnrNumber}) to:`, recipientList);

    const resend = getResendClient();
    if (!resend) {
      console.warn(`[Resend Email Skipped] RESEND_API_KEY is not configured.`);
      return { success: false, error: "RESEND_API_KEY missing" };
    }

    const response = await resend.emails.send({
      from: DEFAULT_FROM,
      to: recipientList,
      subject: "New PNR Generated - AMD Global Travel",
      html,
    });

    console.log(`[Resend Email OK] PNR notification sent successfully. Result:`, response);
    return { success: true, data: response };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Resend Email Error] Failed to send PNR notification:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ─── 2. Visa Submission Notification Email ──────────────────────────────────

export async function sendVisaSubmissionNotification(visaData: VisaSubmissionNotificationData) {
  try {
    const {
      applicationId,
      applicantName,
      applicantEmail,
      country,
      visaType,
      visaPlan = "Standard",
      passportNumber,
      submissionDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status = "PENDING",
      phone = "N/A",
    } = visaData;

    const recipientList = resolveRecipients(applicantEmail);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Visa Application Submitted - AMD Global Travel</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: Arial, sans-serif; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          ${getHeaderHTML("Visa Application Confirmation", "Application Received")}
          
          <div style="padding: 32px;">
            <!-- Application Ref Banner -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                Application Reference Number
              </span>
              <span style="font-size: 26px; font-weight: 800; color: #15803d; font-family: monospace; letter-spacing: 2px;">
                ${applicationId}
              </span>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
              Dear <strong>${applicantName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for submitting your visa application with AMD Global Travel. Our visa processing team has received your application and is currently verifying your documents.
            </p>

            <!-- Application Details Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left;">
                  <th colSpan="2" style="padding: 12px 16px; font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                    Application Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Applicant Name:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${applicantName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Destination Country:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${country}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Visa Type & Plan:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${visaType} (${visaPlan})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Passport Number:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; font-family: monospace; border-bottom: 1px solid #e2e8f0;">
                    ${passportNumber}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Submission Date:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${submissionDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b;">Current Status:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #d97706;">
                    ${status.toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>

            ${getFooterHTML()}
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`[Resend Email] Sending Visa notification (${applicationId}) to:`, recipientList);

    const resend = getResendClient();
    if (!resend) {
      console.warn(`[Resend Email Skipped] RESEND_API_KEY is not configured.`);
      return { success: false, error: "RESEND_API_KEY missing" };
    }

    const response = await resend.emails.send({
      from: DEFAULT_FROM,
      to: recipientList,
      subject: "Visa Application Submitted - AMD Global Travel",
      html,
    });

    console.log(`[Resend Email OK] Visa notification sent successfully. Result:`, response);
    return { success: true, data: response };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Resend Email Error] Failed to send Visa notification:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}
