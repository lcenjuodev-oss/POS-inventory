import { NextRequest, NextResponse } from "next/server";
import { cloudPrisma } from "@/lib/cloud-db/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const deviceId: string = body.deviceId;
  const lastSyncAt: string | null = body.lastSyncAt;
  const operations: any[] = body.operations ?? [];

  const lastSyncDate = lastSyncAt ? new Date(lastSyncAt) : new Date(0);

  // Apply incoming operations using last-write-wins (updatedAt on payload)
  await cloudPrisma.$transaction(async (tx) => {
    for (const op of operations) {
      const { entity, entityId, operation, payload } = op;
      const updatedAt = payload.updatedAt ? new Date(payload.updatedAt) : new Date();

      switch (entity) {
        case "product": {
          const existing = await tx.product.findUnique({ where: { id: entityId } });
          if (!existing || existing.updatedAt < updatedAt) {
            if (operation === "delete") {
              await tx.product.update({
                where: { id: entityId },
                data: { deleted: true, updatedAt }
              });
            } else {
              await tx.product.upsert({
                where: { id: entityId },
                update: payload,
                create: payload
              });
            }
          }
          break;
        }
        case "client": {
          const existing = await tx.client.findUnique({ where: { id: entityId } });
          if (!existing || existing.updatedAt < updatedAt) {
            if (operation === "delete") {
              await tx.client.update({
                where: { id: entityId },
                data: { deleted: true, updatedAt }
              });
            } else {
              await tx.client.upsert({
                where: { id: entityId },
                update: payload,
                create: payload
              });
            }
          }
          break;
        }
        case "order": {
          const existing = await tx.order.findUnique({ where: { id: entityId } });
          if (!existing || existing.updatedAt < updatedAt) {
            if (operation === "delete") {
              await tx.order.update({
                where: { id: entityId },
                data: { deleted: true, updatedAt }
              });
            } else {
              await tx.order.upsert({
                where: { id: entityId },
                update: payload,
                create: payload
              });
            }
          }
          break;
        }
        default:
          break;
      }

      // Log operation for audit / diagnostics
      await tx.syncLog.create({
        data: {
          deviceId,
          entity,
          entityId,
          operation,
          payload
        }
      });
    }
  });

  // Return all changes since lastSyncAt
  const [updatedProducts, updatedClients, updatedOrders] = await Promise.all([
    cloudPrisma.product.findMany({
      where: { updatedAt: { gt: lastSyncDate } }
    }),
    cloudPrisma.client.findMany({
      where: { updatedAt: { gt: lastSyncDate } }
    }),
    cloudPrisma.order.findMany({
      where: { updatedAt: { gt: lastSyncDate } }
    })
  ]);

  const serverTime = new Date().toISOString();

  return NextResponse.json({
    updatedProducts,
    updatedClients,
    updatedOrders,
    serverTime
  });
}


