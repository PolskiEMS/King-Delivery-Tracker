import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  await prisma.user.upsert({
    where: { email: "admin@king.pl" },
    update: {},
    create: {
      email: "admin@king.pl",
      password: passwordHash,
      firstName: "Admin",
      lastName: "Systemu",
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "dyspozytor@king.pl" },
    update: {},
    create: {
      email: "dyspozytor@king.pl",
      password: passwordHash,
      firstName: "Jan",
      lastName: "Dyspozytor",
      role: UserRole.DISPATCHER,
    },
  });

  await prisma.user.upsert({
    where: { email: "kierowca@king.pl" },
    update: {},
    create: {
      email: "kierowca@king.pl",
      password: passwordHash,
      firstName: "Piotr",
      lastName: "Kierowca",
      role: UserRole.DRIVER,
    },
  });

  await prisma.driver.upsert({
    where: { id: "demo-driver-1" },
    update: {},
    create: {
      id: "demo-driver-1",
      firstName: "Piotr",
      lastName: "Nowak",
      phone: "+48 600 123 456",
      active: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { registration: "WZ1234A" },
    update: {},
    create: {
      registration: "WZ1234A",
      brand: "Mercedes",
      model: "Actros",
      pallets: 33,
    },
  });

  console.log("Seed zakończony.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });