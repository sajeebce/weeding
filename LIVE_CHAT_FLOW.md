# Live Chat Flow - Complete Implementation Plan

## Overview

Live chat widget with **3 lead collection methods** depending on context:

| Context | Lead Collection Method |
|---------|----------------------|
| **Agent Online** | Agent-triggered: agent clicks "Collect Info" button → visitor sees inline form |
| **Agent Offline** | Pre-chat form: visitor fills name/email/phone before first message |
| **AI Enabled** | Conversational: AI naturally asks for name/email during chat |

Core principles:
- **Agent online = Chat First** - no barriers, agent decides when to ask for info
- **Agent offline = Form First** - collect lead info upfront since no one will respond live
- **AI = Smart Collection** - AI extracts lead info from natural conversation

---

## Flow Scenarios

### Scenario A: Agent Online (No AI)

```
1. Visitor opens widget
   -> Chat input visible immediately (no form, no barriers)
   -> Welcome message: "Hi! How can we help you today?"

2. Visitor types first message and sends
   -> Message appears as visitor bubble (right-aligned, primary color)
   -> State: CONNECTING
   -> System message: "Connecting you with a team member..."
   -> "We typically reply within a few minutes"

3. Agent accepts the chat
   -> System message: "Rahim joined the chat"
   -> State: ACTIVE_CHAT
   -> Two-way real-time messaging begins

4. Agent clicks "Collect Info" button (in admin dashboard)
   -> Server emits `chat:collect_info` to visitor's socket
   -> Visitor sees inline Lead Collection Form in chat timeline:
      ┌─────────────────────────────────────┐
      │  📋 Share your details              │
      │                                     │
      │  Name     [________________]        │
      │  Email *  [________________]        │
      │  Phone    [________________]        │
      │                                     │
      │          [Submit]   Skip            │
      └─────────────────────────────────────┘
   -> Form is NON-BLOCKING: visitor can still type messages below it
   -> Form scrolls up as new messages come in (stays in timeline)

5. Visitor fills form and submits
   -> Data saved to SupportTicket (guestName, guestEmail, guestPhone)
   -> Form transforms to confirmation: "✓ Thanks, Rahim! Info saved."
   -> Agent dashboard updates: visitor name, email, phone shown in header
   -> Server emits `chat:info_collected` to agent

6. Chat ends
   -> System message: "Chat ended"
   -> "Start a new conversation" link
```

### Scenario B: No Agent Available (No AI)

```
1. Visitor opens widget
   -> Widget checks agents:status on connect
   -> No agents online → show OFFLINE state with pre-chat form

2. Widget shows pre-chat lead form (BEFORE any messaging):
   ┌─────────────────────────────────────┐
   │  💬 Leave us a message              │
   │                                     │
   │  Our team is currently offline.     │
   │  Fill in your details and we'll     │
   │  get back to you.                   │
   │                                     │
   │  Name     [________________]        │
   │  Email *  [________________]        │
   │  Phone    [________________]        │
   │  Message *[________________]        │
   │           [________________]        │
   │                                     │
   │          [Send Message]             │
   └─────────────────────────────────────┘
   -> Email and Message are required fields
   -> Name and Phone are optional

3. Visitor submits form
   -> Ticket created with guestName, guestEmail, guestPhone
   -> First message saved as SupportMessage
   -> State: OFFLINE_REPLY
   -> Confirmation: "Thanks! We'll get back to you at your@email.com"
   -> "Your messages are saved. We'll respond as soon as we're back."
   -> Chat input becomes visible — visitor can send additional messages

4. Visitor sends more messages (optional)
   -> Messages appended to same ticket as SupportMessage
   -> Each message appears in chat timeline

5. Agent comes online later
   -> Agent sees ticket with all info + messages in admin dashboard
   -> Agent can respond via ticket system (email notification to visitor)
```

### Scenario C: AI Enabled + Agent Online

```
1. Visitor opens widget
   -> Chat input visible immediately (same as Scenario A)
   -> Welcome message shown

2. Visitor types first message and sends
   -> Message appears as visitor bubble
   -> State: AI_CHAT
   -> AI typing indicator: "AI Assistant is thinking..."
   -> AI responds (left-aligned, white card with subtle shadow)
   -> Below AI message: small "AI Assistant" label

3. AI conversationally collects lead info
   -> After 2-3 exchanges, AI naturally asks:
      "By the way, could I get your name and email?
       That way our team can follow up if needed."
   -> AI extracts name/email/phone from visitor's response
   -> Data saved to ticket (via chat:lead_update event)
   -> No inline form needed — AI handles it conversationally

4. AI continues conversation OR hands off to agent
   -> If AI can answer: conversation continues
   -> If AI cannot answer:
      -> AI: "Let me connect you with a team member who can help better."
      -> State: AI_HANDOFF → CONNECTING
      -> Agent accepts → ACTIVE_CHAT
      -> Agent sees FULL history (AI + visitor messages + collected info)

5. During ACTIVE_CHAT, agent can still trigger "Collect Info" form
   -> If AI didn't collect all info, agent can request remaining fields
   -> Form pre-fills any data AI already collected
```

### Scenario D: AI Enabled + No Agent Available

```
1. Visitor opens widget
   -> AI is available even when agents are offline
   -> Chat input visible immediately

2. Visitor types first message
   -> AI responds instantly
   -> AI conversationally collects lead info (same as Scenario C)

3. AI handles conversation
   -> If AI can answer: conversation continues
   -> If AI cannot answer:
      -> AI: "I'm not able to help with that. Let me save your info
         so a team member can follow up."
      -> If lead info NOT yet collected:
         -> AI asks: "Could you share your email so we can get back to you?"
      -> State: OFFLINE_REPLY
      -> System card: "Our team will follow up soon."
      -> If email collected: "We'll notify you at your@email.com"
      -> Visitor can still send more messages (saved to ticket)
```

---

## Widget State Machine

```
States:
  IDLE            -> Chat input + welcome message (agents online)
  OFFLINE_FORM    -> Pre-chat lead form (agents offline, no AI)
  CONNECTING      -> Finding agent (dots animation)
  ACTIVE_CHAT     -> Live two-way chat with agent
  AI_CHAT         -> AI is responding
  AI_HANDOFF      -> AI transferring to agent (brief connecting state)
  OFFLINE_REPLY   -> Async messaging (after form submit or AI handoff)
  ENDED           -> Chat session ended

Transitions:
  IDLE            -> CONNECTING       (visitor sends first message, AI disabled)
  IDLE            -> AI_CHAT          (visitor sends first message, AI enabled)
  OFFLINE_FORM    -> OFFLINE_REPLY    (visitor submits form + message)
  CONNECTING      -> ACTIVE_CHAT      (agent accepts)
  CONNECTING      -> OFFLINE_REPLY    (no agent available after timeout)
  AI_CHAT         -> AI_HANDOFF       (AI can't resolve, agent available)
  AI_CHAT         -> OFFLINE_REPLY    (AI can't resolve, no agent)
  AI_HANDOFF      -> ACTIVE_CHAT      (agent accepts handoff)
  AI_HANDOFF      -> OFFLINE_REPLY    (no agent after timeout)
  ACTIVE_CHAT     -> ENDED            (agent or visitor ends chat)
  OFFLINE_REPLY   -> ACTIVE_CHAT      (agent comes online and accepts)
  ENDED           -> IDLE             (visitor clicks "Start new conversation")

  // Agent status change (can happen anytime):
  IDLE            -> OFFLINE_FORM     (agents go offline while widget is open)
  OFFLINE_FORM    -> IDLE             (agents come online while filling form)
```

---

## Lead Collection Methods Detail

### Method 1: Agent-Triggered Form (ACTIVE_CHAT)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Agent clicks "Collect Info" button in admin dashboard |
| **Socket event** | Server → Visitor: `chat:collect_info` |
| **Fields** | Name (optional), Email (required), Phone (optional) |
| **UI** | Inline card in chat timeline, NOT a modal/overlay |
| **Blocking?** | No — visitor can still type messages while form is visible |
| **Skip** | Yes, "Skip" link below form |
| **After submit** | Form → confirmation card, data sent via `chat:lead_update` |
| **Re-trigger** | Agent can trigger again if visitor skipped (but only once more) |

### Method 2: Pre-Chat Form (OFFLINE_FORM)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Widget detects no agents online AND no AI enabled |
| **Fields** | Name (optional), Email (required), Phone (optional), Message (required) |
| **UI** | Full widget body replaced with form (no chat input visible yet) |
| **Blocking?** | Yes — must fill email + message to proceed |
| **Skip** | No skip — email is mandatory for offline |
| **After submit** | Ticket created, state → OFFLINE_REPLY, chat input becomes visible |

### Method 3: AI Conversational (AI_CHAT)

| Aspect | Detail |
|--------|--------|
| **Trigger** | AI decides when to ask (typically after 2-3 exchanges) |
| **Fields** | AI extracts name, email, phone from natural language |
| **UI** | No form — just conversation messages |
| **Blocking?** | No |
| **Skip** | Visitor can simply not provide info, AI won't insist |
| **After collection** | Data saved via `chat:lead_update`, agent dashboard updates |
| **Validation** | Server-side email regex validation before saving |

---

## Corner Cases & Edge Cases

### Agent-Triggered Form

| Corner Case | Handling |
|-------------|----------|
| Agent triggers form, visitor ignores it | Form stays in timeline, scrolls up naturally. No re-prompt. Agent can trigger once more after 5 minutes. |
| Visitor fills only name (not email) | Client-side validation — email field shows red border. Submit disabled until email is valid. |
| Agent triggers form while visitor is typing | Form appears above the typing area. Visitor's in-progress message is NOT lost. |
| Multiple agents watching same chat | Only the assigned agent sees the "Collect Info" button. Prevents duplicate form triggers. |
| Agent triggers form, then chat disconnects | Form state persisted in localStorage (session persistence). On reconnect, form is restored if not yet submitted. |
| Visitor submits form with existing email | Update ticket — don't create duplicate. If email already collected (by AI), show pre-filled form with confirmation. |
| Agent triggers form on already-collected lead | Form shows pre-filled with existing data. Agent sees "(already collected)" indicator. |

### Offline Pre-Chat Form

| Corner Case | Handling |
|-------------|----------|
| Visitor opens form, agent comes online | Widget detects `agents:status` change → show subtle banner: "An agent is now available! [Chat live instead]". Clicking switches to IDLE state (chat input). Form data preserved. |
| Visitor fills form but closes widget | Draft NOT saved (privacy). Visitor starts fresh next time. |
| Visitor fills form, submits, but network fails | Show error: "Couldn't send. Please try again." Keep form filled. Retry button. |
| Bot/spam submits form | Rate limit: max 3 form submissions per IP per hour. Basic honeypot field. |
| Visitor submits form, then agent accepts the ticket | State transitions from OFFLINE_REPLY → ACTIVE_CHAT. Visitor sees "Agent joined" message. Live chat begins. |
| Very long message in form | Textarea max 2000 chars. Character counter shown at 1500+. |

### AI Conversational Collection

| Corner Case | Handling |
|-------------|----------|
| AI extracts wrong email from conversation | Server-side regex validation. If invalid, AI asks again: "That doesn't look like a valid email. Could you double-check?" |
| Visitor provides email in message but not to AI's prompt | AI should detect email patterns in ANY message (regex scan on server). Auto-extract and confirm: "I noticed your email is X — is that correct?" |
| AI asks for email, visitor says "no" or "I don't want to share" | AI respects it, moves on. Sets `emailDeclined: true` on session. Won't ask again. |
| AI collects name but visitor provides fake data | No way to validate name. Accept as-is. Email validated by format. |
| AI handoff to agent, but AI only collected email (no name) | Agent sees partial data. Agent can trigger form for remaining fields (name pre-filled if available, email pre-filled). |
| Visitor gives phone number in text (e.g., "call me at 01712345678") | AI extracts phone using pattern matching. Confirms with visitor before saving. |

### General Edge Cases

| Corner Case | Handling |
|-------------|----------|
| Visitor provides lead info, then wants to change it | Agent can re-trigger form (shows current values, visitor edits). Or visitor says "my email is actually X" → AI/agent updates. |
| Session expires (24h) — lead info lost? | Lead info is on the SupportTicket in DB, NOT just in session. Always persisted. |
| Multiple tabs open with same chat | Session linked by localStorage key. Both tabs show same state. Second tab shows "Chat active in another tab" if same session. |
| Widget embedded on third-party domain | `chat:collect_info` works cross-domain since it goes through Socket.io. No CORS issues for the form itself (it's rendered client-side). |
| Visitor has adblocker blocking socket | Widget shows "Unable to connect. Please disable your adblocker or email us at support@example.com" with direct email link. |
| Agent online → accepts → goes offline mid-chat | Chat continues (agent still in room). If agent's browser closes, visitor sees "Agent disconnected" typing indicator. Chat doesn't auto-end — ticket stays open. |
| Visitor on OFFLINE_FORM, AI becomes available | If `aiChatEnabled` just turned on, widget doesn't auto-switch. Only checks on fresh widget open. Prevents form data loss. |
| Same visitor starts multiple chats (different tabs/devices) | Each creates a new ticket. No cross-device session linking (would need user accounts). |
| Offline form submitted with same email as existing customer | Server checks `User` table — if email matches, link ticket to `customerId` instead of `guestEmail`. Visitor becomes "known customer". |

---

## Socket Events (New/Modified)

### New Events

```typescript
// Agent triggers lead collection form on visitor's widget
COLLECT_INFO: "chat:collect_info"
// Server → Visitor socket
// Payload: { sessionId: string, fields: string[] }
// fields: ["name", "email", "phone"] — configurable per trigger

// Visitor submits lead info (from form or AI extraction)
LEAD_UPDATE: "chat:lead_update"
// Visitor/Server → Server/Agents
// Payload: {
//   sessionId: string,
//   name?: string,
//   email?: string,
//   phone?: string,
//   source: "form" | "ai" | "agent_request"
// }

// Server confirms lead info saved
INFO_COLLECTED: "chat:info_collected"
// Server → Agent socket (in chat room)
// Payload: {
//   sessionId: string,
//   name?: string,
//   email?: string,
//   phone?: string,
// }
```

### Existing Events (No Change)

```
chat:request, chat:accept, chat:message, chat:typing,
chat:end, chat:email_update, chat:agent_timeout,
agents:status, chat:rejoin, chat:queue_update
```

### Deprecated (Remove)

```
// Old auto-appearing email card behavior — replaced by 3 methods above
// emailCollectionMode setting no longer needed
// showEmailCard state no longer needed
```

---

## Implementation Details

### 1. Chat Widget (`livesupport-chat-widget.tsx`)

#### State Changes

```typescript
type WidgetState =
  | 'IDLE'           // Chat input + welcome (agents online)
  | 'OFFLINE_FORM'   // Pre-chat lead form (agents offline, no AI)
  | 'CONNECTING'     // Finding agent
  | 'ACTIVE_CHAT'    // Live chat with agent
  | 'AI_CHAT'        // AI responding
  | 'AI_HANDOFF'     // AI transferring to agent
  | 'OFFLINE_REPLY'  // Async messaging (post-form or post-AI)
  | 'ENDED';         // Chat ended

// Lead info state
const [leadInfo, setLeadInfo] = useState<{
  name?: string;
  email?: string;
  phone?: string;
  collected: boolean;
}>({ collected: false });

// Agent-triggered form state
const [showLeadForm, setShowLeadForm] = useState(false);
const [leadFormInTimeline, setLeadFormInTimeline] = useState(false);

// REMOVE these old states:
// emailCollected, emailSkipped, showEmailCard
// emailCollectionMode
```

#### New Components

**A. Lead Collection Form (Inline in Chat Timeline)**
```
Full-width card in message timeline
Background: white
Border: 1px solid gray-200, rounded-xl (12px)
Shadow: 0 1px 3px rgba(0,0,0,0.06)
Padding: 16px

Contents:
  - Header: "📋 Share your details" (14px, font-semibold)
  - Name input (optional, h-10, rounded-lg)
  - Email input (required, h-10, rounded-lg)
  - Phone input (optional, h-10, rounded-lg, placeholder: "Optional")
  - Submit button (primary, full-width, h-10)
  - Skip link: "Skip" (12px, gray-400)

After submit:
  - Card transforms to: "✓ Thanks, [Name]! Info saved." (green-600)
  - Compact single line, not full form height
```

**B. Offline Pre-Chat Form (Full Widget Body)**
```
Replaces entire chat area when agents offline + no AI
Background: white
Padding: 24px

Contents:
  - Icon: MessageCircle (24px, primary color)
  - Title: "Leave us a message" (18px, font-semibold)
  - Subtitle: "Our team is offline. We'll get back to you soon." (14px, gray-500)
  - Divider (16px margin)
  - Name input (optional, label above)
  - Email input (required, label above, red asterisk)
  - Phone input (optional, label above)
  - Message textarea (required, label above, min 3 rows)
  - Submit button (primary, full-width): "Send Message"

Validation:
  - Email: required, format check
  - Message: required, min 1 char
  - Phone: optional, basic format (digits, +, -, spaces)
```

**C. System/Status Components (unchanged)**
- SystemMessage, OfflineCard, ConnectingAnimation — same as before

### 2. Admin Dashboard (`live-chat-client.tsx`)

#### Add "Collect Info" Button

```
Location: Chat header (next to "Ticket" and "..." buttons)
Visible: Only during ACTIVE_CHAT, only for assigned agent
Button: outline variant, icon UserPlus or ClipboardList

States:
  - Default: "Collect Info" button
  - After clicking: "Info Requested" (disabled, muted)
  - After visitor submits: "Info Collected ✓" (green, disabled)
  - Re-enable after 5 minutes if visitor skipped
```

#### Show Collected Lead Info

```
Location: Chat header, below visitor name
Display: email and phone as small text
  "visitor@email.com · +1-234-567-8900"
Update: real-time via chat:info_collected event
```

### 3. Socket Server (`server.ts`)

#### New Handler: `chat:collect_info`

```typescript
// Agent requests lead form on visitor's widget
socket.on("chat:collect_info", (data: { sessionId: string }) => {
  if (!socket.user?.isAgent) return;
  const session = chatSessions.get(data.sessionId);
  if (!session || session.status !== "ACTIVE") return;

  // Emit to visitor's socket only
  io.to(session.visitorSocketId).emit("chat:collect_info", {
    sessionId: data.sessionId,
  });
});
```

#### New Handler: `chat:lead_update`

```typescript
// Visitor submits lead info (from form or AI extraction)
socket.on("chat:lead_update", async (data: {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  source: "form" | "ai" | "agent_request";
}) => {
  const session = chatSessions.get(data.sessionId);
  if (!session) return;

  // Validate email
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return;

  // Update in-memory session
  if (data.name) session.visitorName = data.name;
  if (data.email) session.visitorEmail = data.email;

  // Persist to database
  if (db && session.ticketId) {
    await db.supportTicket.update({
      where: { id: session.ticketId },
      data: {
        guestName: data.name || undefined,
        guestEmail: data.email || undefined,
        guestPhone: data.phone || undefined,
      },
    });
  }

  // Notify agents
  io.to("agents").emit("chat:info_collected", {
    sessionId: data.sessionId,
    name: data.name,
    email: data.email,
    phone: data.phone,
  });

  // Update queue for sidebar
  io.to("agents").emit("chat:queue_update", {
    type: "lead_updated",
    sessionId: data.sessionId,
    name: data.name,
    email: data.email,
    phone: data.phone,
  });
});
```

### 4. Database Schema

**No schema changes needed.** Existing fields:
- `SupportTicket.guestName` — visitor name
- `SupportTicket.guestEmail` — visitor email
- `SupportTicket.guestPhone` — visitor phone

### 5. Admin Settings (`settings-client.tsx`)

```typescript
// Chat tab settings:
chatOfflineFormEnabled: boolean;         // Show pre-chat form when offline (default: true)
chatOfflineFormMessage: string;          // "Our team is offline. We'll get back to you soon."
chatAgentTimeoutSeconds: number;         // 15 (default)
chatConnectingMessage: string;           // "Connecting you with a team member..."
chatReplyTimeMessage: string;            // "We typically reply within a few minutes"

// AI tab settings (future):
aiChatEnabled: boolean;                  // Enable AI in live chat
aiLeadCollectionEnabled: boolean;        // AI should try to collect lead info
aiLeadCollectionPrompt: string;          // Custom prompt for AI lead collection
```

### 6. Chat Config API (`/api/chat/config`)

```typescript
{
  enabled: true,
  socketUrl: "http://localhost:3001",
  position: "bottom-right",
  primaryColor: "#2563eb",
  welcomeMessage: "Hi! How can we help you today?",

  // Offline form:
  offlineFormEnabled: true,
  offlineFormMessage: "Our team is offline. We'll get back to you soon.",

  // Timing:
  agentTimeoutSeconds: 15,
  connectingMessage: "Connecting you with a team member...",
  replyTimeMessage: "We typically reply within a few minutes",

  // AI (future):
  aiChatEnabled: false,
  aiLeadCollectionEnabled: false,
}
```

---

## Implementation Checklist

### Phase 1: Socket Server Changes
- [ ] Add `chat:collect_info` event handler (agent → visitor)
- [ ] Add `chat:lead_update` event handler (visitor → server → agents)
- [ ] Add `chat:info_collected` emission to agents
- [ ] Add `lead_updated` type to `chat:queue_update`
- [x] `agents:status` broadcast — already implemented
- [x] `chat:email_update` handler — already implemented (keep as fallback)
- [x] Agent timeout logic — already implemented
- [x] `chat:request` returns `agentsOnline` — already implemented

### Phase 2: Chat Widget Changes
- [ ] Add `OFFLINE_FORM` state to WidgetState
- [ ] Build OfflinePreChatForm component (name/email/phone/message)
- [ ] Build LeadCollectionForm component (inline in chat timeline)
- [ ] Listen for `chat:collect_info` event → show inline form
- [ ] Handle form submit → emit `chat:lead_update`
- [ ] Handle form skip → hide form, allow re-trigger
- [ ] IDLE → OFFLINE_FORM transition when agents go offline
- [ ] OFFLINE_FORM → IDLE transition when agents come online
- [ ] Remove old email card auto-show logic (2s timer)
- [ ] Remove `emailCollectionMode` config dependency
- [ ] Update session persistence to include lead info state

### Phase 3: Admin Dashboard Changes
- [ ] Add "Collect Info" button to chat header
- [ ] Handle button states (default → requested → collected)
- [ ] Listen for `chat:info_collected` → update header with lead info
- [ ] Listen for `lead_updated` queue event → update session sidebar
- [ ] Show lead info (name/email/phone) in chat header when available

### Phase 4: Admin Settings
- [ ] Add offlineFormEnabled toggle
- [ ] Add offlineFormMessage input
- [ ] Add agentTimeoutSeconds input
- [ ] Wire settings to API (save/load from PluginSetting)

### Phase 5: AI Lead Collection (Future)
- [ ] AI prompt engineering for conversational lead collection
- [ ] Server-side email/phone extraction from AI messages
- [ ] AI → `chat:lead_update` with source: "ai"
- [ ] AI respects "no" — sets emailDeclined flag

### Phase 6: Testing
- [ ] Test Scenario A: Agent online → chat → agent triggers form → visitor fills → data saved
- [ ] Test Scenario A: Agent triggers form → visitor skips → agent re-triggers after 5min
- [ ] Test Scenario B: No agent → offline form shown → visitor submits → ticket created
- [ ] Test Scenario B: Filling form when agent comes online → banner + switch option
- [ ] Test Scenario B: Visitor submits form → sends more messages → all saved
- [ ] Test reconnection: visitor refreshes mid-chat → form state preserved
- [ ] Test validation: invalid email blocked, valid email saved
- [ ] Test admin dashboard: lead info appears in real-time
- [ ] Mobile responsive: offline form works on 375px width
- [ ] Keyboard: Tab through form fields, Enter to submit

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/plugins/livesupport-chat-widget.tsx` | **MODIFY** | Add OFFLINE_FORM state, LeadCollectionForm, remove old email card |
| `src/lib/support/socket/server.ts` | **MODIFY** | Add collect_info, lead_update handlers |
| `src/app/admin/tickets/chat/live-chat-client.tsx` | **MODIFY** | Add "Collect Info" button, show lead info |
| `src/app/admin/tickets/settings/settings-client.tsx` | **MODIFY** | Add offline form settings |
| `src/app/api/chat/config/route.ts` | **MODIFY** | Add offline form config fields |
| `chat-server.ts` | **NO CHANGE** | Already works as standalone server |
| `prisma/schema.prisma` | **NO CHANGE** | Already has guestName/guestEmail/guestPhone |

---

## Standalone App Compatibility (livesupport-pro)

All changes must work in both LLCPad and the standalone livesupport-pro app:

1. **Chat widget** is self-contained — fetches config from `/api/chat/config`
2. **Socket server** is standalone (`chat-server.ts`) — no Next.js dependency
3. **Admin settings** stored in `PluginSetting` table — portable
4. **No hardcoded values** — all messages/timeouts from config
5. **Widget config endpoint** returns everything widget needs
6. **All new socket events** defined in both CMS and livesupport-pro core package

---

## Design Reference

- **Conversation background**: White (#FFFFFF)
- **Message bubbles**: 16px border-radius, 4px on tail corner
- **System messages**: 13px, gray-500, centered, no bubble
- **Lead form (inline)**: white bg, gray-200 border, 12px radius, subtle shadow
- **Offline form**: white bg, centered content, 24px padding
- **Font sizes**: 14px body, 13px system/secondary, 11px labels
- **Connecting dots**: 8px, primary color at 60%, bounce staggered 0/160/320ms
- **Transitions**: 200ms messages, 300ms window open/close
- **Form inputs**: h-10 (40px), rounded-lg (8px), gray-300 border, focus:primary border
- **Submit button**: primary color, h-10, rounded-lg, full-width in offline form
