import { PrismaClient } from "@prisma/client";
const connectionString = process.env.DATABASE_URL || "postgresql://healthai:healthai_pass@localhost:5432/healthaidb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: connectionString,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
