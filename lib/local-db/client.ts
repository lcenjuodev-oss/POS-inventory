import { PrismaClient } from "@prisma/local-client";

let prisma: PrismaClient | undefined;

function getLocalPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["error", "warn"]
    });
  }
  return prisma;
}

export const localPrisma = getLocalPrisma();

