const { PrismaClient } = require("@prisma/cloud-client");

let prisma;

function getCloudPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["error", "warn"]
    });
  }
  return prisma;
}

const cloudPrisma = getCloudPrisma();

module.exports = {
  cloudPrisma
};


