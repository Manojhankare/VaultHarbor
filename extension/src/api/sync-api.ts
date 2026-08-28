import { apiRequest } from "./client";
import type { SyncResponse } from "../types/api";

export { getVault, putVault } from "./vault-api";

export async function getSyncState(
  accessToken: string,
  sinceRevision?: number,
  limit = 50
): Promise<SyncResponse> {
  const params = new URLSearchParams();
  if (sinceRevision !== undefined) {
    params.set("since_revision", String(sinceRevision));
  }
  params.set("limit", String(limit));
  const { data } = await apiRequest<SyncResponse>(
    `/api/v1/sync?${params.toString()}`,
    { accessToken }
  );
  return data;
}
