const { PrismaClient } = require("@prisma/local-client");

let prisma;

function getLocalPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["error", "warn"]
    });
  }
  return prisma;
}

const localPrisma = getLocalPrisma();

module.exports = {
  localPrisma
};


