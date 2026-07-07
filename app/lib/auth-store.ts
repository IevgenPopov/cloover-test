import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { AuthStoreGlobal, StoredUser, PublicUser } from "@/app/lib/definitions";

const globalStore = globalThis as AuthStoreGlobal;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function getStoredUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  return user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        salt: user.salt,
        passwordHash: user.passwordHash,
      }
    : null;
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

export async function createUser(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

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
    salt,
    passwordHash: hashPassword(input.password, salt),
  };

  await prisma.user.create({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
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
      const existing = await getStoredUserByEmail("demo@cloover.dev");
      if (existing) {
        return;
      }

      await createUser({
        name: "Demo User",
        email: "demo@cloover.dev",
        password: "password123",
      });
    })();
  }

  return globalStore.__clooverDemoSeeded;
}
