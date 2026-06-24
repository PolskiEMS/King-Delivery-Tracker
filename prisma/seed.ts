import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "demo123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: "admin@king.pl" },
    update: { password, passwordHash },
    create: {
      email: "admin@king.pl",
      passwordHash,
      password,
      firstName: "Admin",
      lastName: "Systemu",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "dyspozytor@king.pl" },
    update: { password, passwordHash },
    create: {
      email: "dyspozytor@king.pl",
      passwordHash,
      password,
      firstName: "Jan",
      lastName: "Dyspozytor",
      role: "DISPATCHER",
    },
  });

  await prisma.user.upsert({
    where: { email: "kierowca@king.pl" },
    update: { password, passwordHash },
    create: {
      email: "kierowca@king.pl",
      passwordHash,
      password,
      firstName: "Piotr",
      lastName: "Kierowca",
      role: "DRIVER",
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