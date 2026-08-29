import { apiRequest } from "./client";
import type { VaultPutRequest, VaultResponse } from "../types/api";

export async function getVault(
  accessToken: string,
  ifNoneMatch?: string
): Promise<{ vault?: VaultResponse | null; etag?: string; notModified: boolean; notFound?: boolean }> {
  try {
    const result = await apiRequest<{ vault: VaultResponse }>(
      "/api/v1/vault",
      { accessToken, ifNoneMatch }
    );
    if (result.status === 304) {
      return { notModified: true, etag: result.etag };
    }
    return {
      vault: result.data.vault,
      etag: result.etag,
      notModified: false,
    };
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code: string }).code === "VAULT_NOT_FOUND"
    ) {
      return { notModified: false, vault: null, notFound: true };
    }
    throw err;
  }
}

export async function putVault(
  accessToken: string,
  payload: VaultPutRequest
): Promise<{ vault: VaultResponse }> {
  const { data } = await apiRequest<{ vault: VaultResponse }>(
    "/api/v1/vault",
    { method: "PUT", body: payload, accessToken }
  );
  return data;
}

export async function deleteVault(
  accessToken: string,
  payload: import("../types/api").VaultDeleteRequest
): Promise<void> {
  await apiRequest<void>("/api/v1/vault", {
    method: "DELETE",
    body: payload,
    accessToken,
  });
}
