import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { faker } from "@faker-js/faker";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.communication.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Ahmedabad",
  ];

  const customers = [];

  for (let i = 0; i < 5000; i++) {
    const uniqueId = i.toString().padStart(5, "0");
    customers.push({
      name: faker.person.fullName(),
      email: `customer.${uniqueId}@example.com`,
      phone: faker.phone.number({ style: "international" }),
      city: faker.helpers.arrayElement(cities),
    });
  }

  await prisma.customer.createMany({
    data: customers,
  });

  console.log("✅ Customers inserted");

  const allCustomers = await prisma.customer.findMany({
    select: {
      id: true,
    },
  });

  const orders = [];

  for (const customer of allCustomers) {
    const numberOfOrders = faker.number.int({
      min: 1,
      max: 8,
    });

    for (let i = 0; i < numberOfOrders; i++) {
      orders.push({
        customerId: customer.id,

        totalAmount: faker.number.float({
          min: 500,
          max: 20000,
          fractionDigits: 2,
        }),

        orderDate: faker.date.between({
          from: new Date("2024-01-01"),
          to: new Date(),
        }),
      });
    }
  }

  await prisma.order.createMany({
    data: orders,
  });

  console.log("✅ Orders inserted");

  console.log("🎉 Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
