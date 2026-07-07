import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  }),
});

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

async function upsertUser({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      salt,
      passwordHash,
    },
    create: {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      salt,
      passwordHash,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          provider: "credentials",
          providerAccountId: email,
        },
      },
    },
  });
}

async function main() {
  await upsertUser({
    name: "Demo User",
    email: "demo@cloover.dev",
    password: "password123",
    role: "user",
  });

  await upsertUser({
    name: "Demo Admin",
    email: "admin@cloover.dev",
    password: "password123",
    role: "admin",
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
