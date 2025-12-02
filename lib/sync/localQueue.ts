import { localPrisma } from "@/lib/local-db/client";

export type SyncEntity = "product" | "client" | "order";

export type SyncOperationType = "create" | "update" | "delete";

export interface LocalSyncOperationInput {
  entity: SyncEntity;
  entityId: string;
  operation: SyncOperationType;
  payload: unknown;
}

export async function queueOperation(input: LocalSyncOperationInput) {
  await localPrisma.syncOperation.create({
    data: {
      entity: input.entity,
      entityId: input.entityId,
      operation: input.operation,
      payload: input.payload as any
    }
  });
}

export async function getPendingOperations() {
  return localPrisma.syncOperation.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" }
  });
}

export async function markAsSent(ids: string[]) {
  if (!ids.length) return;
  await localPrisma.syncOperation.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "sent",
      sentAt: new Date()
    }
  });
}

export async function getLastSyncCursor() {
  const cursor = await localPrisma.syncCursor.findUnique({ where: { id: 1 } });
  return cursor?.lastSync ?? null;
}

export async function updateLastSyncCursor(date: Date) {
  await localPrisma.syncCursor.upsert({
    where: { id: 1 },
    update: { lastSync: date },
    create: { id: 1, lastSync: date }
  });
}


