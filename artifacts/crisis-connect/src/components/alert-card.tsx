import { Alert, AlertStatus, EmergencyType, useUpdateAlertStatus, getListAlertsQueryKey, getGetAlertStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, HeartPulse, Shield, AlertTriangle, Clock, MapPin, User, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRole } from "@/hooks/use-role";

const typeConfig = {
  [EmergencyType.fire]: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
  [EmergencyType.medical]: { icon: HeartPulse, color: "text-blue-500", bg: "bg-blue-500/10" },
  [EmergencyType.security]: { icon: Shield, color: "text-violet-500", bg: "bg-violet-500/10" },
  [EmergencyType.other]: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
};

const statusConfig = {
  [AlertStatus.pending]: { label: "Pending", variant: "destructive" as const },
  [AlertStatus.in_progress]: { label: "Responding", variant: "default" as const },
  [AlertStatus.resolved]: { label: "Resolved", variant: "secondary" as const },
};

export function AlertCard({ alert, showActions = true }: { alert: Alert, showActions?: boolean }) {
  const queryClient = useQueryClient();
  const { role } = useRole();
  const updateStatus = useUpdateAlertStatus();

  const handleStatusChange = (status: AlertStatus) => {
    updateStatus.mutate(
      { id: alert.id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAlertStatsQueryKey() });
          toast.success(`Alert marked as ${statusConfig[status].label.toLowerCase()}`);
        },
        onError: () => {
          toast.error("Failed to update status");
        }
      }
    );
  };

  const TypeIcon = typeConfig[alert.type].icon;
  const isResolved = alert.status === AlertStatus.resolved;

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isResolved ? 'opacity-70 grayscale-[0.5]' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${typeConfig[alert.type].bg} ${isResolved ? 'bg-muted' : ''}`}>
            <TypeIcon className={`h-6 w-6 ${isResolved ? 'text-muted-foreground' : typeConfig[alert.type].color}`} />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Emergency
            </CardTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{alert.location}</span>
            </div>
          </div>
        </div>
        <Badge variant={statusConfig[alert.status].variant} className="shrink-0">
          {statusConfig[alert.status].label}
        </Badge>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm font-medium mb-1">{alert.name}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{alert.description}</p>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span title={format(new Date(alert.timestamp), "PPpp")}>
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            <span className="capitalize">{alert.reportedBy}</span>
          </div>
        </div>
      </CardContent>
      {showActions && !isResolved && (role === 'staff' || role === 'admin') && (
        <CardFooter className="pt-0 flex gap-2">
          {alert.status === AlertStatus.pending && (
            <Button 
              className="w-full" 
              onClick={() => handleStatusChange(AlertStatus.in_progress)}
              disabled={updateStatus.isPending}
            >
              Mark as Responding
            </Button>
          )}
          {alert.status === AlertStatus.in_progress && (
            <Button 
              variant="outline"
              className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30" 
              onClick={() => handleStatusChange(AlertStatus.resolved)}
              disabled={updateStatus.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve Incident
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
