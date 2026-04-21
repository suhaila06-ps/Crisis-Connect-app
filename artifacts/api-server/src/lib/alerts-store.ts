import { randomUUID } from "node:crypto";
import { logger } from "./logger";

export type EmergencyType = "fire" | "medical" | "security" | "other";
export type AlertStatus = "pending" | "in_progress" | "resolved";
export type ReportedBy = "guest" | "staff" | "admin";

export interface Alert {
  id: string;
  name: string;
  location: string;
  type: EmergencyType;
  description: string;
  status: AlertStatus;
  timestamp: string;
  reportedBy: ReportedBy;
}

const alerts: Alert[] = [];

export function listAlerts(filter?: {
  type?: EmergencyType;
  status?: AlertStatus;
}): Alert[] {
  let out = alerts.slice();
  if (filter?.type) out = out.filter((a) => a.type === filter.type);
  if (filter?.status) out = out.filter((a) => a.status === filter.status);
  return out.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function createAlert(input: {
  name: string;
  location: string;
  type: EmergencyType;
  description: string;
  reportedBy: ReportedBy;
}): Alert {
  const alert: Alert = {
    id: randomUUID(),
    name: input.name,
    location: input.location,
    type: input.type,
    description: input.description,
    status: "pending",
    timestamp: new Date().toISOString(),
    reportedBy: input.reportedBy,
  };
  alerts.push(alert);
  logger.info(
    { alertId: alert.id, type: alert.type, location: alert.location },
    `Emergency services notified for ${alert.type} at ${alert.location}`,
  );
  return alert;
}

export function updateAlertStatus(
  id: string,
  status: AlertStatus,
): Alert | null {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return null;
  alert.status = status;
  return alert;
}

export function getStats() {
  const byType = { fire: 0, medical: 0, security: 0, other: 0 };
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;
  for (const a of alerts) {
    byType[a.type]++;
    if (a.status === "pending") pending++;
    else if (a.status === "in_progress") inProgress++;
    else if (a.status === "resolved") resolved++;
  }
  return {
    total: alerts.length,
    active: pending + inProgress,
    pending,
    inProgress,
    resolved,
    byType,
  };
}

// Seed a few example alerts so the dashboard isn't empty on first load.
if (alerts.length === 0) {
  const now = Date.now();
  const seed = (mins: number, a: Omit<Alert, "id" | "timestamp">) => {
    alerts.push({
      ...a,
      id: randomUUID(),
      timestamp: new Date(now - mins * 60_000).toISOString(),
    });
  };
  seed(2, {
    name: "Eleanor Whitfield",
    location: "Room 412",
    type: "medical",
    description: "Guest reports chest pain and dizziness.",
    status: "pending",
    reportedBy: "guest",
  });
  seed(8, {
    name: "Front Desk",
    location: "Lobby — East Entrance",
    type: "security",
    description: "Suspicious unattended bag near concierge desk.",
    status: "in_progress",
    reportedBy: "staff",
  });
  seed(35, {
    name: "Housekeeping",
    location: "Floor 7 Hallway",
    type: "fire",
    description: "Smoke detector triggered, no visible flames.",
    status: "resolved",
    reportedBy: "staff",
  });
}
