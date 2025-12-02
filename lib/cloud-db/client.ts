import { PrismaClient } from "@prisma/cloud-client";

let prisma: PrismaClient | undefined;

function getCloudPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["error", "warn"]
    });
  }
  return prisma;
}

export const cloudPrisma = getCloudPrisma();

