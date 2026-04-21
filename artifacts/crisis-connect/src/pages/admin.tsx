import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/hooks/use-role";
import { useListAlerts, useGetAlertStats, AlertStatus, getListAlertsQueryKey, getGetAlertStatsQueryKey } from "@workspace/api-client-react";
import { AlertCard } from "@/components/alert-card";
import { StatsStrip } from "@/components/stats-strip";
import { playAlertBeep } from "@/lib/audio";
import { toast } from "sonner";
import { ShieldCheck, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function Admin() {
  const { role } = useRole();
  const [, setLocation] = useLocation();
  const seenAlertIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!role) setLocation("/");
    if (role !== "admin") setLocation("/");
  }, [role, setLocation]);

  // Fetch all alerts for admin
  const { data: alerts, isLoading } = useListAlerts(undefined, {
    query: {
      refetchInterval: 3000,
      queryKey: getListAlertsQueryKey(),
    }
  });

  const { data: stats } = useGetAlertStats({
    query: {
      refetchInterval: 3000,
      queryKey: getGetAlertStatsQueryKey(),
    }
  });

  // Sound detection
  useEffect(() => {
    if (!alerts) return;
    
    let hasNew = false;
    for (const alert of alerts) {
      if (!seenAlertIds.current.has(alert.id)) {
        if (alert.status === AlertStatus.pending && seenAlertIds.current.size > 0) {
          hasNew = true;
          toast.error(`New ${alert.type} emergency at ${alert.location}`);
        }
        seenAlertIds.current.add(alert.id);
      }
    }

    if (hasNew) playAlertBeep();
  }, [alerts]);

  const activeAlerts = alerts?.filter(a => a.status !== AlertStatus.resolved) || [];
  const resolvedAlerts = alerts?.filter(a => a.status === AlertStatus.resolved) || [];

  const pieData = stats ? [
    { name: 'Fire', value: stats.byType.fire, color: 'hsl(0, 84.2%, 60.2%)' },
    { name: 'Medical', value: stats.byType.medical, color: 'hsl(221.2, 83.2%, 53.3%)' },
    { name: 'Security', value: stats.byType.security, color: 'hsl(262.1, 83.3%, 57.8%)' },
    { name: 'Other', value: stats.byType.other, color: 'hsl(37.7, 92.1%, 50.2%)' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Console</h1>
        <p className="text-muted-foreground">Comprehensive overview of facility emergencies.</p>
      </div>

      <StatsStrip stats={stats} />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="active">Active Incidents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : activeAlerts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <ShieldCheck className="h-16 w-16 text-green-500 mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">All clear</h3>
              <p className="text-muted-foreground">No active emergencies.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1,2].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
             </div>
          ) : resolvedAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <History className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No history</h3>
              <p className="text-muted-foreground">No resolved incidents on record.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-90">
              {resolvedAlerts.map(alert => <AlertCard key={alert.id} alert={alert} showActions={false} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Incidents by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  Not enough data for analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
