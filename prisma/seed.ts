import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../server/auth/passwordHasher";

interface SeedUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  passwordHash: string;
}

const prisma = new PrismaClient();

async function readLegacyUsers(): Promise<SeedUser[]> {
  const filePath = path.resolve(
    process.cwd(),
    process.env.USERS_DATA_FILE ?? "server/data/users.json"
  );

  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(fileContent);

    return Array.isArray(parsed) ? (parsed as SeedUser[]) : [];
  } catch {
    return [];
  }
}

async function buildSeedUsers(): Promise<SeedUser[]> {
  const legacyUsers = await readLegacyUsers();
  const demoEmail = process.env.DEMO_USER_EMAIL ?? "demo@jinhualun.app";
  const hasDemoUser = legacyUsers.some((user) => user.email === demoEmail);

  if (hasDemoUser) {
    return legacyUsers;
  }

  const demoPassword = process.env.DEMO_USER_PASSWORD ?? "Demo123456";
  const demoDisplayName = process.env.DEMO_USER_DISPLAY_NAME ?? "Demo User";
  const demoUser: SeedUser = {
    id: "seed-demo-user",
    email: demoEmail,
    displayName: demoDisplayName,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(demoPassword)
  };

  return [...legacyUsers, demoUser];
}

async function main() {
  const users = await buildSeedUsers();

  for (const user of users) {
    await prisma.userAccount.upsert({
      where: { email: user.email },
      update: {
        displayName: user.displayName,
        passwordHash: user.passwordHash
      },
      create: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(user.createdAt),
        passwordHash: user.passwordHash
      }
    });
  }

  console.log(`Seeded ${users.length} auth users.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed auth users.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
