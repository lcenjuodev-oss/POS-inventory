const { localPrisma } = require("../local-db/client");
const {
  getLastSyncCursor,
  getPendingOperations,
  markAsSent,
  updateLastSyncCursor
} = require("./localQueue");

async function runSyncOnce(apiBaseUrl, deviceId) {
  const pending = await getPendingOperations();
  const lastSync = await getLastSyncCursor();

  const res = await fetch(`${apiBaseUrl}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      lastSyncAt: lastSync ? lastSync.toISOString() : null,
      operations: pending
    })
  });

  if (!res.ok) {
    throw new Error(`Sync failed with status ${res.status}`);
  }

  const data = await res.json();

  await localPrisma.$transaction(async (tx) => {
    for (const product of data.updatedProducts || []) {
      await tx.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }

    for (const client of data.updatedClients || []) {
      await tx.client.upsert({
        where: { id: client.id },
        update: client,
        create: client
      });
    }

    for (const order of data.updatedOrders || []) {
      await tx.order.upsert({
        where: { id: order.id },
        update: {
          status: order.status,
          totalAmount: order.totalAmount,
          clientId: order.clientId,
          updatedAt: order.updatedAt,
          deleted: order.deleted
        },
        create: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          clientId: order.clientId,
          externalCode: order.externalCode,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          deleted: order.deleted
        }
      });
    }
  });

  await markAsSent(pending.map((p) => p.id));
  await updateLastSyncCursor(new Date(data.serverTime));
}

module.exports = {
  runSyncOnce
};


