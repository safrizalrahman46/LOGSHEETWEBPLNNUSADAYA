import Dexie, { type EntityTable } from "dexie";
import { OfflineDraft } from "@/types";

export class PLNLogsheetDatabase extends Dexie {
  drafts!: EntityTable<OfflineDraft, "id">;

  constructor() {
    super("PLNLogsheetDB");
    this.version(1).stores({
      drafts: "++id, local_id, kd_unit, tanggal, jam, status, created_at",
    });
  }
}

export const offlineDb = new PLNLogsheetDatabase();

export async function saveOfflineDraft(
  payload: OfflineDraft["payload"]
): Promise<number> {
  const existing = await offlineDb.drafts
    .where("local_id")
    .equals(payload.local_id)
    .first();

  if (existing && existing.id) {
    await offlineDb.drafts.update(existing.id, {
      payload,
      status: "PENDING",
      retry_count: 0,
      created_at: new Date().toISOString(),
    });
    return existing.id;
  }

  const newId = await offlineDb.drafts.add({
    local_id: payload.local_id,
    kd_unit: payload.kd_unit,
    nama_unit: payload.nama_unit,
    tanggal: payload.tanggal,
    jam: payload.jam,
    operator_name: payload.operator_name,
    payload,
    status: "PENDING",
    retry_count: 0,
    created_at: new Date().toISOString(),
  });
  return Number(newId);
}

export async function getPendingDrafts(): Promise<OfflineDraft[]> {
  return await offlineDb.drafts
    .where("status")
    .equals("PENDING")
    .or("status")
    .equals("FAILED")
    .toArray();
}

export async function deleteOfflineDraft(id: number): Promise<void> {
  await offlineDb.drafts.delete(id);
}
