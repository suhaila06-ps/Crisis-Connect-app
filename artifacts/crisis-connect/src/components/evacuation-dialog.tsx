import { useGetEvacuation, getGetEvacuationQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Compass } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EvacuationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useGetEvacuation({
    query: { enabled: open, queryKey: getGetEvacuationQueryKey() },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">Safe-exit guidance</DialogTitle>
              <DialogDescription>
                Follow these steps calmly. Do not panic.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <ol className="space-y-3 py-2">
            {data.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white text-sm font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm leading-6 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
