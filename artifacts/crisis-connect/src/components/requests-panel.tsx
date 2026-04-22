import {
  useListRequests,
  useResolveRequest,
  getListRequestsQueryKey,
  RequestType,
  ServiceRequestStatus,
  ServiceRequest,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, ConciergeBell, MapPin, Clock, Inbox, Check } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const TYPE_CONFIG = {
  [RequestType.staff]: {
    icon: Bell,
    label: "Staff call",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  [RequestType.service]: {
    icon: ConciergeBell,
    label: "Service",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
};

export function RequestsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useListRequests({
    query: {
      refetchInterval: 3000,
      queryKey: getListRequestsQueryKey(),
    },
  });
  const resolve = useResolveRequest();

  const pending = (data ?? []).filter(
    (r) => r.status === ServiceRequestStatus.pending,
  );
  const resolved = (data ?? [])
    .filter((r) => r.status === ServiceRequestStatus.resolved)
    .slice(0, 5);

  const handleResolve = (r: ServiceRequest) => {
    resolve.mutate(
      { id: r.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
          toast.success("Request resolved");
        },
        onError: () => toast.error("Failed to resolve request"),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Service Requests
        </CardTitle>
        <Badge variant="secondary">{pending.length} open</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </>
        ) : pending.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
            No open service requests.
          </div>
        ) : (
          pending.map((r) => <RequestRow key={r.id} req={r} onResolve={handleResolve} pending={resolve.isPending} />)
        )}

        {resolved.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              Recently resolved
            </p>
            <div className="space-y-2">
              {resolved.map((r) => (
                <RequestRow key={r.id} req={r} muted />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RequestRow({
  req,
  onResolve,
  pending,
  muted,
}: {
  req: ServiceRequest;
  onResolve?: (r: ServiceRequest) => void;
  pending?: boolean;
  muted?: boolean;
}) {
  const cfg = TYPE_CONFIG[req.type];
  const Icon = cfg.icon;
  return (
    <div
      className={`rounded-lg border p-3 flex items-start gap-3 ${
        muted ? "opacity-60" : "bg-card"
      }`}
    >
      <div className={`p-2 rounded-md shrink-0 ${cfg.bg}`}>
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{cfg.label}</span>
          <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
            <MapPin className="h-3 w-3" />
            {req.location}
          </span>
          <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span title={format(new Date(req.timestamp), "PPpp")}>
              {formatDistanceToNow(new Date(req.timestamp), { addSuffix: true })}
            </span>
          </span>
        </div>
        {req.message && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.message}</p>
        )}
      </div>
      {!muted && onResolve && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolve(req)}
          disabled={pending}
          className="shrink-0"
        >
          <Check className="h-4 w-4 mr-1" />
          Resolve
        </Button>
      )}
    </div>
  );
}
