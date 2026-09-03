import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getConversation } from "@/services/conversation-service";
import { ChatRunner } from "@/components/features/conversation/chat-runner";

export const metadata: Metadata = { title: "AI Tutor" };

export default async function TutorChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversation = await getConversation(session.user.id, id);
  if (!conversation) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <ChatRunner
        conversationId={conversation.id}
        initialMessages={conversation.messages.map((m) => ({
          id: m.id,
          role: m.role as "USER" | "ASSISTANT",
          content: m.content,
          corrections: m.corrections as { original: string; corrected: string; explanation: string }[] | null,
        }))}
        region={conversation.region}
        endHref="/tutor"
        partnerName="AI Tutor"
      />
    </div>
  );
}
