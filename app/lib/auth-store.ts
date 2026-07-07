import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { AuthStoreGlobal, StoredUser, PublicUser, UserRole } from "@/app/lib/definitions";

const globalStore = globalThis as AuthStoreGlobal;

const storedUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  role: true,
  salt: true,
  passwordHash: true,
});

type StoredUserRow = Prisma.UserGetPayload<{ select: typeof storedUserSelect }>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function toUserRole(role: string): UserRole {
  return role === "admin" ? "admin" : "user";
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function fromStoredUserRow(user: StoredUserRow): StoredUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toUserRole(user.role),
    salt: user.salt,
    passwordHash: user.passwordHash,
  };
}

async function getStoredUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: storedUserSelect,
  });

  return user ? fromStoredUserRow(user) : null;
}

export async function getUserByEmail(email: string) {
  const user = await getStoredUserByEmail(email);
  return user ? toPublicUser(user) : null;
}

export async function verifyUser(email: string, password: string) {
  const user = await getStoredUserByEmail(email);
  if (!user) {
    return null;
  }

  const passwordHash = hashPassword(password, user.salt);
  const storedHash = Buffer.from(user.passwordHash, "hex");
  const candidateHash = Buffer.from(passwordHash, "hex");

  if (storedHash.length !== candidateHash.length || !crypto.timingSafeEqual(storedHash, candidateHash)) {
    return null;
  }

  return toPublicUser(user);
}

export async function createUser(input: { name: string; email: string; password: string; role?: UserRole }) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const role = input.role ?? "user";

  if (!name || !email || !input.password) {
    throw new Error("Please complete all signup fields.");
  }

  const existing = await getStoredUserByEmail(email);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    salt,
    passwordHash: hashPassword(input.password, salt),
  };

  await prisma.user.create({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      salt: user.salt,
      passwordHash: user.passwordHash,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          provider: "credentials",
          providerAccountId: user.email,
        },
      },
    },
  });

  return toPublicUser(user);
}

export async function seedDemoUser() {
  if (!globalStore.__clooverDemoSeeded) {
    globalStore.__clooverDemoSeeded = (async () => {
      const existingUser = await getStoredUserByEmail("demo@cloover.dev");
      if (existingUser) {
        return;
      }

      await createUser({
        name: "Demo User",
        email: "demo@cloover.dev",
        password: "password123",
      });

      const existingAdmin = await getStoredUserByEmail("admin@cloover.dev");
      if (existingAdmin) {
        return;
      }

      await createUser({
        name: "Demo Admin",
        email: "admin@cloover.dev",
        password: "password123",
        role: "admin",
      });
    })();
  }

  return globalStore.__clooverDemoSeeded;
}
