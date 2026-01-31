import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location")?.trim() || "";
    const specialty = searchParams.get("specialty")?.trim() || "";

    const where = {};

    if (location) {
      where.hospital = {
        OR: [
          { city: { contains: location, mode: "insensitive" } },
          { area: { contains: location, mode: "insensitive" } },
          { pincode: { contains: location, mode: "insensitive" } },
        ],
      };
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: "insensitive" };
    }

    if (Object.keys(where).length === 0) {
      return NextResponse.json(
        { error: "Please provide location or specialty" },
        { status: 400 }
      );
    }

    const doctors = await db.curatedDoctor.findMany({
      where,
      include: {
        hospital: true,
      },
      orderBy: [
        { hospital: { city: "asc" } },
        { hospital: { area: "asc" } },
      ],
    });

    const results = doctors.map((doctor) => ({
      id: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      hospitalName: doctor.hospital.name,
      city: doctor.hospital.city,
      area: doctor.hospital.area || "",
      pincode: doctor.hospital.pincode || "",
      opdTimings: doctor.opdTimings,
      consultationFee: doctor.consultationFee,
      address: [
        doctor.hospital.area,
        doctor.hospital.city,
        doctor.hospital.pincode,
      ]
        .filter(Boolean)
        .join(", "),
    }));

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Curated care search error:", error);
    return NextResponse.json(
      { error: "Failed to search healthcare providers" },
      { status: 500 }
    );
  }
}
