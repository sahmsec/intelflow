import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let client: PrismaClient;

if (globalForPrisma.prisma) {
  client = globalForPrisma.prisma;
} else {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
}

export const db = client;
export type { User, Workspace, Competitor, Insight, Alert } from "@prisma/client";
