import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVisaSubmissionNotification } from "@/lib/emailService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country,
      visaType,
      visaPlan,
      firstName,
      middleName,
      surname,
      fatherName,
      motherName,
      dob,
      placeOfBirth,
      maritalStatus,
      occupation,
      religion,
      nationality,
      gender,
      email,
      phone,
      passportNo,
      issueDate,
      expiryDate,
      passportFront,
      passportBack,
      passportPhoto,
      additionalDoc,
    } = body;

    if (!country || !visaType || !firstName || !surname || !email || !passportNo) {
      return NextResponse.json(
        { success: false, error: "Missing required application fields" },
        { status: 400 }
      );
    }

    // Generate unique Application Number: e.g. "VSA-981240"
    const applicationNo = `VSA-${Math.floor(100000 + Math.random() * 900000)}`;

    let application;
    try {
      application = await prisma.visaApplication.create({
        data: {
          applicationNo,
          country,
          visaType,
          visaPlan: visaPlan || "Standard",
          firstName,
          middleName,
          surname,
          fatherName,
          motherName,
          dob: dob ? new Date(dob) : new Date("1990-01-01"),
          placeOfBirth,
          maritalStatus,
          occupation,
          religion,
          nationality,
          gender: gender || "male",
          email,
          phone,
          passportNo,
          issueDate: issueDate ? new Date(issueDate) : new Date("2020-01-01"),
          expiryDate: expiryDate ? new Date(expiryDate) : new Date("2030-01-01"),
          passportFront: typeof passportFront === "string" ? passportFront : (body.passportFrontPreview || passportFront?.name || null),
          passportBack: typeof passportBack === "string" ? passportBack : (body.passportBackPreview || passportBack?.name || null),
          passportPhoto: typeof passportPhoto === "string" ? passportPhoto : (body.passportPhotoPreview || passportPhoto?.name || null),
          additionalDoc: typeof additionalDoc === "string" ? additionalDoc : (body.additionalDocPreview || additionalDoc?.name || null),
          status: "PENDING",
        },
      });
    } catch (dbErr: any) {
      console.warn("Prisma connection closed on create, reconnecting...", dbErr?.message);
      await prisma.$connect();
      application = await prisma.visaApplication.create({
        data: {
          applicationNo,
          country,
          visaType,
          visaPlan: visaPlan || "Standard",
          firstName,
          middleName,
          surname,
          fatherName,
          motherName,
          dob: dob ? new Date(dob) : new Date("1990-01-01"),
          placeOfBirth,
          maritalStatus,
          occupation,
          religion,
          nationality,
          gender: gender || "male",
          email,
          phone,
          passportNo,
          issueDate: issueDate ? new Date(issueDate) : new Date("2020-01-01"),
          expiryDate: expiryDate ? new Date(expiryDate) : new Date("2030-01-01"),
          passportFront: typeof passportFront === "string" ? passportFront : (body.passportFrontPreview || passportFront?.name || null),
          passportBack: typeof passportBack === "string" ? passportBack : (body.passportBackPreview || passportBack?.name || null),
          passportPhoto: typeof passportPhoto === "string" ? passportPhoto : (body.passportPhotoPreview || passportPhoto?.name || null),
          additionalDoc: typeof additionalDoc === "string" ? additionalDoc : (body.additionalDocPreview || additionalDoc?.name || null),
          status: "PENDING",
        },
      });
    }

    // Send Visa Submission email notification asynchronously without blocking
    sendVisaSubmissionNotification({
      applicationId: application.applicationNo,
      applicantName: `${firstName} ${surname}`.trim(),
      applicantEmail: email,
      country,
      visaType,
      visaPlan: visaPlan || "Standard",
      passportNumber: passportNo,
      submissionDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: application.status || "PENDING",
      phone,
    }).catch((emailErr) => console.error("[Visa Email Async Error]:", emailErr));

    return NextResponse.json({
      success: true,
      message: "Visa Application submitted successfully!",
      applicationNo: application.applicationNo,
      data: application,
    });
  } catch (error: any) {
    console.error("Failed to submit visa application:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
