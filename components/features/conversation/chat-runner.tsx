"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Send, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { sendMessageAction, endConversationAction } from "@/actions/conversation-actions";
import { speakSpanish, regionToSpeechLang } from "@/lib/speech";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  corrections?: { original: string; corrected: string; explanation: string }[] | null;
}

export function ChatRunner({
  conversationId,
  initialMessages,
  region,
  endHref,
  partnerName,
}: {
  conversationId: string;
  initialMessages: ChatMessage[];
  region: string;
  endHref: string;
  partnerName: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, startSend] = useTransition();
  const [ended, setEnded] = useState<{ corrections: { original: string; corrected: string; explanation: string }[] } | null>(null);
  const [ending, startEnd] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "USER", content: text }]);
    scrollToBottom();
    startSend(async () => {
      const result = await sendMessageAction(conversationId, text);
      setMessages((m) => [
        ...m,
        { id: `local-${Date.now()}-r`, role: "ASSISTANT", content: result.reply, corrections: result.corrections ?? null },
      ]);
      scrollToBottom();
    });
  }

  function handleEnd() {
    startEnd(async () => {
      const result = await endConversationAction(conversationId);
      setEnded(result);
    });
  }

  if (ended) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <h2 className="font-serif-display text-xl font-semibold">Conversation ended</h2>
          {ended.corrections.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">A few things to review:</p>
              {ended.corrections.map((c, i) => (
                <div key={i} className="rounded-md border border-border p-3 text-sm">
                  <p className="text-destructive">❌ {c.original}</p>
                  <p className="text-success">✅ {c.corrected}</p>
                  <p className="mt-1 text-muted-foreground">{c.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No corrections flagged — nice work.</p>
          )}
          <Button asChild>
            <Link href={endHref}>Done</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-medium">{partnerName}</p>
        <Button variant="ghost" size="sm" onClick={handleEnd} disabled={ending}>
          <X className="h-4 w-4" /> End
        </Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "USER" ? "justify-end" : "justify-start")}>
            <div className="max-w-[80%] space-y-1">
              <div
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm",
                  m.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.content}
              </div>
              {m.role === "ASSISTANT" && (
                <button
                  type="button"
                  onClick={() => speakSpanish(m.content, { lang: regionToSpeechLang(region) })}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  aria-label="Listen"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              )}
              {m.corrections && m.corrections.length > 0 && (
                <div className="space-y-1 rounded-md bg-warning/10 p-2 text-xs text-warning">
                  {m.corrections.map((c, i) => (
                    <p key={i}>
                      <span className="line-through">{c.original}</span> → <span className="font-medium">{c.corrected}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted px-3.5 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Escribe en español…"
          disabled={sending}
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
