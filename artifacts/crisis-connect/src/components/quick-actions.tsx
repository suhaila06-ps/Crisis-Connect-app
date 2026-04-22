import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useCreateRequest,
  getListRequestsQueryKey,
} from "@workspace/api-client-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HeadphonesIcon,
  Bell,
  Siren,
  ConciergeBell,
  MessageSquare,
  Plus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ConciergeChat } from "@/components/concierge-chat";

type RequestKind = "staff" | "service";

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState<null | RequestKind>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Subtle pulse on first mount so users notice the FAB.
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Quick actions"
        onClick={() => setOpen(true)}
        className={`fixed z-40 bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
          pulse ? "ring-4 ring-primary/30 animate-pulse" : ""
        }`}
      >
        <HeadphonesIcon className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-t max-h-[85vh] sm:max-w-lg sm:mx-auto">
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl">How can we help?</SheetTitle>
                <SheetDescription>One tap to reach our team.</SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="grid gap-3 py-4">
            <ActionRow
              icon={<Siren className="h-6 w-6" />}
              title="Emergency"
              description="Fire, medical, or security — alert all staff now."
              tone="danger"
              onClick={() => {
                setOpen(false);
                setLocation("/report");
              }}
            />
            <ActionRow
              icon={<Bell className="h-6 w-6" />}
              title="Call Staff"
              description="A team member will come to your location."
              tone="primary"
              onClick={() => {
                setOpen(false);
                setRequestOpen("staff");
              }}
            />
            <ActionRow
              icon={<ConciergeBell className="h-6 w-6" />}
              title="Request Service"
              description="Housekeeping, room service, fresh towels…"
              tone="muted"
              onClick={() => {
                setOpen(false);
                setRequestOpen("service");
              }}
            />
            <ActionRow
              icon={<MessageSquare className="h-6 w-6" />}
              title="Concierge Chat"
              description="Instant answers about the property."
              tone="muted"
              onClick={() => {
                setOpen(false);
                setChatOpen(true);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <RequestDialog
        kind={requestOpen}
        onClose={() => setRequestOpen(null)}
      />

      <ConciergeChat open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}

function ActionRow({
  icon,
  title,
  description,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "danger" | "primary" | "muted";
  onClick: () => void;
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 border-red-700"
      : tone === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90 border-primary"
      : "bg-card hover:bg-muted/40 border-border text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-colors active:scale-[0.99] ${toneClass}`}
    >
      <div className={`p-2 rounded-lg ${tone === "muted" ? "bg-muted" : "bg-white/15"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold leading-tight">{title}</p>
        <p className={`text-sm leading-snug ${tone === "muted" ? "text-muted-foreground" : "text-white/85"}`}>
          {description}
        </p>
      </div>
      <Plus className={`h-5 w-5 shrink-0 ${tone === "muted" ? "text-muted-foreground" : "text-white/80"}`} />
    </button>
  );
}

function RequestDialog({
  kind,
  onClose,
}: {
  kind: RequestKind | null;
  onClose: () => void;
}) {
  const [location, setLocationField] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const queryClient = useQueryClient();
  const create = useCreateRequest();

  useEffect(() => {
    if (kind) {
      setLocationField("");
      setMessage("");
      setConfirmed(false);
    }
  }, [kind]);

  if (!kind) return null;

  const isStaff = kind === "staff";
  const title = isStaff ? "Call Staff" : "Request Service";
  const placeholderMsg = isStaff
    ? "Briefly tell us what you need (optional)"
    : "What service do you need? (e.g. fresh towels, extra pillows)";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    create.mutate(
      { data: { type: kind, location: location.trim(), message: message.trim() || (isStaff ? "Staff requested" : "Service requested") } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
          setConfirmed(true);
          toast.success(isStaff ? "Staff are on the way" : "Service request received");
          window.setTimeout(() => onClose(), 1600);
        },
        onError: () => {
          toast.error("Couldn't send your request. Please try again.");
        },
      },
    );
  };

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isStaff
              ? "Tell us where you are. A staff member will be with you shortly."
              : "Tell us what you need and where to bring it."}
          </DialogDescription>
        </DialogHeader>

        {confirmed ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="font-medium">Request sent</p>
            <p className="text-sm text-muted-foreground">
              {isStaff ? "A team member is on the way." : "Your service request has been queued."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="loc">Your location</Label>
              <Input
                id="loc"
                value={location}
                onChange={(e) => setLocationField(e.target.value)}
                placeholder="Room 412, Lobby, Pool deck…"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg">Message</Label>
              <Textarea
                id="msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholderMsg}
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={create.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!location.trim() || create.isPending}>
                {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send request
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
