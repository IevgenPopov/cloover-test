import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  }),
});
