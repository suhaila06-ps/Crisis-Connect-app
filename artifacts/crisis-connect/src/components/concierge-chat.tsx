import { useEffect, useRef, useState } from "react";
import { usePostChat } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Bot } from "lucide-react";

interface Msg {
  id: string;
  role: "user" | "bot";
  text: string;
}

const WELCOME: Msg = {
  id: "welcome",
  role: "bot",
  text: "Hello! I'm the digital concierge. Ask me about breakfast hours, the spa, WiFi, check-out, and more. For anything urgent, please use the Call Staff or Emergency options.",
};

const SUGGESTIONS = ["Breakfast hours?", "Spa location?", "WiFi password?", "Check-out time?"];

export function ConciergeChat({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const chat = usePostChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    chat.mutate(
      { data: { message: trimmed } },
      {
        onSuccess: (resp) => {
          setMessages((m) => [...m, { id: `b-${Date.now()}`, role: "bot", text: resp.reply }]);
        },
        onError: () => {
          setMessages((m) => [
            ...m,
            { id: `b-${Date.now()}`, role: "bot", text: "Sorry, I couldn't reach the concierge desk. Please try again." },
          ]);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="border-b p-4 flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <SheetTitle className="text-base">Concierge</SheetTitle>
            <SheetDescription className="text-xs">
              Quick answers, anytime
            </SheetDescription>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && (
                <div className="shrink-0 mr-2 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {chat.isPending && (
            <div className="flex justify-start">
              <div className="shrink-0 mr-2 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-card border rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="border-t p-3 flex flex-wrap gap-2 bg-background">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-8"
                onClick={() => send(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t p-3 flex gap-2 bg-background"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            autoFocus
          />
          <Button type="submit" size="icon" disabled={!input.trim() || chat.isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
