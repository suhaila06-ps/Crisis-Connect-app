import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/hooks/use-role";
import { useListAlerts, useGetAlertStats, AlertStatus, EmergencyType, getListAlertsQueryKey, getGetAlertStatsQueryKey } from "@workspace/api-client-react";
import { AlertCard } from "@/components/alert-card";
import { StatsStrip } from "@/components/stats-strip";
import { playAlertBeep } from "@/lib/audio";
import { toast } from "sonner";
import { ShieldCheck, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { role } = useRole();
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<EmergencyType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<AlertStatus | "active">("active");
  const seenAlertIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!role) setLocation("/");
    if (role === "guest") setLocation("/report");
  }, [role, setLocation]);

  const listParams = {
    ...(filterType !== "all" && { type: filterType }),
    // Use active pseudo-status for dashboard by fetching all and filtering out resolved locally, 
    // or fetch pending and in_progress. API supports single status.
    ...(filterStatus !== "active" && { status: filterStatus as AlertStatus }),
  };

  const { data: alerts, isLoading } = useListAlerts(listParams, {
    query: {
      refetchInterval: 3000,
      queryKey: getListAlertsQueryKey(listParams),
    }
  });

  const { data: stats } = useGetAlertStats({
    query: {
      refetchInterval: 3000,
      queryKey: getGetAlertStatsQueryKey(),
    }
  });

  // New alert detection for sounds
  useEffect(() => {
    if (!alerts) return;
    
    let hasNew = false;
    let newAlerts = [];
    
    for (const alert of alerts) {
      if (!seenAlertIds.current.has(alert.id)) {
        // Only trigger for pending alerts (new emergencies)
        if (alert.status === AlertStatus.pending && seenAlertIds.current.size > 0) {
          hasNew = true;
          newAlerts.push(alert);
        }
        seenAlertIds.current.add(alert.id);
      }
    }

    if (hasNew) {
      playAlertBeep();
      newAlerts.forEach(a => {
        toast.error(`Emergency services notified for ${a.type} at ${a.location}`, {
          duration: 10000,
          icon: <ShieldCheck className="h-5 w-5" />
        });
      });
    }
  }, [alerts]);

  // Filter alerts locally for "active" pseudo-status
  const displayedAlerts = alerts?.filter(a => {
    if (filterStatus === "active") return a.status !== AlertStatus.resolved;
    return true; // Already filtered by API
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Live Dashboard</h1>
        <p className="text-muted-foreground">Monitor and coordinate active emergency responses.</p>
      </div>

      <StatsStrip stats={stats} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="active" value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value={AlertStatus.pending}>Pending</TabsTrigger>
            <TabsTrigger value={AlertStatus.in_progress}>Responding</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={EmergencyType.fire}>Fire</SelectItem>
              <SelectItem value={EmergencyType.medical}>Medical</SelectItem>
              <SelectItem value={EmergencyType.security}>Security</SelectItem>
              <SelectItem value={EmergencyType.other}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : displayedAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <ShieldCheck className="h-16 w-16 text-green-500 mb-4 opacity-80" />
          <h3 className="text-xl font-semibold mb-2">All clear</h3>
          <p className="text-muted-foreground max-w-md">
            No active emergencies matching your filters. The facility is secure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
