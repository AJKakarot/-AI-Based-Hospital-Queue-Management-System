import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding curated healthcare database...");

  const hospitals = [
    {
      name: "Apollo Hospital",
      city: "Kanpur",
      area: "Civil Lines",
      pincode: "208001",
      latitude: 26.4499,
      longitude: 80.3319,
      doctors: [
        {
          name: "Dr. Rajesh Kumar",
          specialty: "General Physician",
          opdTimings: "10:00 AM - 2:00 PM",
          consultationFee: 500,
        },
        {
          name: "Dr. Priya Sharma",
          specialty: "Cardiology",
          opdTimings: "3:00 PM - 6:00 PM",
          consultationFee: 800,
        },
      ],
    },
    {
      name: "Lala Lajpat Rai Hospital",
      city: "Kanpur",
      area: "Swaroop Nagar",
      pincode: "208002",
      latitude: 26.4567,
      longitude: 80.3210,
      doctors: [
        {
          name: "Dr. Amit Verma",
          specialty: "Orthopedics",
          opdTimings: "9:00 AM - 1:00 PM",
          consultationFee: 600,
        },
        {
          name: "Dr. Sunita Singh",
          specialty: "Pediatrics",
          opdTimings: "2:00 PM - 5:00 PM",
          consultationFee: 550,
        },
      ],
    },
    {
      name: "Max Super Specialty Hospital",
      city: "Delhi",
      area: "Saket",
      pincode: "110017",
      latitude: 28.5245,
      longitude: 77.2066,
      doctors: [
        {
          name: "Dr. Anil Kapoor",
          specialty: "Cardiology",
          opdTimings: "11:00 AM - 3:00 PM",
          consultationFee: 1000,
        },
        {
          name: "Dr. Meera Patel",
          specialty: "Dermatology",
          opdTimings: "4:00 PM - 7:00 PM",
          consultationFee: 750,
        },
      ],
    },
    {
      name: "AIIMS Delhi",
      city: "Delhi",
      area: "Ansari Nagar",
      pincode: "110029",
      latitude: 28.5670,
      longitude: 77.2090,
      doctors: [
        {
          name: "Dr. Vikram Malhotra",
          specialty: "General Physician",
          opdTimings: "9:00 AM - 12:00 PM",
          consultationFee: 300,
        },
        {
          name: "Dr. Kavita Reddy",
          specialty: "Pediatrics",
          opdTimings: "1:00 PM - 4:00 PM",
          consultationFee: 400,
        },
      ],
    },
    {
      name: "Fortis Hospital",
      city: "Mumbai",
      area: "Mulund",
      pincode: "400080",
      latitude: 19.1700,
      longitude: 72.9400,
      doctors: [
        {
          name: "Dr. Ramesh Iyer",
          specialty: "Orthopedics",
          opdTimings: "10:00 AM - 2:00 PM",
          consultationFee: 900,
        },
        {
          name: "Dr. Neha Desai",
          specialty: "Dermatology",
          opdTimings: "3:00 PM - 6:00 PM",
          consultationFee: 850,
        },
      ],
    },
    {
      name: "Lilavati Hospital",
      city: "Mumbai",
      area: "Bandra",
      pincode: "400050",
      latitude: 19.0596,
      longitude: 72.8295,
      doctors: [
        {
          name: "Dr. Sameer Joshi",
          specialty: "Cardiology",
          opdTimings: "11:00 AM - 3:00 PM",
          consultationFee: 1200,
        },
        {
          name: "Dr. Anjali Mehta",
          specialty: "General Physician",
          opdTimings: "9:00 AM - 1:00 PM",
          consultationFee: 700,
        },
      ],
    },
    {
      name: "Kanpur Nagar Medical Center",
      city: "Kanpur",
      area: "Kanpur Nagar",
      pincode: "208001",
      latitude: 26.4499,
      longitude: 80.3319,
      doctors: [
        {
          name: "Dr. Ajeet Gupta",
          specialty: "Cardiology",
          opdTimings: "10:00 AM - 2:00 PM",
          consultationFee: 800,
        },
        {
          name: "Dr. Khushi Singh",
          specialty: "Obstetrics & Gynecology",
          opdTimings: "3:00 PM - 6:00 PM",
          consultationFee: 750,
        },
      ],
    },
  ];

  for (const hospitalData of hospitals) {
    const { doctors, ...hospitalInfo } = hospitalData;

    const existing = await prisma.hospital.findFirst({
      where: {
        name: hospitalInfo.name,
        city: hospitalInfo.city,
      },
    });

    if (existing) {
      await prisma.hospital.update({
        where: { id: existing.id },
        data: {
          ...hospitalInfo,
          doctors: {
            deleteMany: {},
            create: doctors,
          },
        },
      });
      console.log(`Updated hospital: ${hospitalInfo.name}`);
    } else {
      const hospital = await prisma.hospital.create({
        data: {
          ...hospitalInfo,
          doctors: {
            create: doctors,
          },
        },
        include: {
          doctors: true,
        },
      });
      console.log(`Created hospital: ${hospital.name} with ${hospital.doctors.length} doctors`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
