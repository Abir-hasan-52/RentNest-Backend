import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";
import { Role, UserStatus } from "../generated/prisma/enums";
import config from "../src/config";

async function main() {

  // Environment Variables
  const adminName = config.admin_name || "RentNest Admin";
  const adminEmail = config.admin_email;
  const adminPassword = config.admin_password;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be provided in .env");
  }

  // Check Existing Admin

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists.");
    return;
  }

  // Hash Password

  const hashedPassword = await bcrypt.hash(
    adminPassword,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  // Create Admin

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(" Admin created successfully.");
  console.log(` Email: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
