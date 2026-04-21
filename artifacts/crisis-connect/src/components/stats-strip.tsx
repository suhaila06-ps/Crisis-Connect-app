import { AlertStats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, HeartPulse, Shield, AlertTriangle, Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function StatsStrip({ stats }: { stats: AlertStats | undefined }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
            <h3 className="text-2xl font-bold tracking-tight">{stats.active}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold tracking-tight text-destructive">{stats.pending}</h3>
          </div>
          <div className="p-3 bg-destructive/10 rounded-full text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-500/5 border-orange-500/20 dark:bg-orange-500/10 dark:border-orange-500/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Responding</p>
            <h3 className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">{stats.inProgress}</h3>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-full text-orange-600 dark:text-orange-400">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4 flex flex-col justify-center h-full">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Active by Type</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5" title="Fire">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="font-semibold">{stats.byType.fire}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Medical">
              <HeartPulse className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">{stats.byType.medical}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Security">
              <Shield className="h-4 w-4 text-violet-500" />
              <span className="font-semibold">{stats.byType.security}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Other">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">{stats.byType.other}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
