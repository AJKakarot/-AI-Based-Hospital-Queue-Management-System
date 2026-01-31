"use server";

import { db } from "@/lib/prisma";

/**
 * Get doctors by specialty
 */
export async function getDoctorsBySpecialty(specialty) {
  try {
    const specialtyName = decodeURIComponent(specialty).split("%20").join(" ");
    
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        specialty: {
          contains: specialtyName,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        imageUrl: true,
        description: true,
        experience: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { doctors: doctors || [] };
  } catch (error) {
    console.error("Failed to fetch doctors by specialty:", error);
    return { doctors: [], error: error.message || "Failed to fetch doctors" };
  }
}
