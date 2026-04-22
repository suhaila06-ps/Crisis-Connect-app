import { randomUUID } from "node:crypto";

export type RequestType = "staff" | "service";
export type RequestStatus = "pending" | "resolved";

export interface ServiceRequest {
  id: string;
  type: RequestType;
  location: string;
  message: string;
  status: RequestStatus;
  timestamp: string;
}

const requests: ServiceRequest[] = [];

export function listRequests(): ServiceRequest[] {
  return requests
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function createRequest(input: {
  type: RequestType;
  location: string;
  message: string;
}): ServiceRequest {
  const r: ServiceRequest = {
    id: randomUUID(),
    type: input.type,
    location: input.location,
    message: input.message || "",
    status: "pending",
    timestamp: new Date().toISOString(),
  };
  requests.push(r);
  return r;
}

export function resolveRequest(id: string): ServiceRequest | null {
  const r = requests.find((x) => x.id === id);
  if (!r) return null;
  r.status = "resolved";
  return r;
}
