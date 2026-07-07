-- CreateTable
CREATE TABLE "cloover_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cloover_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cloover_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cloover_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "cloover_users_email_key" ON "cloover_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cloover_accounts_provider_providerAccountId_key" ON "cloover_accounts"("provider", "providerAccountId");
