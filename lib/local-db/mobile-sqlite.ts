import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteDBConnection } from "@capacitor-community/sqlite";

let db: SQLiteDBConnection | null = null;

export async function getMobileDb() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Mobile SQLite is only available on native platforms");
  }

  if (!db) {
    const ret = await CapacitorSQLite.createConnection({
      database: "pos_local",
      version: 1,
      encrypted: false,
      mode: "no-encryption"
    });
    db = ret;
    await db.open();
  }

  return db;
}


