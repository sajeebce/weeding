# AI Live Chat + WhatsApp + Messenger — Step-by-Step Implementation Guide

> This file is a self-contained, step-by-step implementation guide.
> Claude (or any AI assistant) can follow this file from top to bottom to implement the full system.
>
> **Date:** February 2026
> **Codebase:** LLCPad (Next.js 15 + TypeScript + Tailwind 4 + Prisma 7 + PostgreSQL + Socket.io)

---

## Table of Contents

1. [Current Codebase State](#1-current-codebase-state)
2. [What We're Building](#2-what-were-building)
3. [Phase 1: Database Schema Changes](#3-phase-1-database-schema-changes)
4. [Phase 2: AI Text Engine (Core)](#4-phase-2-ai-text-engine-core)
5. [Phase 3: AI Integration into Live Chat Widget](#5-phase-3-ai-integration-into-live-chat-widget)
6. [Phase 4: AI Integration into Admin Dashboard](#6-phase-4-ai-integration-into-admin-dashboard)
7. [Phase 5: Knowledge Base Admin UI](#7-phase-5-knowledge-base-admin-ui)
8. [Phase 6: WhatsApp Integration](#8-phase-6-whatsapp-integration)
9. [Phase 7: Messenger Integration](#9-phase-7-messenger-integration)
10. [Phase 8: Unified Inbox Updates](#10-phase-8-unified-inbox-updates)
11. [Phase 9: Settings UI for Channels + AI](#11-phase-9-settings-ui-for-channels--ai)
12. [Phase 10: Testing & Deployment](#12-phase-10-testing--deployment)
13. [Environment Variables](#13-environment-variables)
14. [File Map (All Files to Create/Modify)](#14-file-map)

---

## 1. Current Codebase State

### Existing Files We'll Build On

| File | What It Does |
|------|-------------|
| `prisma/schema.prisma` | Has SupportTicket, SupportMessage, KnowledgeDocument, AIResponse models already |
| `src/lib/support/socket/server.ts` | Socket.io server with chat:request, chat:accept, chat:message, chat:end, chat:typing events |
| `chat-server.ts` | Standalone Socket.io entry point (port 3001) |
| `src/components/plugins/livesupport-chat-widget.tsx` | Customer-facing chat widget (React, ~1300 lines). Has states: IDLE, OFFLINE_FORM, CONNECTING, ACTIVE_CHAT, AI_CHAT, AI_HANDOFF, OFFLINE_REPLY, ENDED |
| `src/app/admin/tickets/chat/live-chat-client.tsx` | Agent dashboard for live chat (~1200 lines) |
| `src/app/admin/tickets/settings/settings-client.tsx` | Support settings page |
| `src/app/admin/tickets/page.tsx` | Ticket list page |
| `src/app/api/admin/tickets/` | Ticket CRUD API routes |
| `src/lib/db.ts` | Prisma client singleton (PrismaPg adapter, Pool) |

### Existing Schema (Relevant Models)

```
SupportTicket — has ticketNumber, subject, status, priority, source (TicketSource enum), guestName/guestEmail/guestPhone, messages[], aiResponses[]
SupportMessage — has content, senderType (CUSTOMER/AGENT/SYSTEM), senderName, type (TEXT/IMAGE/DOCUMENT/AUDIO/SYSTEM)
KnowledgeDocument — has title, content, category, tags, embedding (Float[]), isActive
AIResponse — has ticketId, content, confidence, sources, wasUsed, wasEdited
TicketSource enum — LIVE_CHAT, EMAIL, MANUAL, API
```

### What Already Works

- Live chat widget connects to Socket.io server
- Visitors can request chat, agents can accept
- Real-time messaging with typing indicators
- Messages persist to SupportTicket/SupportMessage via Prisma
- Admin ticket list, detail view, analytics
- Widget has AI_CHAT and AI_HANDOFF states defined (but not implemented)
- KnowledgeDocument model exists (but no ingestion/RAG pipeline)
- Agent timeout → offline reply flow works

---

## 2. What We're Building

### Feature Set

1. **AI Auto-Reply in Live Chat** — When no agent available (or before agent accepts), AI answers using knowledge base
2. **AI-to-Human Handoff** — Seamless transfer from AI to human agent mid-conversation
3. **Knowledge Base + RAG** — pgvector-powered semantic search for AI context
4. **WhatsApp AI Auto-Reply** — Inbound WhatsApp messages get AI reply, with handoff to agent
5. **Messenger AI Auto-Reply** — Same as WhatsApp but for Facebook Messenger
6. **Unified Inbox** — All channels (live chat, WhatsApp, Messenger) in one admin dashboard
7. **Admin Settings** — Configure AI model, system prompt, channel API keys

### Architecture

```
Customer sends message (Live Chat / WhatsApp / Messenger)
    │
    v
Normalize to common format { source, channelId, content, senderName }
    │
    v
Find or create SupportTicket (by channelId + source)
    │
    v
Save as SupportMessage (senderType: CUSTOMER)
    │
    v
┌── Is ticket assigned to human agent? ──┐
│                                         │
│  YES → Route to agent (Socket.io /      │
│         channel API reply)              │
│                                         │
│  NO  → AI Pipeline:                    │
│    1. Load conversation history (10 msgs)│
│    2. RAG query (pgvector similarity)   │
│    3. Call LLM (GPT-4o-mini / Claude)   │
│    4. Check confidence → handoff if low │
│    5. Send reply via channel            │
│    6. Save as SupportMessage (SYSTEM)   │
└─────────────────────────────────────────┘
```

---

## 3. Phase 1: Database Schema Changes

### Step 1.1: Update TicketSource enum

**File:** `prisma/schema.prisma`

Find the existing `TicketSource` enum and add new values:

```prisma
enum TicketSource {
  LIVE_CHAT
  EMAIL
  MANUAL
  API
  WHATSAPP      // NEW
  MESSENGER     // NEW
  INSTAGRAM     // NEW (future)
}
```

### Step 1.2: Add channelId to SupportTicket

**File:** `prisma/schema.prisma`

Add these fields to the `SupportTicket` model (after the `source` field):

```prisma
  // Channel-specific identifier (phone for WhatsApp, PSID for Messenger)
  channelId       String?

  // AI handling metadata
  isAiHandling    Boolean   @default(false)
  aiHandoffAt     DateTime?
  aiMessageCount  Int       @default(0)
```

Add a new index:

```prisma
  @@index([channelId, source])
```

### Step 1.3: Create AIConversation model

**File:** `prisma/schema.prisma`

Add after the existing `AIResponse` model:

```prisma
model AIConversation {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  query       String        @db.Text    // Customer's message
  response    String        @db.Text    // AI's response
  confidence  Float         @default(0) // 0-1 confidence score
  sources     String[]                  // KnowledgeDocument IDs used
  channel     String                    // "livechat", "whatsapp", "messenger"

  wasHelpful  Boolean?
  escalated   Boolean       @default(false)

  createdAt   DateTime      @default(now())

  @@index([ticketId])
  @@index([channel])
  @@index([createdAt])
}
```

Add the relation to `SupportTicket`:

```prisma
  aiConversations AIConversation[]
```

### Step 1.4: Create ChannelConfig model

**File:** `prisma/schema.prisma`

```prisma
model ChannelConfig {
  id          String   @id @default(cuid())
  channel     String   @unique  // "whatsapp", "messenger", "instagram", "livechat_ai"
  isEnabled   Boolean  @default(false)

  // Channel-specific config (stored as JSON)
  config      Json     @default("{}")
  // WhatsApp: { phoneNumberId, businessAccountId, verifyToken, accessToken }
  // Messenger: { pageId, pageAccessToken, appSecret, verifyToken }
  // LiveChat AI: { model, systemPrompt, maxTokens, temperature, confidenceThreshold }

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([channel])
}
```

### Step 1.5: Enhance KnowledgeDocument for pgvector

The existing `KnowledgeDocument` model has `embedding Float[]`. This works but is slow for similarity search at scale. We'll use raw SQL with pgvector extension for the actual search, but keep the Prisma model as-is for CRUD operations.

**No schema change needed** — we'll handle vector operations via `prisma.$queryRawUnsafe()`.

### Step 1.6: Run Migration

```bash
npx prisma migrate dev --name add-ai-channels-support
```

---

## 4. Phase 2: AI Text Engine (Core)

### Step 2.1: Install Dependencies

```bash
npm install openai @anthropic-ai/sdk
```

### Step 2.2: Create AI Configuration Loader

**File:** `src/lib/ai/config.ts` (CREATE)

```typescript
import { prisma } from "@/lib/db";

export interface AIConfig {
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  confidenceThreshold: number; // Below this, trigger handoff
  maxAiTurns: number;          // Max AI messages before handoff
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support agent for LLCPad, a US LLC formation service for international entrepreneurs.

RULES:
- Answer ONLY based on the provided knowledge base context
- If the answer is NOT in the context, say: "I'd like to connect you with our team for more details. Would you like to speak with an agent?"
- Be concise, friendly, and professional
- Do NOT make up pricing, timelines, or legal advice
- Include disclaimer when discussing LLC formation: "This is general information, not legal advice."
- Keep responses under 200 words for chat, under 100 words for WhatsApp/Messenger`;

const DEFAULT_CONFIG: AIConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
  apiKey: "",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  maxTokens: 500,
  temperature: 0.3,
  confidenceThreshold: 0.7,
  maxAiTurns: 5,
};

export async function getAIConfig(): Promise<AIConfig> {
  try {
    const channelConfig = await prisma.channelConfig.findUnique({
      where: { channel: "livechat_ai" },
    });

    if (!channelConfig?.config) return {
      ...DEFAULT_CONFIG,
      apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "",
    };

    const config = channelConfig.config as Record<string, unknown>;
    return {
      provider: (config.provider as AIConfig["provider"]) || DEFAULT_CONFIG.provider,
      model: (config.model as string) || DEFAULT_CONFIG.model,
      apiKey: (config.apiKey as string) || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "",
      systemPrompt: (config.systemPrompt as string) || DEFAULT_CONFIG.systemPrompt,
      maxTokens: (config.maxTokens as number) || DEFAULT_CONFIG.maxTokens,
      temperature: (config.temperature as number) || DEFAULT_CONFIG.temperature,
      confidenceThreshold: (config.confidenceThreshold as number) || DEFAULT_CONFIG.confidenceThreshold,
      maxAiTurns: (config.maxAiTurns as number) || DEFAULT_CONFIG.maxAiTurns,
    };
  } catch {
    return {
      ...DEFAULT_CONFIG,
      apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "",
    };
  }
}
```

### Step 2.3: Create RAG Query Pipeline

**File:** `src/lib/ai/rag.ts` (CREATE)

```typescript
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Embed a text string using OpenAI text-embedding-3-small
 */
export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Search knowledge base for relevant documents
 * Uses cosine similarity on the embedding Float[] field
 */
export async function searchKnowledgeBase(
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.7
): Promise<Array<{ id: string; title: string; content: string; category: string; similarity: number }>> {
  const queryEmbedding = await embedText(query);

  // Use raw SQL for cosine similarity search
  // This works with the Float[] field in Prisma — we compute similarity in app layer
  const documents = await prisma.knowledgeDocument.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      embedding: true,
    },
  });

  // Calculate cosine similarity in JavaScript
  const results = documents
    .map((doc) => {
      if (!doc.embedding || doc.embedding.length === 0) return null;
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      return { ...doc, similarity };
    })
    .filter((doc): doc is NonNullable<typeof doc> => doc !== null && doc.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ embedding: _embedding, ...rest }) => rest);

  return results;
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Ingest a document into the knowledge base
 * Chunks long documents and creates embeddings
 */
export async function ingestDocument(
  title: string,
  content: string,
  category: string,
  tags: string[] = []
): Promise<string> {
  const embedding = await embedText(content);

  const doc = await prisma.knowledgeDocument.create({
    data: {
      title,
      content,
      category,
      tags,
      embedding,
      isActive: true,
    },
  });

  return doc.id;
}

/**
 * Update embedding for an existing document
 */
export async function updateDocumentEmbedding(docId: string): Promise<void> {
  const doc = await prisma.knowledgeDocument.findUnique({
    where: { id: docId },
    select: { content: true },
  });
  if (!doc) return;

  const embedding = await embedText(doc.content);
  await prisma.knowledgeDocument.update({
    where: { id: docId },
    data: { embedding },
  });
}
```

### Step 2.4: Create AI Response Generator

**File:** `src/lib/ai/generate-response.ts` (CREATE)

```typescript
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getAIConfig, type AIConfig } from "./config";
import { searchKnowledgeBase } from "./rag";

interface AIResponseResult {
  content: string;
  confidence: number;
  sources: string[];  // KnowledgeDocument IDs
  shouldHandoff: boolean;
  handoffReason?: string;
}

// Keywords that trigger immediate handoff
const HANDOFF_KEYWORDS = [
  "human", "agent", "real person", "talk to someone", "speak to someone",
  "representative", "manager", "support team", "live agent",
];

const SENSITIVE_TOPICS = [
  "refund", "billing dispute", "complaint", "legal question", "lawsuit",
  "cancel", "fraud", "scam",
];

/**
 * Generate AI response for a customer message
 */
export async function generateAIResponse(
  customerMessage: string,
  ticketId: string,
  channel: "livechat" | "whatsapp" | "messenger"
): Promise<AIResponseResult> {
  const config = await getAIConfig();

  if (!config.apiKey) {
    return {
      content: "I'd like to connect you with our team. One moment please.",
      confidence: 0,
      sources: [],
      shouldHandoff: true,
      handoffReason: "AI not configured (no API key)",
    };
  }

  // 1. Check for explicit handoff request
  const lowerMessage = customerMessage.toLowerCase();
  if (HANDOFF_KEYWORDS.some((kw) => lowerMessage.includes(kw))) {
    return {
      content: "Sure! Let me connect you with a team member right away.",
      confidence: 1,
      sources: [],
      shouldHandoff: true,
      handoffReason: "Customer requested human agent",
    };
  }

  // 2. Check for sensitive topics
  if (SENSITIVE_TOPICS.some((topic) => lowerMessage.includes(topic))) {
    return {
      content: "I'll connect you with our team who can help you with this. One moment please.",
      confidence: 1,
      sources: [],
      shouldHandoff: true,
      handoffReason: "Sensitive topic detected",
    };
  }

  // 3. Check AI turn count — handoff after maxAiTurns
  const aiMessageCount = await prisma.supportMessage.count({
    where: {
      ticketId,
      senderType: "SYSTEM",
      senderName: "AI Assistant",
    },
  });

  if (aiMessageCount >= config.maxAiTurns) {
    return {
      content: "I think it would be best to connect you with our team for further assistance. Let me transfer you now.",
      confidence: 0.5,
      sources: [],
      shouldHandoff: true,
      handoffReason: `AI turn limit reached (${config.maxAiTurns})`,
    };
  }

  // 4. Load conversation history
  const history = await prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { content: true, senderType: true, senderName: true },
  });

  // 5. RAG: Search knowledge base
  const relevantDocs = await searchKnowledgeBase(
    customerMessage,
    5,
    config.confidenceThreshold
  );

  const context = relevantDocs.length > 0
    ? relevantDocs.map((d) => `[${d.title}]: ${d.content}`).join("\n---\n")
    : "No relevant knowledge base articles found.";

  const noContext = relevantDocs.length === 0;

  // 6. Build messages for LLM
  const channelNote = channel === "livechat"
    ? "Keep responses under 200 words."
    : "Keep responses under 100 words (mobile messaging channel).";

  const systemMessage = `${config.systemPrompt}\n\nChannel: ${channel}. ${channelNote}`;

  const conversationMessages = history.reverse().map((m) => ({
    role: m.senderType === "CUSTOMER" ? "user" as const : "assistant" as const,
    content: m.content,
  }));

  const userMessage = noContext
    ? `Customer: ${customerMessage}\n\n[No relevant knowledge base context found. Offer to connect with a team member.]`
    : `Knowledge base context:\n${context}\n\nCustomer: ${customerMessage}`;

  // 7. Call LLM
  let responseText: string;

  try {
    if (config.provider === "openai") {
      const openai = new OpenAI({ apiKey: config.apiKey });
      const completion = await openai.chat.completions.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [
          { role: "system", content: systemMessage },
          ...conversationMessages,
          { role: "user", content: userMessage },
        ],
      });
      responseText = completion.choices[0]?.message?.content || "";
    } else {
      const anthropic = new Anthropic({ apiKey: config.apiKey });
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemMessage,
        messages: [
          ...conversationMessages,
          { role: "user", content: userMessage },
        ],
      });
      responseText = response.content[0]?.type === "text" ? response.content[0].text : "";
    }
  } catch (error) {
    console.error("[AI] LLM call failed:", error);
    return {
      content: "I'm having trouble processing your request. Let me connect you with our team.",
      confidence: 0,
      sources: [],
      shouldHandoff: true,
      handoffReason: "LLM call failed",
    };
  }

  // 8. Calculate confidence
  const confidence = noContext ? 0.3 : Math.min(
    relevantDocs.reduce((sum, d) => sum + d.similarity, 0) / relevantDocs.length,
    1
  );

  // 9. Check if AI response suggests handoff (AI itself says "connect with team")
  const selfHandoff = responseText.toLowerCase().includes("connect you with") ||
    responseText.toLowerCase().includes("transfer you to") ||
    responseText.toLowerCase().includes("speak with an agent");

  const shouldHandoff = confidence < config.confidenceThreshold || (noContext && aiMessageCount >= 2);

  // 10. Save AI conversation record
  try {
    await prisma.aIConversation.create({
      data: {
        ticketId,
        query: customerMessage,
        response: responseText,
        confidence,
        sources: relevantDocs.map((d) => d.id),
        channel,
        escalated: shouldHandoff || selfHandoff,
      },
    });
  } catch (error) {
    console.error("[AI] Failed to save AI conversation:", error);
  }

  return {
    content: responseText,
    confidence,
    sources: relevantDocs.map((d) => d.id),
    shouldHandoff: shouldHandoff || selfHandoff,
    handoffReason: shouldHandoff
      ? `Low confidence (${(confidence * 100).toFixed(0)}%)`
      : selfHandoff
      ? "AI suggested handoff"
      : undefined,
  };
}
```

---

## 5. Phase 3: AI Integration into Live Chat Widget

### Step 3.1: Add AI Events to Socket Server

**File:** `src/lib/support/socket/server.ts` (MODIFY)

Add new events to `CHAT_EVENTS`:

```typescript
export const CHAT_EVENTS = {
  // ... existing events ...
  AI_MESSAGE: "chat:ai_message",       // Server → Customer: AI response
  AI_HANDOFF: "chat:ai_handoff",       // Server → Agents: AI requesting handoff
  AI_TYPING: "chat:ai_typing",         // Server → Customer: AI is generating
};
```

### Step 3.2: Add AI Response Logic to Socket Server

**File:** `src/lib/support/socket/server.ts` (MODIFY)

Import the AI generator at the top:

```typescript
import { generateAIResponse } from "@/lib/ai/generate-response";
```

**Modify the `chat:request` handler:**

After creating the ticket and session, if no agents are online, start AI handling instead of just going to OFFLINE_REPLY. Find the section where `session` is created and add:

```typescript
// After session is created and emitted to agents...
// If no agents online, start AI handling
const onlineAgentCount = Array.from(connectedAgents.values()).filter(
  (a) => a.status === "online"
).length;

if (onlineAgentCount === 0 && db) {
  // Mark ticket as AI-handling
  await db.supportTicket.update({
    where: { id: ticketId },
    data: { isAiHandling: true },
  });

  // Emit AI_CHAT state to visitor
  socket.emit("chat:ai_start", { sessionId });
}
```

**Modify the `chat:message` handler:**

After saving the customer message, check if the session is AI-handled. Add this block after the existing message save logic:

```typescript
// If session is AI-handled (no agent assigned), generate AI response
if (session && !session.agentId && db && session.ticketId) {
  // Send AI typing indicator
  io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.AI_TYPING, {
    sessionId: data.sessionId,
  });

  try {
    const aiResult = await generateAIResponse(
      data.content,
      session.ticketId,
      "livechat"
    );

    // Save AI response as SupportMessage
    const aiMessage = await db.supportMessage.create({
      data: {
        ticketId: session.ticketId,
        content: aiResult.content,
        senderType: "SYSTEM",
        senderName: "AI Assistant",
        type: "TEXT",
      },
    });

    // Emit AI message to visitor
    io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.MESSAGE, {
      id: aiMessage.id,
      sessionId: data.sessionId,
      content: aiResult.content,
      senderId: "ai",
      senderName: "AI Assistant",
      senderType: "AI",
      createdAt: new Date(),
    });

    // Update AI message count
    await db.supportTicket.update({
      where: { id: session.ticketId },
      data: { aiMessageCount: { increment: 1 } },
    });

    // If AI suggests handoff, notify agents
    if (aiResult.shouldHandoff) {
      io.to("agents").emit(CHAT_EVENTS.AI_HANDOFF, {
        sessionId: data.sessionId,
        ticketId: session.ticketId,
        visitorName: session.visitorName,
        reason: aiResult.handoffReason,
        summary: aiResult.content,
      });

      // Also notify visitor
      io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.MESSAGE, {
        id: `sys_handoff_${Date.now()}`,
        sessionId: data.sessionId,
        content: "I'm connecting you with a team member who can better assist you. Please hold on.",
        senderId: "system",
        senderName: "System",
        senderType: "SYSTEM",
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error("[Chat] AI response error:", error);
  }
}
```

**Modify the `chat:accept` handler:**

When agent accepts, clear AI handling flag:

```typescript
// After existing accept logic, add:
if (db && session.ticketId) {
  await db.supportTicket.update({
    where: { id: session.ticketId },
    data: {
      isAiHandling: false,
      aiHandoffAt: new Date(),
    },
  });
}
```

### Step 3.3: Update Chat Widget for AI State

**File:** `src/components/plugins/livesupport-chat-widget.tsx` (MODIFY)

The widget already has `AI_CHAT` and `AI_HANDOFF` states defined in the `WidgetState` type. We need to:

1. **Handle `chat:ai_start` event** — Switch to `AI_CHAT` state:

```typescript
// Add inside the useEffect where socket events are registered:
socket.on("chat:ai_start", (_data: { sessionId: string }) => {
  setWidgetState("AI_CHAT");
  setAgentName("AI Assistant");
  setMessages((prev) => [
    ...prev,
    {
      id: `sys_ai_${Date.now()}`,
      content: "Hi! I'm the AI assistant. How can I help you today?",
      senderId: "ai",
      senderName: "AI Assistant",
      senderType: "AI",
      createdAt: new Date(),
    },
  ]);
});
```

2. **Handle `chat:ai_typing` event** — Show typing indicator:

```typescript
socket.on("chat:ai_typing", () => {
  setTypingUser("AI Assistant");
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 10000);
});
```

3. **Allow sending messages in AI_CHAT state** — Update `canType` and `handleSubmit`:

```typescript
// Update canType to include AI_CHAT:
const canType =
  widgetState === "IDLE" ||
  widgetState === "ACTIVE_CHAT" ||
  widgetState === "AI_CHAT" ||
  widgetState === "OFFLINE_REPLY";

// Update handleSubmit to handle AI_CHAT:
if (
  (widgetState === "ACTIVE_CHAT" || widgetState === "AI_CHAT" || widgetState === "OFFLINE_REPLY") &&
  sessionId
) {
  sendMessage(value);
}
```

4. **Update header text** for AI_CHAT state:

```typescript
// In the header subtitle:
widgetState === "AI_CHAT"
  ? "Chatting with AI Assistant"
  : widgetState === "AI_HANDOFF"
  ? "Connecting you with an agent..."
  // ... rest of conditions
```

5. **Style AI messages differently** — In the messages map:

```typescript
// When rendering messages, add AI styling:
msg.senderType === "AI" && "mr-auto rounded-bl-sm bg-blue-50 text-gray-800 border border-blue-100"
```

### Step 3.4: Update Agent Timeout Behavior

**File:** `src/lib/support/socket/server.ts` (MODIFY)

Currently, agent timeout just notifies the visitor. Change it to start AI handling:

```typescript
// Replace the existing timeout logic in chat:request handler:
session.timeoutTimer = setTimeout(async () => {
  const currentSession = chatSessions.get(sessionId);
  if (currentSession && currentSession.status === "WAITING") {
    // Start AI handling instead of just showing timeout
    socket.emit("chat:ai_start", { sessionId });

    if (db && currentSession.ticketId) {
      await db.supportTicket.update({
        where: { id: currentSession.ticketId },
        data: { isAiHandling: true },
      });
    }

    console.log(`[Chat] AI taking over session: ${sessionId} (agent timeout)`);
  }
}, timeoutSeconds * 1000);
```

---

## 6. Phase 4: AI Integration into Admin Dashboard

### Step 4.1: Show AI Handoff Requests

**File:** `src/app/admin/tickets/chat/live-chat-client.tsx` (MODIFY)

Add handler for `CHAT_EVENTS.AI_HANDOFF`:

```typescript
// Add to socket event listeners in useEffect:
socket.on("chat:ai_handoff", (data: {
  sessionId: string;
  ticketId: string;
  visitorName: string;
  reason: string;
  summary: string;
}) => {
  // Show prominent notification
  toast.warning(`AI needs help: ${data.visitorName}`, {
    description: data.reason,
    duration: 15000,
    action: {
      label: "Accept",
      onClick: () => handleAcceptChat(data.sessionId),
    },
  });

  // Update session in list to show AI handoff indicator
  setSessions((prev) =>
    prev.map((s) =>
      s.id === data.sessionId
        ? { ...s, aiHandoff: true, aiHandoffReason: data.reason }
        : s
    )
  );
});
```

### Step 4.2: Show AI Badge in Session List

In the session list rendering, add an AI indicator badge:

```tsx
{/* After the status badge, add: */}
{session.aiHandoff && (
  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
    AI Handoff
  </Badge>
)}
```

### Step 4.3: Show AI Conversation History

When an agent accepts an AI-handled chat, they should see the full AI conversation. The existing `loadHistoricalMessages` function already loads all SupportMessages, so AI messages (senderType: SYSTEM, senderName: AI Assistant) will appear automatically. No change needed.

Optionally, style AI messages differently in the admin chat:

```tsx
// In the message rendering, add special styling for AI messages:
msg.senderName === "AI Assistant" && (
  <Badge variant="outline" className="text-xs mb-1">AI</Badge>
)
```

---

## 7. Phase 5: Knowledge Base Admin UI

### Step 5.1: Create Knowledge Base API Routes

**File:** `src/app/api/admin/knowledge-base/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ingestDocument, updateDocumentEmbedding } from "@/lib/ai/rag";

// GET — List all knowledge base documents
export async function GET() {
  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ documents });
}

// POST — Create a new knowledge base document
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, category, tags } = body;

  if (!title || !content || !category) {
    return NextResponse.json(
      { error: "Title, content, and category are required" },
      { status: 400 }
    );
  }

  const docId = await ingestDocument(title, content, category, tags || []);

  return NextResponse.json({ id: docId, success: true });
}
```

**File:** `src/app/api/admin/knowledge-base/[id]/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateDocumentEmbedding } from "@/lib/ai/rag";

// PUT — Update a document
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const doc = await prisma.knowledgeDocument.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags,
      isActive: body.isActive,
    },
  });

  // Re-embed if content changed
  if (body.content) {
    await updateDocumentEmbedding(id);
  }

  return NextResponse.json({ document: doc });
}

// DELETE — Delete a document
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.knowledgeDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

### Step 5.2: Create Knowledge Base Admin Page

**File:** `src/app/admin/knowledge-base/page.tsx` (CREATE)

Server component that loads data and renders the client component.

```typescript
import { prisma } from "@/lib/db";
import { KnowledgeBaseClient } from "./knowledge-base-client";

export default async function KnowledgeBasePage() {
  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return <KnowledgeBaseClient documents={documents} />;
}
```

**File:** `src/app/admin/knowledge-base/knowledge-base-client.tsx` (CREATE)

Build a full CRUD page with:
- Table listing all documents (title, category, tags, active status, date)
- "Add Document" dialog with form: title, content (textarea), category (select), tags (comma-separated)
- Edit/Delete actions per row
- Category filter tabs: All, FAQ, Service, Policy, etc.
- Search bar
- Bulk re-embed button (re-generates embeddings for all docs)

Use existing shadcn/ui components: Card, Button, Input, Textarea, Dialog, Badge, Select, Table.

Categories to use: `"faq"`, `"service"`, `"policy"`, `"pricing"`, `"process"`, `"general"`

---

## 8. Phase 6: WhatsApp Integration

### Step 6.1: Create WhatsApp Webhook Handler

**File:** `src/app/api/webhooks/whatsapp/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAIResponse } from "@/lib/ai/generate-response";

// GET — Webhook verification (Meta requires this)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = await getWhatsAppVerifyToken();

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST — Incoming messages
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Extract message from webhook payload
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) {
    // Status update, not a message — acknowledge
    return NextResponse.json({ status: "ok" });
  }

  const from = message.from;              // Customer phone number
  const text = message.text?.body;         // Message text
  const contactName = value?.contacts?.[0]?.profile?.name || "WhatsApp User";

  if (!text) {
    return NextResponse.json({ status: "ok" }); // Media message — skip for now
  }

  try {
    // Find or create SupportTicket
    let ticket = await prisma.supportTicket.findFirst({
      where: { channelId: from, source: "WHATSAPP" },
      orderBy: { createdAt: "desc" },
    });

    if (!ticket || ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      const count = await prisma.supportTicket.count();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const ticketNumber = `WA-${dateStr}-${String(count + 1).padStart(4, "0")}`;

      ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          subject: `WhatsApp - ${contactName}`,
          status: "OPEN",
          priority: "MEDIUM",
          source: "WHATSAPP",
          channelId: from,
          guestName: contactName,
          guestPhone: from,
          isAiHandling: true,
        },
      });
    }

    // Save incoming message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        content: text,
        senderType: "CUSTOMER",
        senderName: contactName,
        type: "TEXT",
      },
    });

    // If ticket is assigned to agent, don't auto-reply (agent handles it from dashboard)
    if (ticket.assignedToId && !ticket.isAiHandling) {
      // TODO: Notify agent via Socket.io about new WhatsApp message
      return NextResponse.json({ status: "ok" });
    }

    // Generate AI response
    const aiResult = await generateAIResponse(text, ticket.id, "whatsapp");

    // Save AI response
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        content: aiResult.content,
        senderType: "SYSTEM",
        senderName: "AI Assistant",
        type: "TEXT",
      },
    });

    // Send reply via WhatsApp Cloud API
    await sendWhatsAppMessage(from, aiResult.content);

    // If handoff needed, update ticket for agent pickup
    if (aiResult.shouldHandoff) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { priority: "HIGH" }, // Bump priority for agent attention
      });
    }
  } catch (error) {
    console.error("[WhatsApp] Webhook error:", error);
  }

  return NextResponse.json({ status: "ok" });
}

// ─── Helpers ──────────────────────────────────────────────────

async function getWhatsAppConfig() {
  const config = await prisma.channelConfig.findUnique({
    where: { channel: "whatsapp" },
  });
  return (config?.config || {}) as {
    phoneNumberId?: string;
    accessToken?: string;
    verifyToken?: string;
  };
}

async function getWhatsAppVerifyToken(): Promise<string> {
  const config = await getWhatsAppConfig();
  return config.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || "";
}

async function sendWhatsAppMessage(to: string, text: string) {
  const config = await getWhatsAppConfig();
  const phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error("[WhatsApp] Missing config: phoneNumberId or accessToken");
    return;
  }

  await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
}
```

### Step 6.2: Force Dynamic for Webhook Route

Add at the top of the file:

```typescript
export const dynamic = "force-dynamic";
```

---

## 9. Phase 7: Messenger Integration

### Step 7.1: Create Messenger Webhook Handler

**File:** `src/app/api/webhooks/messenger/route.ts` (CREATE)

Same pattern as WhatsApp but with Messenger-specific payload format:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAIResponse } from "@/lib/ai/generate-response";

export const dynamic = "force-dynamic";

// GET — Webhook verification
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = await getMessengerVerifyToken();

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST — Incoming messages
export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      const senderId = event.sender?.id;  // Page-Scoped User ID (PSID)
      const messageText = event.message?.text;

      if (!senderId || !messageText) continue;

      try {
        // Find or create SupportTicket
        let ticket = await prisma.supportTicket.findFirst({
          where: { channelId: senderId, source: "MESSENGER" },
          orderBy: { createdAt: "desc" },
        });

        if (!ticket || ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
          const count = await prisma.supportTicket.count();
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const ticketNumber = `MSG-${dateStr}-${String(count + 1).padStart(4, "0")}`;

          ticket = await prisma.supportTicket.create({
            data: {
              ticketNumber,
              subject: `Messenger - User ${senderId.slice(-6)}`,
              status: "OPEN",
              priority: "MEDIUM",
              source: "MESSENGER",
              channelId: senderId,
              guestName: `Messenger User`,
              isAiHandling: true,
            },
          });
        }

        // Save incoming message
        await prisma.supportMessage.create({
          data: {
            ticketId: ticket.id,
            content: messageText,
            senderType: "CUSTOMER",
            senderName: "Messenger User",
            type: "TEXT",
          },
        });

        // Skip if assigned to agent
        if (ticket.assignedToId && !ticket.isAiHandling) continue;

        // Generate AI response
        const aiResult = await generateAIResponse(messageText, ticket.id, "messenger");

        // Save AI response
        await prisma.supportMessage.create({
          data: {
            ticketId: ticket.id,
            content: aiResult.content,
            senderType: "SYSTEM",
            senderName: "AI Assistant",
            type: "TEXT",
          },
        });

        // Send reply via Messenger
        await sendMessengerMessage(senderId, aiResult.content);

        if (aiResult.shouldHandoff) {
          await prisma.supportTicket.update({
            where: { id: ticket.id },
            data: { priority: "HIGH" },
          });
        }
      } catch (error) {
        console.error("[Messenger] Message processing error:", error);
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}

// ─── Helpers ──────────────────────────────────────────────────

async function getMessengerConfig() {
  const config = await prisma.channelConfig.findUnique({
    where: { channel: "messenger" },
  });
  return (config?.config || {}) as {
    pageAccessToken?: string;
    verifyToken?: string;
  };
}

async function getMessengerVerifyToken(): Promise<string> {
  const config = await getMessengerConfig();
  return config.verifyToken || process.env.MESSENGER_VERIFY_TOKEN || "";
}

async function sendMessengerMessage(recipientId: string, text: string) {
  const config = await getMessengerConfig();
  const pageToken = config.pageAccessToken || process.env.MESSENGER_PAGE_TOKEN;

  if (!pageToken) {
    console.error("[Messenger] Missing page access token");
    return;
  }

  await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pageToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
}
```

---

## 10. Phase 8: Unified Inbox Updates

### Step 8.1: Add Channel Icons to Ticket List

**File:** `src/app/admin/tickets/tickets-client.tsx` (MODIFY)

Add channel source icons next to each ticket in the list:

```tsx
// Helper function for channel icon
function ChannelIcon({ source }: { source: string }) {
  switch (source) {
    case "WHATSAPP":
      return <span className="text-green-600" title="WhatsApp">📱</span>;
    case "MESSENGER":
      return <span className="text-blue-600" title="Messenger">💙</span>;
    case "INSTAGRAM":
      return <span className="text-purple-600" title="Instagram">📷</span>;
    case "LIVE_CHAT":
      return <span className="text-gray-600" title="Live Chat">💬</span>;
    default:
      return <span className="text-gray-400" title={source}>📧</span>;
  }
}
```

Add channel filter tabs:

```tsx
// Filter options: [All] [💬 Live Chat] [📱 WhatsApp] [💙 Messenger]
```

### Step 8.2: Agent Reply to WhatsApp/Messenger from Dashboard

**File:** `src/app/api/admin/tickets/[id]/reply/route.ts` (CREATE)

When agent replies to a ticket that has source=WHATSAPP or MESSENGER, send the reply through the respective channel API:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content, senderId, senderName } = await req.json();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { source: true, channelId: true, isAiHandling: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Save message to DB
  const message = await prisma.supportMessage.create({
    data: {
      ticketId: id,
      content,
      senderType: "AGENT",
      senderName,
      senderId,
      type: "TEXT",
    },
  });

  // Disable AI handling when agent takes over
  if (ticket.isAiHandling) {
    await prisma.supportTicket.update({
      where: { id },
      data: { isAiHandling: false, assignedToId: senderId },
    });
  }

  // Route reply through the correct channel
  if (ticket.source === "WHATSAPP" && ticket.channelId) {
    const { sendWhatsAppMessage } = await import("@/lib/channels/whatsapp");
    await sendWhatsAppMessage(ticket.channelId, content);
  } else if (ticket.source === "MESSENGER" && ticket.channelId) {
    const { sendMessengerMessage } = await import("@/lib/channels/messenger");
    await sendMessengerMessage(ticket.channelId, content);
  }

  return NextResponse.json({ message });
}
```

### Step 8.3: Extract Channel Send Functions

**File:** `src/lib/channels/whatsapp.ts` (CREATE)

Extract the `sendWhatsAppMessage` function from the webhook handler into a shared module.

**File:** `src/lib/channels/messenger.ts` (CREATE)

Extract the `sendMessengerMessage` function from the webhook handler into a shared module.

---

## 11. Phase 9: Settings UI for Channels + AI

### Step 9.1: Create Channel Settings API

**File:** `src/app/api/admin/channel-settings/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — Get all channel configs
export async function GET() {
  const configs = await prisma.channelConfig.findMany();
  return NextResponse.json({ configs });
}
```

**File:** `src/app/api/admin/channel-settings/[channel]/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT — Update channel config
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  const { channel } = await params;
  const body = await req.json();

  const config = await prisma.channelConfig.upsert({
    where: { channel },
    update: {
      isEnabled: body.isEnabled,
      config: body.config,
    },
    create: {
      channel,
      isEnabled: body.isEnabled ?? false,
      config: body.config ?? {},
    },
  });

  return NextResponse.json({ config });
}
```

### Step 9.2: Add AI & Channel Tabs to Settings Page

**File:** `src/app/admin/tickets/settings/settings-client.tsx` (MODIFY)

Add two new tabs to the existing settings page:

1. **AI Settings Tab** — Configure:
   - Provider: OpenAI / Anthropic (dropdown)
   - Model: gpt-4o-mini, gpt-4o, claude-3-5-haiku, claude-3-5-sonnet (dropdown)
   - API Key (password input)
   - System Prompt (textarea)
   - Max Tokens (number)
   - Temperature (slider 0-1)
   - Confidence Threshold (slider 0-1)
   - Max AI Turns before handoff (number)

2. **Channels Tab** — Configure:
   - **WhatsApp**: Enable/disable toggle, Phone Number ID, Access Token, Verify Token
   - **Messenger**: Enable/disable toggle, Page Access Token, App Secret, Verify Token
   - **Instagram**: Enable/disable toggle (future - grayed out)

Each channel section shows the webhook URL to configure in Meta Developer Portal:
- WhatsApp: `{YOUR_DOMAIN}/api/webhooks/whatsapp`
- Messenger: `{YOUR_DOMAIN}/api/webhooks/messenger`

---

## 12. Phase 10: Testing & Deployment

### Step 10.1: Test AI Chat Flow

1. Start dev server: `npm run dev`
2. Start chat server: `npm run dev:chat`
3. Add at least 3-5 knowledge base documents via admin
4. Open chat widget on frontend — send a message
5. Verify: Agent timeout → AI takes over → AI responds with KB context
6. Verify: Say "talk to a person" → AI triggers handoff
7. Accept chat from admin dashboard → verify agent sees AI history

### Step 10.2: Test WhatsApp (Requires Meta Business Verification)

1. Set up Meta Developer App + WhatsApp product
2. Configure webhook URL in Meta dashboard
3. Add verify token to settings
4. Send test message from WhatsApp → verify AI reply

### Step 10.3: Test Messenger

1. Set up Messenger product in Meta Developer App
2. Configure webhook URL
3. Connect Facebook Page
4. Send test message from Messenger → verify AI reply

### Step 10.4: Production Deployment Checklist

- [ ] Set all environment variables on VPS
- [ ] Run `npx prisma migrate deploy`
- [ ] Build: `npm run build`
- [ ] Start Next.js: `npm run start`
- [ ] Start Socket.io: `npm run start:socket`
- [ ] Configure Nginx reverse proxy for webhook endpoints
- [ ] Enable HTTPS (required by Meta for webhooks)
- [ ] Test all channels end-to-end

---

## 13. Environment Variables

Add to `.env`:

```env
# AI Provider (required for AI features)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# WhatsApp Cloud API (optional — can be set from admin settings)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=

# Messenger (optional — can be set from admin settings)
MESSENGER_PAGE_TOKEN=
MESSENGER_VERIFY_TOKEN=
MESSENGER_APP_SECRET=
```

---

## 14. File Map

### Files to CREATE

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `src/lib/ai/config.ts` | AI configuration loader |
| 2 | `src/lib/ai/rag.ts` | RAG pipeline (embed + search + ingest) |
| 3 | `src/lib/ai/generate-response.ts` | AI response generator with handoff logic |
| 4 | `src/lib/channels/whatsapp.ts` | WhatsApp send message helper |
| 5 | `src/lib/channels/messenger.ts` | Messenger send message helper |
| 6 | `src/app/api/webhooks/whatsapp/route.ts` | WhatsApp webhook handler |
| 7 | `src/app/api/webhooks/messenger/route.ts` | Messenger webhook handler |
| 8 | `src/app/api/admin/knowledge-base/route.ts` | KB list + create API |
| 9 | `src/app/api/admin/knowledge-base/[id]/route.ts` | KB update + delete API |
| 10 | `src/app/api/admin/channel-settings/route.ts` | Channel settings list API |
| 11 | `src/app/api/admin/channel-settings/[channel]/route.ts` | Channel settings update API |
| 12 | `src/app/api/admin/tickets/[id]/reply/route.ts` | Agent reply with channel routing |
| 13 | `src/app/admin/knowledge-base/page.tsx` | KB admin page (server) |
| 14 | `src/app/admin/knowledge-base/knowledge-base-client.tsx` | KB admin UI (client) |

### Files to MODIFY

| # | File Path | What to Change |
|---|-----------|---------------|
| 1 | `prisma/schema.prisma` | Add TicketSource values, channelId, isAiHandling, AIConversation, ChannelConfig |
| 2 | `src/lib/support/socket/server.ts` | Add AI events, AI response in message handler, AI takeover on timeout |
| 3 | `src/components/plugins/livesupport-chat-widget.tsx` | Handle AI_CHAT state, ai_start/ai_typing events, AI message styling |
| 4 | `src/app/admin/tickets/chat/live-chat-client.tsx` | Handle AI handoff notifications, AI badges |
| 5 | `src/app/admin/tickets/tickets-client.tsx` | Add channel icons, channel filter tabs |
| 6 | `src/app/admin/tickets/settings/settings-client.tsx` | Add AI Settings tab, Channels tab |

### Packages to INSTALL

```bash
npm install openai @anthropic-ai/sdk
```

---

## Implementation Order (Priority)

1. **Schema changes** (Phase 1) — 30 min
2. **AI engine** (Phase 2) — 2-3 hours
3. **Live chat AI integration** (Phase 3) — 2-3 hours
4. **Admin dashboard updates** (Phase 4) — 1-2 hours
5. **Knowledge base UI** (Phase 5) — 2-3 hours
6. **WhatsApp integration** (Phase 6) — 2-3 hours
7. **Messenger integration** (Phase 7) — 1-2 hours
8. **Unified inbox** (Phase 8) — 1-2 hours
9. **Settings UI** (Phase 9) — 2-3 hours
10. **Testing** (Phase 10) — 2-3 hours

**Total estimated implementation time: 15-25 hours**

---

> **Note:** This plan builds incrementally. Each phase can be tested independently.
> Phase 1-3 gives you a working AI chat. Phase 4-5 gives you admin control.
> Phase 6-7 adds external channels. Phase 8-9 polishes the experience.

---

## CodeCanyon vs Full Version — Feature Release Strategy

### Why Two Versions?

- **CodeCanyon ($59)**: High volume, lower price. Sell to thousands of buyers. Focus on core live chat features.
- **Full AI Version ($999+)**: Direct sales outside CodeCanyon. Premium AI + omnichannel features. Higher margin, fewer buyers.

This dual strategy maximizes revenue from the same codebase.

---

### Tier 1: CodeCanyon Version — $59 (Regular) / $199 (Extended)

**Target:** Small businesses, freelancers, WordPress/Next.js developers looking for a chat widget.

#### Included Features (20 Existing Features)

| # | Feature | Status |
|---|---------|--------|
| 1 | Real-time live chat (Socket.io) | ✅ Already built |
| 2 | Customer chat widget (embeddable) | ✅ Already built |
| 3 | Agent dashboard with session management | ✅ Already built |
| 4 | Multi-agent support (multiple agents online) | ✅ Already built |
| 5 | Chat queue system with auto-assignment | ✅ Already built |
| 6 | Typing indicators (both sides) | ✅ Already built |
| 7 | Offline message form | ✅ Already built |
| 8 | Pre-chat lead collection form | ✅ Already built |
| 9 | Session persistence (page refresh survives) | ✅ Already built |
| 10 | Agent timeout detection & auto-reassign | ✅ Already built |
| 11 | Chat session rejoin | ✅ Already built |
| 12 | Agent online/offline status tracking | ✅ Already built |
| 13 | Chat to ticket conversion | ✅ Already built |
| 14 | Email notification system | ✅ Already built |
| 15 | Lead tracking & scoring | ✅ Already built |
| 16 | Duplicate lead detection | ✅ Already built |
| 17 | Custom widget branding/colors | ✅ Already built |
| 18 | Mobile responsive widget | ✅ Already built |
| 19 | Plugin system (enable/disable) | ✅ Already built |
| 20 | Sound notifications | ✅ Already built |

#### NOT Included in CodeCanyon Version

- ❌ AI Chatbot / Auto-reply
- ❌ Knowledge Base RAG
- ❌ AI-to-Human Handoff
- ❌ WhatsApp Integration
- ❌ Messenger Integration
- ❌ Unified Inbox (Omnichannel)
- ❌ BYOK (Bring Your Own API Key)
- ❌ AI Analytics & Reporting

#### CodeCanyon Pricing Logic

| License | Price | What buyer gets |
|---------|-------|-----------------|
| Regular | $59 | Use in 1 project, no resale |
| Extended | $199 | Use in SaaS/resale product |

#### Revenue Estimate (CodeCanyon)

- Conservative: 50 sales/month × $59 = **$2,950/mo** (CodeCanyon takes ~37.5% = ~$1,844 net)
- Optimistic: 150 sales/month × $59 = **$8,850/mo** (~$5,531 net)
- Top sellers in this category: Tidio clone, LiveChat clone = 500+ sales/month

---

### Tier 2: Pro Version — $299 (Direct Sale)

**Target:** Growing businesses that want AI automation but don't need WhatsApp/Messenger.

#### Includes Everything in CodeCanyon PLUS:

| # | Feature | Implementation Phase |
|---|---------|---------------------|
| 1 | AI Chatbot with LLM (OpenAI/Anthropic) | Phase 2 |
| 2 | Knowledge Base RAG (pgvector) | Phase 2 |
| 3 | AI-to-Human Handoff (smart detection) | Phase 3 |
| 4 | AI confidence threshold settings | Phase 3 |
| 5 | Knowledge base admin UI (CRUD) | Phase 5 |
| 6 | Document upload for training (PDF, TXT, MD) | Phase 5 |
| 7 | AI response analytics | Phase 4 |
| 8 | BYOK — Bring Your Own API Key | Phase 9 |
| 9 | AI personality/tone customization | Phase 9 |
| 10 | Canned responses library | Phase 4 |

#### NOT Included in Pro

- ❌ WhatsApp Integration
- ❌ Messenger Integration
- ❌ Unified Inbox (Omnichannel)
- ❌ Instagram DM Integration (future)

#### Revenue Estimate (Direct Sale)

- Conservative: 10 sales/month × $299 = **$2,990/mo** (100% yours, no marketplace cut)
- Optimistic: 30 sales/month × $299 = **$8,970/mo**

---

### Tier 3: Ultimate Version — $999 (Direct Sale)

**Target:** Agencies, mid-size businesses, SaaS companies that need full omnichannel.

#### Includes Everything in Pro PLUS:

| # | Feature | Implementation Phase |
|---|---------|---------------------|
| 1 | WhatsApp Cloud API integration | Phase 6 |
| 2 | WhatsApp AI auto-reply | Phase 6 |
| 3 | Facebook Messenger integration | Phase 7 |
| 4 | Messenger AI auto-reply | Phase 7 |
| 5 | Unified Inbox (all channels in one) | Phase 8 |
| 6 | Channel-specific settings | Phase 9 |
| 7 | Per-channel AI toggle | Phase 9 |
| 8 | WhatsApp template messages | Phase 6 |
| 9 | Messenger persistent menu | Phase 7 |
| 10 | Omnichannel analytics dashboard | Phase 8 |
| 11 | Priority support (6 months) | — |
| 12 | White-label option | — |

#### Revenue Estimate (Direct Sale)

- Conservative: 5 sales/month × $999 = **$4,995/mo**
- Optimistic: 15 sales/month × $999 = **$14,985/mo**

---

### Combined Revenue Projection

| Source | Conservative/mo | Optimistic/mo |
|--------|----------------|---------------|
| CodeCanyon ($59) | $1,844 net | $5,531 net |
| Pro Direct ($299) | $2,990 | $8,970 |
| Ultimate Direct ($999) | $4,995 | $14,985 |
| **Total** | **$9,829/mo** | **$29,486/mo** |

---

### Feature Lock Strategy (How to Separate Tiers in Code)

```typescript
// src/lib/license/feature-gate.ts

export type LicenseTier = 'codecanyon' | 'pro' | 'ultimate';

export const TIER_FEATURES: Record<LicenseTier, string[]> = {
  codecanyon: [
    'live_chat',
    'agent_dashboard',
    'chat_queue',
    'offline_form',
    'lead_collection',
    'lead_tracking',
    'email_notifications',
    'widget_customization',
    'plugin_system',
  ],
  pro: [
    // All codecanyon features +
    'ai_chatbot',
    'knowledge_base_rag',
    'ai_handoff',
    'ai_analytics',
    'byok',
    'ai_personality',
    'canned_responses',
    'document_upload',
  ],
  ultimate: [
    // All pro features +
    'whatsapp_integration',
    'messenger_integration',
    'unified_inbox',
    'channel_settings',
    'omnichannel_analytics',
    'whitelabel',
  ],
};

export function hasFeature(tier: LicenseTier, feature: string): boolean {
  const allFeatures = getTierFeatures(tier);
  return allFeatures.includes(feature);
}

function getTierFeatures(tier: LicenseTier): string[] {
  switch (tier) {
    case 'ultimate':
      return [
        ...TIER_FEATURES.codecanyon,
        ...TIER_FEATURES.pro,
        ...TIER_FEATURES.ultimate,
      ];
    case 'pro':
      return [...TIER_FEATURES.codecanyon, ...TIER_FEATURES.pro];
    case 'codecanyon':
      return TIER_FEATURES.codecanyon;
  }
}
```

---

### Implementation Priority by Tier

**Step 1 — Ship CodeCanyon version first** (Already done — existing 20 features)
- Polish UI, fix bugs, write documentation
- Submit to CodeCanyon for review
- Start earning from Day 1

**Step 2 — Build Pro version** (Phase 1-5 from this doc, ~8-12 hours)
- AI chatbot engine + RAG + handoff + knowledge base UI
- Sell on your own website at $299

**Step 3 — Build Ultimate version** (Phase 6-9, ~6-10 hours)
- WhatsApp + Messenger + Unified inbox
- Sell on your own website at $999

**Step 4 — Optional SaaS model** (Monthly recurring)
- Host it yourself, charge $29-$99/month
- API costs passed to customer via BYOK
- Highest long-term revenue but needs infrastructure

---

### CodeCanyon Competitor Analysis

| Product | Price | AI? | WhatsApp? | Rating |
|---------|-------|-----|-----------|--------|
| LiveHelper Chat | $59 | ❌ | ❌ | 4.5★ |
| Jeechat | $39 | ❌ | ❌ | 4.3★ |
| Support Board | $59 | Basic | $29 addon | 4.7★ |
| Chaty | $25 | ❌ | Link only | 4.6★ |
| **Our app (CC)** | **$59** | **❌** | **❌** | **New** |

Our CodeCanyon version competes directly at $59 with better UI (Next.js + shadcn) and more features than most competitors.

### Full-Version Competitor Analysis

| Product | Price | AI? | WhatsApp? | Model |
|---------|-------|-----|-----------|-------|
| Tidio | $29-$289/mo | ✅ | ✅ | SaaS |
| Intercom | $39-$139/mo | ✅ | ✅ | SaaS |
| Crisp | $25-$95/mo | ✅ | ✅ | SaaS |
| Chatwoot (self-host) | Free/$19/mo | Plugin | ✅ | Open source |
| **Our app (Pro)** | **$299 once** | **✅** | **❌** | **One-time** |
| **Our app (Ultimate)** | **$999 once** | **✅** | **✅** | **One-time** |

Our killer advantage: **One-time purchase** vs competitor's monthly SaaS fees. A customer paying $39/mo for Tidio spends $468/year — our Ultimate at $999 pays for itself in ~2 years with zero recurring fees.

---

### Client API Costs (What Buyers Pay Monthly)

These are the API costs your customers will pay directly to providers (BYOK model):

#### Text Chat Only (AI Chatbot)

| Scale | Messages/mo | LLM Cost | Total/mo |
|-------|-------------|----------|----------|
| Small | 500 | GPT-4o-mini: ~$0.50 | **~$0.50** |
| Medium | 5,000 | GPT-4o-mini: ~$5 | **~$5** |
| Large | 50,000 | GPT-4o-mini: ~$50 | **~$50** |

#### Text + RAG (Knowledge Base)

| Scale | Messages/mo | LLM + Embedding Cost | Total/mo |
|-------|-------------|---------------------|----------|
| Small | 500 | ~$1.50 | **~$1.50** |
| Medium | 5,000 | ~$8 | **~$8** |
| Large | 50,000 | ~$65 | **~$65** |

> **Note:** These costs are extremely low. Most small businesses will pay under $5/month for AI. This is a strong selling point — "AI chatbot for under $5/month in API costs."

---

### Marketing Angles

**CodeCanyon listing title:**
"AI-Ready Live Chat — Real-time Support Widget with Agent Dashboard, Lead Tracking & Queue System"

**Key selling points for CodeCanyon:**
1. Built with Next.js 15 + TypeScript (modern stack)
2. Real-time Socket.io chat (not polling)
3. Agent dashboard with queue management
4. Lead collection & scoring built-in
5. Fully customizable widget
6. Plugin system for extensibility
7. Upgrade path to AI + Omnichannel (upsell)

**Key selling points for Pro/Ultimate (direct sale):**
1. AI chatbot that learns from your docs (RAG)
2. Smart AI-to-human handoff
3. WhatsApp + Messenger in one inbox
4. One-time purchase — no monthly SaaS fees
5. BYOK — you control your API costs
6. Self-hosted — your data stays on your server

---

## Competitor Feature Analysis — CRM, Lead Management & Meeting Scheduling

### Competitor Feature Matrix

| Feature | HubSpot | Intercom | Tidio | Crisp | Drift/Salesloft | Chatwoot | **Our App** |
|---------|---------|----------|-------|-------|-----------------|----------|-------------|
| **Live Chat** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Already |
| **AI Chatbot** | ✅ | ✅ (Fin) | ✅ (Lyro) | ✅ | ✅ | ✅ (Captain) | ✅ Phase 2 |
| **Contact Management** | ✅ | ✅ | Basic | ✅ | ✅ | ✅ | ❌ Need |
| **Deal/Pipeline Tracking** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ Need |
| **Lead Scoring** | ✅ (Paid) | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ Basic exists |
| **Meeting Scheduler** | ✅ | ✅ | Via Calendly | ❌ | ✅ | ❌ | ❌ Need |
| **CSAT Surveys** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ Need |
| **Canned Responses** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ Need |
| **Visitor Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ Need |
| **Tags & Labels** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ Need |
| **Chat Routing Rules** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Basic exists |
| **Automation Workflows** | ✅ | ✅ | ✅ | ❌ | ✅ (Playbooks) | ✅ (Macros) | ❌ Need |
| **Notes on Contacts** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ Need |
| **WhatsApp** | ✅ (Paid) | ✅ (Paid) | ❌ | ✅ | ❌ | ✅ | ✅ Phase 6 |
| **Messenger** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ Phase 7 |
| **File/Attachment Sharing** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ Need |
| **Email Integration** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Basic exists |
| **Reports & Analytics** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ Need |
| **Pricing** | Free-$800/mo | $39-$139/mo | $29-$289/mo | $0-$95/mo | Custom | Free/$19/mo | One-time |

---

### Features We SHOULD Add — Priority Analysis

Based on competitor analysis, these are the features that most competitors have and our app is missing. Organized by impact and implementation effort.

#### Priority 1: MUST HAVE (Competitors all have these — buyers expect them)

| # | Feature | Why Essential | Effort | Tier |
|---|---------|--------------|--------|------|
| 1 | **Contact/CRM Management** | Every competitor has a contact database with profile view, conversation history, custom fields. Buyers expect to see WHO they're chatting with. | Medium (8-12 hrs) | CodeCanyon |
| 2 | **Canned Responses** | Agents need pre-written replies for speed. Every single competitor has this. Basic table + quick insert UI. | Easy (3-4 hrs) | CodeCanyon |
| 3 | **Tags & Labels** | Organize conversations/contacts by topic, priority, status. All competitors have this. Simple tagging system. | Easy (2-3 hrs) | CodeCanyon |
| 4 | **File/Attachment Sharing** | Send images, PDFs, docs in chat. All competitors support this. Upload to Cloudflare R2. | Medium (4-6 hrs) | CodeCanyon |
| 5 | **Chat Rating / CSAT** | After chat ends, customer rates 1-5 stars. Chatwoot, Intercom, Tidio all have this. Simple survey widget. | Easy (3-4 hrs) | CodeCanyon |
| 6 | **Notes on Contacts** | Agents need to write internal notes about customers. Visible to team, not customer. | Easy (2-3 hrs) | CodeCanyon |
| 7 | **Basic Reports** | Chat count, response time, agent performance, CSAT average. Every competitor has a reporting dashboard. | Medium (6-8 hrs) | CodeCanyon |

> **Total for Priority 1: ~28-40 hours** — These should go into CodeCanyon version to compete.

#### Priority 2: HIGH VALUE (Differentiators that increase price)

| # | Feature | Why Important | Effort | Tier |
|---|---------|--------------|--------|------|
| 8 | **Visitor Tracking** | See which page visitor is on, referral source, location, device. HubSpot, Tidio, Drift all show this. Great for sales. | Medium (6-8 hrs) | Pro |
| 9 | **Meeting Scheduler** | Book meetings from chat. HubSpot, Drift, Intercom all have this. Integrate with Calendly or build custom calendar picker. | Medium (8-10 hrs) | Pro |
| 10 | **Deal/Pipeline Tracking** | Visual Kanban board for deals. Move leads through stages (New → Qualified → Proposal → Won/Lost). HubSpot and Drift's killer feature. | Medium (10-14 hrs) | Pro |
| 11 | **Automation Rules** | "If message contains X, assign to Team Y" or "If no reply in 5 min, send follow-up". Chatwoot macros, Drift playbooks. | Medium (8-12 hrs) | Pro |
| 12 | **Advanced Lead Scoring** | Score contacts based on pages visited, messages sent, deals value, engagement level. Auto-prioritize hot leads. | Medium (6-8 hrs) | Pro |

> **Total for Priority 2: ~38-52 hours** — These go into Pro/Ultimate to justify $299-$999 price.

#### Priority 3: NICE TO HAVE (Future additions)

| # | Feature | Notes | Tier |
|---|---------|-------|------|
| 13 | **Email Campaign Integration** | Send bulk emails to contacts. HubSpot has this built-in. Low priority since Mailchimp/Brevo exist. | Ultimate |
| 14 | **Chatbot Flow Builder** | Visual drag-and-drop chatbot builder like Tidio. Very high effort. Consider later. | Ultimate |
| 15 | **Video Chat** | ClickDesk has this. WebRTC-based. Niche feature. | Future |
| 16 | **Co-browsing** | See customer's screen. Very advanced. Only enterprise tools have this. | Future |
| 17 | **Multi-language Auto-translate** | Auto-translate chat messages. Nice for international businesses. | Future |

---

### Detailed Feature Specs — What to Build

#### 1. Contact/CRM Management

**What competitors do:**
- HubSpot: Full CRM with companies, contacts, deals, activities timeline
- Intercom: User profiles with event tracking, custom attributes, segments
- Crisp: Contact list with conversation history, custom data fields
- Chatwoot: Contact profiles with custom attributes, labels, conversation history

**What we should build:**

```
Contacts Module:
├── Contact List (searchable, filterable, sortable)
│   ├── Name, Email, Phone, Company
│   ├── Tags/Labels
│   ├── Lead Score
│   ├── Source (live chat, WhatsApp, Messenger, manual)
│   ├── Last Contacted date
│   └── Total conversations count
├── Contact Profile Page
│   ├── Contact info (editable)
│   ├── Custom fields (admin-configurable)
│   ├── Conversation history (all channels)
│   ├── Internal notes (team-only)
│   ├── Activity timeline (chats, emails, deals)
│   ├── Tags & labels
│   └── Lead score breakdown
├── Segments (saved filters)
│   ├── "Hot Leads" (score > 80)
│   ├── "WhatsApp Contacts"
│   ├── "Uncontacted" (no reply in 7 days)
│   └── Custom segments
└── Import/Export (CSV)
```

**Database additions:**
```prisma
model Contact {
  id          String   @id @default(cuid())
  name        String?
  email       String?  @unique
  phone       String?
  company     String?
  avatarUrl   String?
  source      ContactSource @default(MANUAL)
  leadScore   Int      @default(0)
  tags        Tag[]
  notes       ContactNote[]
  deals       Deal[]
  conversations SupportTicket[]
  customFields Json?
  lastContactedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@index([leadScore(sort: Desc)])
  @@index([source])
}

enum ContactSource {
  LIVE_CHAT
  WHATSAPP
  MESSENGER
  EMAIL
  MANUAL
  IMPORT
}
```

#### 2. Canned Responses

**What competitors do:**
- All competitors: Saved text snippets with shortcut keys (type `/greeting` → expands to full message)
- Tidio: Category-based canned responses
- Chatwoot: Personal + shared canned responses

**What we should build:**
```
Canned Responses:
├── Create/Edit/Delete responses
├── Categories (Greeting, FAQ, Closing, etc.)
├── Shortcut trigger (e.g., /hello, /pricing)
├── Personal responses (per agent)
├── Shared responses (team-wide)
├── Variable support ({customer_name}, {agent_name})
└── Quick insert in chat with / command
```

#### 3. Meeting Scheduler

**What competitors do:**
- HubSpot: Built-in meeting links, calendar sync (Google/Outlook), embeddable widget
- Drift: Instant meeting booking from chat, syncs with sales rep's calendar
- Intercom: Meeting bot that checks availability and books slots
- Tidio: Calendly integration via automation flow

**What we should build (2 options):**

**Option A — Calendly/Cal.com Integration (Recommended for v1, 4-6 hrs)**
```
Meeting Integration:
├── Connect Calendly/Cal.com account via API
├── Agent shares meeting link in chat
├── Customer clicks → sees available slots
├── Booking confirmation sent to both parties
├── Meeting logged in contact activity
└── Settings: default meeting duration, buffer time
```

**Option B — Built-in Scheduler (v2, 10-14 hrs)**
```
Built-in Meeting Scheduler:
├── Agent sets availability (weekly schedule)
├── Calendar picker widget in chat
├── Google Calendar / Outlook sync
├── Timezone detection
├── Booking confirmation email
├── Reminders (email/SMS)
├── Reschedule/Cancel
└── Meeting analytics
```

#### 4. Deal/Pipeline Tracking

**What competitors do:**
- HubSpot: Visual Kanban pipeline, drag-and-drop deals, deal value tracking, win/loss tracking
- Drift: Revenue attribution from chat conversations
- Pipedrive: Pipeline-focused CRM with sales forecasting

**What we should build:**
```
Deals Module:
├── Pipeline View (Kanban board)
│   ├── Stages: New → Contacted → Qualified → Proposal → Negotiation → Won/Lost
│   ├── Drag-and-drop between stages
│   ├── Deal value ($)
│   ├── Expected close date
│   └── Assigned agent
├── Deal Detail
│   ├── Contact association
│   ├── Conversation history
│   ├── Notes & activities
│   ├── Deal value & stage
│   └── Custom fields
├── Pipeline Analytics
│   ├── Total pipeline value
│   ├── Conversion rate per stage
│   ├── Average deal size
│   └── Win rate
└── Multiple Pipelines support
```

**Database additions:**
```prisma
model Deal {
  id          String     @id @default(cuid())
  title       String
  value       Decimal?   @db.Decimal(10, 2)
  currency    String     @default("USD")
  stage       DealStage  @default(NEW)
  pipelineId  String
  pipeline    Pipeline   @relation(fields: [pipelineId], references: [id])
  contactId   String
  contact     Contact    @relation(fields: [contactId], references: [id])
  assignedToId String?
  assignedTo  User?      @relation(fields: [assignedToId], references: [id])
  expectedCloseDate DateTime?
  closedAt    DateTime?
  notes       DealNote[]
  customFields Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([stage])
  @@index([pipelineId])
  @@index([contactId])
}

enum DealStage {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  WON
  LOST
}

model Pipeline {
  id     String @id @default(cuid())
  name   String
  deals  Deal[]
  stages Json   // Custom stage names and order
}
```

#### 5. Reports & Analytics Dashboard

**What competitors do:**
- HubSpot: Detailed sales & service reports, custom dashboards
- Intercom: Response time, CSAT, conversation volume, team performance
- Chatwoot: Agent reports, inbox reports, label reports, CSAT reports
- Tidio: Analytics on conversations, operators, chatbot performance

**What we should build:**
```
Reports Dashboard:
├── Overview
│   ├── Total conversations (today/week/month)
│   ├── Average response time
│   ├── Average resolution time
│   ├── CSAT average score
│   └── Conversations by channel (chart)
├── Agent Performance
│   ├── Conversations handled per agent
│   ├── Average response time per agent
│   ├── CSAT per agent
│   ├── Online hours per agent
│   └── Ranking/leaderboard
├── Lead Reports
│   ├── New leads by source
│   ├── Lead score distribution
│   ├── Conversion rate (lead → deal)
│   └── Hot leads list
├── AI Reports (Pro/Ultimate)
│   ├── AI vs Human resolution rate
│   ├── AI handoff rate
│   ├── AI confidence scores
│   ├── Top AI-resolved topics
│   └── Cost per AI conversation
├── Deal Reports (Pro/Ultimate)
│   ├── Pipeline value
│   ├── Win/loss ratio
│   ├── Revenue by agent
│   └── Forecast
└── Export (CSV, PDF)
```

#### 6. Visitor Tracking

**What competitors do:**
- HubSpot: Full visitor tracking with page views, referral source, return visits
- Tidio: Live visitor list showing current page, location, device
- Drift: Account-level visitor identification with company data
- Intercom: User event tracking, custom events, page views

**What we should build:**
```
Visitor Tracking:
├── Live Visitors List
│   ├── Current page URL
│   ├── Pages visited (breadcrumb)
│   ├── Time on site
│   ├── Location (GeoIP)
│   ├── Device & browser
│   ├── Referral source
│   └── Returning vs new visitor
├── Visitor → Contact Linking
│   ├── Auto-link when visitor starts chat
│   ├── Auto-link when visitor fills form
│   └── Manual link by agent
├── Agent Context Panel
│   ├── Show visitor info during chat
│   ├── Pages visited before chat
│   ├── Previous conversations
│   └── Contact profile (if linked)
└── Tracking Script
    ├── Lightweight JS snippet
    ├── Page view events
    ├── Custom event tracking API
    └── Privacy-compliant (no cookies option)
```

---

### Updated Tier Allocation (Final Decision)

#### CodeCanyon ($59) — 20 Features (Polish Only, NO New Features)

> **Decision:** CodeCanyon version e kono new feature add hobe na. Existing 20 features polish korbo — UI cleanup, bug fix, documentation, performance optimization.

1. Real-time live chat (Socket.io)
2. Customer chat widget (embeddable)
3. Agent dashboard with session management
4. Multi-agent support
5. Chat queue system with auto-assignment
6. Typing indicators
7. Offline message form
8. Pre-chat lead collection form
9. Session persistence
10. Agent timeout detection
11. Chat session rejoin
12. Agent online/offline status
13. Chat to ticket conversion
14. Email notification system
15. Lead tracking & scoring (basic)
16. Duplicate lead detection
17. Custom widget branding
18. Mobile responsive widget
19. Plugin system
20. Sound notifications

**CodeCanyon polishing tasks:**
- UI consistency check (all components shadcn/ui aligned)
- Mobile responsiveness audit
- Bug fixes & edge cases
- Documentation & setup guide
- Demo site with sample data
- CodeCanyon listing screenshots & description

#### Pro ($299) — CodeCanyon + AI + CRM Tools (37 Features)

All 20 CodeCanyon features PLUS:

**AI Features (Phase 1-5):**
21. AI Chatbot (OpenAI/Anthropic LLM)
22. Knowledge Base RAG (pgvector)
23. AI-to-Human Handoff
24. Knowledge base admin UI
25. BYOK (Bring Your Own API Key)
26. AI personality/tone customization
27. Document upload for training

**CRM Features (new — moved from CodeCanyon):**
28. Contact/CRM management (profiles, history, custom fields)
29. Canned responses (personal + shared, /shortcut trigger)
30. Tags & labels (conversations + contacts)
31. File/attachment sharing in chat (images, PDFs)
32. Chat rating / CSAT survey
33. Internal notes on contacts
34. Basic reports dashboard (chat volume, response time, CSAT, agent stats)
35. Visitor tracking (live visitors, pages, location)
36. Meeting scheduler (Calendly/Cal.com integration)
37. Advanced lead scoring (behavioral + engagement)

#### Ultimate ($999) — Pro + Omnichannel + Sales CRM (47+ Features)

All 37 Pro features PLUS:

**Omnichannel (Phase 6-9):**
38. WhatsApp Cloud API integration
39. WhatsApp AI auto-reply
40. Facebook Messenger integration
41. Messenger AI auto-reply
42. Unified inbox (all channels)

**Advanced CRM & Sales:**
43. Deal/pipeline tracking (Kanban board)
44. Automation rules (if-then triggers)
45. Built-in meeting scheduler (Google/Outlook sync)
46. AI analytics dashboard
47. Omnichannel reports
48. White-label option
49. Priority support

---

### Key Competitor Reference Links

- [HubSpot Free CRM + Live Chat](https://www.hubspot.com/products/crm)
- [Intercom Features & Pricing](https://www.capterra.com/p/134347/Intercom/)
- [Tidio Features & Review](https://www.capterra.com/p/144040/Tidio-Chat/)
- [Crisp CRM & Contact Management](https://crisp.chat/en/crm/)
- [Drift/Salesloft Conversational AI](https://www.salesloft.com/platform/drift)
- [Chatwoot Features (Open Source)](https://www.chatwoot.com/features)
- [Chatwoot CSAT Reports](https://www.chatwoot.com/features/csat-reports/)
- [LiveChat CRM Integrations](https://www.livechat.com/marketplace/apps/crm/)
- [Best Live Chat Software 2026](https://thecxlead.com/tools/best-live-chat-software/)
- [CRM + Live Chat Comparison](https://www.getapp.com/customer-management-software/crm/f/chat/)
