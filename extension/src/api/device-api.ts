import { apiRequest } from "./client";
import type {
  DeviceRegisterRequest,
  DeviceResponse,
} from "../types/api";

export async function registerDevice(
  accessToken: string,
  payload: DeviceRegisterRequest
): Promise<{ device: DeviceResponse }> {
  const { data } = await apiRequest<{ device: DeviceResponse }>(
    "/api/v1/devices",
    { method: "POST", body: payload, accessToken }
  );
  return data;
}

export async function listDevices(
  accessToken: string
): Promise<{ devices: DeviceResponse[] }> {
  const { data } = await apiRequest<{ devices: DeviceResponse[] }>(
    "/api/v1/devices",
    { accessToken }
  );
  return data;
}

export async function heartbeatDevice(
  accessToken: string,
  deviceId: string
): Promise<{ device: DeviceResponse }> {
  const { data } = await apiRequest<{ device: DeviceResponse }>(
    `/api/v1/devices/${deviceId}/heartbeat`,
    { method: "POST", accessToken }
  );
  return data;
}
