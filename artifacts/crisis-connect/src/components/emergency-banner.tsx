import { useState } from "react";
import { useListAlerts, AlertStatus, getListAlertsQueryKey, Alert as AlertT } from "@workspace/api-client-react";
import { AlertTriangle, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvacuationDialog } from "@/components/evacuation-dialog";

const TYPE_LABEL: Record<string, string> = {
  fire: "Fire",
  medical: "Medical Emergency",
  security: "Security Incident",
  other: "Emergency",
};

function pickActive(alerts: AlertT[] | undefined): AlertT | null {
  if (!alerts) return null;
  const active = alerts.filter((a) => a.status !== AlertStatus.resolved);
  if (active.length === 0) return null;
  // Prefer pending over in_progress, and most recent first.
  active.sort((a, b) => {
    if (a.status === b.status) return b.timestamp.localeCompare(a.timestamp);
    return a.status === AlertStatus.pending ? -1 : 1;
  });
  return active[0]!;
}

export function EmergencyBanner() {
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [evacOpen, setEvacOpen] = useState(false);

  const { data } = useListAlerts(undefined, {
    query: {
      refetchInterval: 3000,
      queryKey: getListAlertsQueryKey(),
    },
  });

  const active = pickActive(data);
  if (!active) return null;
  if (dismissedId === active.id) return null;

  const label = TYPE_LABEL[active.type] ?? "Emergency";

  return (
    <>
      <div
        role="alert"
        aria-live="assertive"
        className="sticky top-0 z-[60] w-full bg-red-600 text-white shadow-lg animate-in slide-in-from-top-2 duration-300"
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight truncate">
              {label} reported at {active.location}
            </p>
            <p className="text-xs sm:text-sm text-white/90 truncate">
              Please remain calm and follow staff instructions.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-red-700 hover:bg-white/90 hidden sm:inline-flex"
            onClick={() => setEvacOpen(true)}
          >
            Safe-exit guide
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 h-8 w-8"
            onClick={() => setDismissedId(active.id)}
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EvacuationDialog open={evacOpen} onOpenChange={setEvacOpen} />
    </>
  );
}
