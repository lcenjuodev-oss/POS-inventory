import { localPrisma } from "@/lib/local-db/client";
import { queueOperation } from "@/lib/sync/localQueue";

// Example: create an order locally and enqueue it for sync with the cloud.
export async function createLocalOrderExample() {
  const client = await localPrisma.client.create({
    data: {
      name: "Walk-in Client",
      phone: "+212 600-000000"
    }
  });

  const order = await localPrisma.order.create({
    data: {
      status: "pending",
      totalAmount: 150,
      clientId: client.id
    }
  });

  await queueOperation({
    entity: "order",
    entityId: order.id,
    operation: "create",
    payload: order
  });

  return order;
}


