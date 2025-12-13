# 🎯 Live Support & Ticketing System - Complete Specification

## 📋 Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [UI/UX Design](#uiux-design)
5. [Live Chat Widget](#live-chat-widget)
6. [Admin Dashboard](#admin-dashboard)
7. [Notification System](#notification-system)
8. [Email Integration](#email-integration)
9. [Settings & Configuration](#settings--configuration)
10. [Database Schema](#database-schema)
11. [API Endpoints](#api-endpoints)
12. [Implementation Phases](#implementation-phases)
13. [CodeCanyon Product Specs](#codecanyon-product-specs)

---

## 🎯 Overview

A modern, real-time customer support system combining:
- **Live Chat Widget** (public website)
- **Support Ticket System** (admin dashboard)
- **Real-time Notifications** (WebSocket/Pusher)
- **Email Notifications** (automated)
- **Chat-to-Email Transcripts** (automatic summaries)

**Design Philosophy**: Messenger + Intercom style - professional yet friendly and modern.

---

## ✨ Core Features

### Customer-Facing Features:
1. ✅ Floating chat widget on all pages
2. ✅ Start chat without login (guest chat)
3. ✅ Continue chat after login (persistent history)
4. ✅ Upload images & documents
5. ✅ Emoji support
6. ✅ Typing indicators
7. ✅ Read receipts
8. ✅ Message formatting (bold, italic, code, links)
9. ✅ File drag & drop
10. ✅ Mobile responsive
11. ✅ Email summary after chat ends
12. ✅ Offline message form (when no agent online)

### Admin Features:
13. ✅ Modern chat interface (like Messenger)
14. ✅ Real-time message updates
15. ✅ Desktop notifications
16. ✅ Sound alerts
17. ✅ Canned responses
18. ✅ Internal notes
19. ✅ Assign tickets to agents
20. ✅ Multi-agent support
21. ✅ Chat history search
22. ✅ Customer information sidebar
23. ✅ Previous tickets view
24. ✅ Rich text formatting toolbar
25. ✅ Quick emoji picker
26. ✅ Bulk actions

---

## 🏗️ Technical Architecture

### Frontend Stack:
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Real-time**: Pusher (or Socket.io alternative)
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

### Backend Stack:
- **API**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **File Storage**: Local uploads (configurable to S3/R2)
- **Email**: Resend API
- **Queue**: Background jobs for email sending

### Real-time Communication:
```
Customer Chat Widget ←→ Pusher ←→ Admin Dashboard
         ↓                           ↓
    PostgreSQL Database ←→ Email Service
```

---

## 🎨 UI/UX Design

### 1. Ticket Detail Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Tickets    [Ticket #TKT-001]    [Status ▼] [Resolve] │
├─────────────────────────────────────────┬───────────────────────┤
│                                         │                       │
│  CONVERSATION AREA (Scrollable)         │  SIDEBAR (Fixed)      │
│                                         │                       │
│  ┌──────────────────────────────────┐  │  ┌─────────────────┐  │
│  │  [Customer Avatar]               │  │  │ 👤 Customer     │  │
│  │  Message bubble (left)           │  │  │  John Doe       │  │
│  │  "Hello, I need help..."         │  │  │  john@email.com │  │
│  │  10:30 AM ✓✓                     │  │  └─────────────────┘  │
│  └──────────────────────────────────┘  │                       │
│                                         │  ┌─────────────────┐  │
│         ┌──────────────────────────┐   │  │ 📋 Details      │  │
│         │  [Staff Avatar]          │   │  │  Status: Open   │  │
│         │  Message bubble (right)  │   │  │  Priority: High │  │
│         │  "Sure, let me help..."  │   │  │  Assigned: Me   │  │
│         │  10:32 AM ✓✓ Read        │   │  └─────────────────┘  │
│         └──────────────────────────┘   │                       │
│                                         │  ┌─────────────────┐  │
│  [Date: Today]                          │  │ 📦 Order        │  │
│                                         │  │  #LLC-123       │  │
│  ┌──────────────────────────────────┐  │  └─────────────────┘  │
│  │  [Customer Avatar]               │  │                       │
│  │  Message with image              │  │  ┌─────────────────┐  │
│  │  [Image Preview]                 │  │  │ 🕐 Previous     │  │
│  │  11:15 AM ✓                      │  │  │  TKT-000        │  │
│  └──────────────────────────────────┘  │  │  Resolved       │  │
│                                         │  └─────────────────┘  │
│         ┌──────────────────────────┐   │                       │
│         │  [Staff typing...]       │   │  ┌─────────────────┐  │
│         └──────────────────────────┘   │  │ 📝 Internal     │  │
│                                         │  │  [Collapsed]    │  │
│  ┌───────────────────────────────────┐ │  └─────────────────┘  │
│  │ ↓ Scroll to Bottom (2 new)       │ │                       │
│  └───────────────────────────────────┘ │                       │
├─────────────────────────────────────────┤                       │
│  INPUT BOX (Fixed at Bottom)            │                       │
│  ┌──────────────────────────────────┐  │                       │
│  │ [📎] [😊] Type message... [🎤][➤]│  │                       │
│  │                                  │  │                       │
│  │ [B] [I] [Code] [Link]  [Canned▼]│  │                       │
│  └──────────────────────────────────┘  │                       │
└─────────────────────────────────────────┴───────────────────────┘
```

### 2. Message Bubble Design

#### Customer Message (Left-aligned):
```css
Background: #F3F4F6 (light gray)
Border-radius: 18px 18px 18px 4px (tail effect)
Box-shadow: 0 1px 2px rgba(0,0,0,0.08)
Max-width: 70%
Padding: 12px 16px
Font-size: 14px
Line-height: 1.5
```

#### Staff Message (Right-aligned):
```css
Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Color: white
Border-radius: 18px 18px 4px 18px (tail effect)
Box-shadow: 0 2px 4px rgba(102,126,234,0.25)
Max-width: 70%
Padding: 12px 16px
Font-size: 14px
Line-height: 1.5
```

#### System Message (Centered):
```css
Background: #FEF3C7 (light yellow)
Border-radius: 12px
Text-align: center
Font-size: 13px
Color: #78350F
Padding: 8px 16px
```

### 3. Text Formatting Toolbar

```
┌────────────────────────────────────────────────────┐
│ [B] [I] [U] [S] [</>] [🔗] [📋]      [💬 Canned ▼] │
└────────────────────────────────────────────────────┘
  │   │   │   │    │     │     │              │
  │   │   │   │    │     │     │              └─ Quick responses
  │   │   │   │    │     │     └─ Code block
  │   │   │   │    │     └─ Insert link
  │   │   │   │    └─ Code inline
  │   │   │   └─ Strikethrough
  │   │   └─ Underline
  │   └─ Italic
  └─ Bold

Keyboard Shortcuts:
Ctrl+B = Bold
Ctrl+I = Italic
Ctrl+U = Underline
Ctrl+K = Link
Ctrl+` = Code
```

### 4. Attachment Display

#### Image Attachment:
```
┌─────────────────────────┐
│                         │
│   [Image Preview]       │
│   Max 300px width       │
│                         │
│   filename.jpg          │
│   234 KB                │
└─────────────────────────┘
```

#### Document Attachment:
```
┌───────────────────────────────┐
│ 📄  contract.pdf         ⬇️   │
│     523 KB                     │
└───────────────────────────────┘
```

#### Audio Message:
```
┌────────────────────────────────┐
│ 🎤 ▶️ ●●●●●●●●●○○○○  0:42/1:23 │
│                          1.5x  │
└────────────────────────────────┘
```

---

## 💬 Live Chat Widget

### Widget Appearance (Closed):
```
                    ┌──────────┐
                    │  💬  1   │  ← Badge for unread
                    │          │
                    │   Chat   │
                    └──────────┘
                  Floating button
                  Bottom-right corner
                  60px × 60px
                  Primary color gradient
                  Pulse animation when new message
```

### Widget Appearance (Open):
```
┌─────────────────────────────────┐
│ 💼 LLCPad Support        ─  ✕  │
│ ⚫ We're online - ask us!       │
├─────────────────────────────────┤
│                                 │
│  [Agent Avatar]                 │
│  👋 Hi! How can we help?        │
│  Just now                       │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│  [Typing indicator...]          │
│                                 │
├─────────────────────────────────┤
│ [😊] Type your message... [➤]  │
│                                 │
│ 📎 Powered by LLCPad Support    │
└─────────────────────────────────┘
  380px × 600px
  Bottom-right: 24px from edges
  z-index: 9999
  Box-shadow: 0 8px 24px rgba(0,0,0,0.15)
  Border-radius: 16px
```

### Widget States:

1. **Online (Agent Available)**:
   - Green dot indicator
   - "We're online - ask us!"
   - Chat enabled

2. **Away (Agent Inactive)**:
   - Yellow dot indicator
   - "We typically reply in a few hours"
   - Chat enabled, email notification sent

3. **Offline (No Agent)**:
   - Red dot indicator
   - "We're offline - leave a message"
   - Shows contact form instead
   - Email sent to support team

### Pre-chat Form (For Guests):
```
┌─────────────────────────────────┐
│ Start a Conversation            │
├─────────────────────────────────┤
│                                 │
│  Name:                          │
│  [____________]                 │
│                                 │
│  Email:                         │
│  [____________]                 │
│                                 │
│  How can we help?               │
│  [________________________]     │
│  [________________________]     │
│  [________________________]     │
│                                 │
│  [Start Chat →]                 │
│                                 │
└─────────────────────────────────┘
```

### Widget Features:
- ✅ Minimize/maximize animation
- ✅ Unread message badge
- ✅ Sound notification
- ✅ Browser notification (with permission)
- ✅ Typing indicator
- ✅ Read receipts
- ✅ Message history (stored in localStorage for guests)
- ✅ Auto-expand on new message
- ✅ Emoji picker
- ✅ File upload (image + documents)
- ✅ Mobile responsive (full-screen on mobile)

---

## 🎛️ Admin Dashboard

### Ticket List Page (`/admin/tickets`):

```
┌──────────────────────────────────────────────────────────────┐
│  Support Tickets                    [+ New Ticket] [Settings]│
├──────────────────────────────────────────────────────────────┤
│  [All] [Open] [In Progress] [Waiting] [Resolved] [Closed]   │
│                                                               │
│  🔍 Search tickets...                    [Filter ▼] [Sort ▼] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ✓ [🔴] TKT-003  Question about EIN      John Doe  2m ago    │
│                  High priority · Open                         │
│                                                               │
│  ✓ [🟡] TKT-002  Document upload help    Jane Smith  1h ago  │
│                  Medium · In Progress                         │
│                                                               │
│  ✓ [🟢] TKT-001  Order status inquiry    Bob Lee  5h ago     │
│                  Low · Waiting · Assigned to: Support         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Chat Interface Features:

1. **Fixed Sidebar (Right - 360px)**:
   - Sticky position
   - Independent scroll
   - Collapsible sections
   - Always visible

2. **Scrollable Chat (Left - Flexible)**:
   - Virtual scrolling for 100+ messages
   - Infinite scroll up (load older messages)
   - Scroll to bottom button
   - Auto-scroll on new message (if at bottom)
   - Sticky date separators

3. **Input Box (Bottom - Fixed)**:
   - Auto-expanding textarea (1-5 lines)
   - Stays visible while scrolling
   - Draft auto-save every 2 seconds
   - Attachment preview before send

---

## 🔔 Notification System

### Real-time Notifications (Admin):

#### 1. Browser Notifications:
```javascript
// When admin is on different page
if (Notification.permission === "granted") {
  new Notification("New Message from John Doe", {
    body: "Hello, I need help with...",
    icon: "/logo.png",
    badge: "/badge.png",
    tag: "ticket-TKT-001",
    requireInteraction: true,
    actions: [
      { action: "view", title: "View Ticket" },
      { action: "close", title: "Dismiss" }
    ]
  });
}
```

#### 2. In-App Notifications:
```
┌────────────────────────────────┐
│ 🔔 New message in TKT-003      │
│    "Can you help me with..."   │
│    John Doe · Just now         │
│                      [View →]  │
└────────────────────────────────┘
  Toast notification
  Bottom-right corner
  Auto-dismiss: 5 seconds
  Click to navigate to ticket
```

#### 3. Sound Alerts:
- **New chat started**: Soft chime sound
- **New message**: Gentle notification sound
- **Mention**: Distinct ping sound
- **Urgent ticket**: Alert sound

#### 4. Badge Counter:
```
Support Tickets (3)
     ↑
  Unread count
  Red badge on sidebar
  Updates in real-time
```

### Email Notifications (Admin):

#### When Admin is Offline:
```
Subject: 🔔 New Support Message from John Doe

Hi Admin,

You have a new support message:

Customer: John Doe (john@example.com)
Ticket: TKT-003
Subject: Question about EIN timeline
Priority: High

Message:
"Hello, I placed an order for LLC formation..."

[View Ticket in Dashboard →]

---
LLCPad Support System
Manage notifications: /admin/settings/notifications
```

#### When Mentioned in Internal Note:
```
Subject: 📝 You were mentioned in TKT-003

Hi Sarah,

@Sarah mentioned you in ticket TKT-003:

"@Sarah can you help with this EIN question?"

[View Ticket →]
```

---

## 📧 Email Integration

### 1. Chat Summary Email (To Customer):

**Trigger**: When ticket is marked as "Resolved" or "Closed"

```
Subject: Chat Summary - Your conversation with LLCPad Support

Hi John Doe,

Thank you for contacting LLCPad Support. Here's a summary of our conversation:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket: TKT-003
Subject: Question about EIN timeline
Status: Resolved
Started: Dec 14, 2024 at 10:30 AM
Resolved: Dec 14, 2024 at 11:45 AM
Duration: 1 hour 15 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONVERSATION:

[10:30 AM] You:
Hello, I placed an order for LLC formation with EIN
application 2 days ago. I wanted to know how long it
typically takes to receive the EIN confirmation letter?

[10:32 AM] Support Agent:
Hi John! The EIN is typically issued within 24-48 hours
after your LLC is approved by the state...

[11:15 AM] You:
Thank you! That's very helpful.

[11:45 AM] Support Agent:
You're welcome! Feel free to reach out if you have any
other questions. Have a great day!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need more help?
[Contact Support →]  [View Dashboard →]

Best regards,
LLCPad Support Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply to this email.
For support, please visit: https://llcpad.com/support
```

### 2. Offline Message Notification (To Admin):

```
Subject: 📨 New Offline Message from Potential Customer

Hi Support Team,

A visitor left a message while you were offline:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From: Sarah Johnson (sarah.j@gmail.com)
Phone: +1 555-0123
Time: Dec 14, 2024 at 11:30 PM

Message:
"I'm interested in forming an LLC for my e-commerce
business. Can you help me understand the pricing and
timeline? I'm based in California but want to form
in Wyoming."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Create Ticket →]  [Reply via Email →]

This message has been automatically saved to your dashboard.
```

### 3. Daily Digest Email (To Admin):

```
Subject: 📊 Daily Support Summary - Dec 14, 2024

Hi Admin,

Here's your daily support summary:

📈 STATISTICS
• Total conversations: 12
• New tickets: 5
• Resolved: 8
• Pending: 4
• Average response time: 8 minutes
• Customer satisfaction: 4.8/5 ⭐

🔥 URGENT TICKETS
• TKT-005 - Payment issue (Priority: Urgent)
• TKT-007 - Document missing (Priority: High)

💬 TOP QUESTIONS
1. EIN timeline (4 times)
2. LLC formation time (3 times)
3. Banking recommendations (2 times)

[View Full Report →]
```

---

## ⚙️ Settings & Configuration

### Admin Settings Page (`/admin/settings/support`):

```
┌─────────────────────────────────────────────────────────────┐
│  Support Settings                                   [Save]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🟢 Live Chat Widget                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Enable live chat widget on website                  │ │
│  │                                                        │ │
│  │ Widget Position:                                       │ │
│  │ ◉ Bottom Right  ○ Bottom Left  ○ Top Right           │ │
│  │                                                        │ │
│  │ Offset from edges:                                     │ │
│  │ Horizontal: [24] px  Vertical: [24] px               │ │
│  │                                                        │ │
│  │ Widget Color:                                          │ │
│  │ [████████] #667eea   [Reset to default]              │ │
│  │                                                        │ │
│  │ Welcome Message:                                       │ │
│  │ [👋 Hi! How can we help you today?              ]    │ │
│  │                                                        │ │
│  │ Pre-chat Form:                                         │ │
│  │ ☑ Require name and email before chat                 │ │
│  │ ☑ Show phone number field (optional)                 │ │
│  │                                                        │ │
│  │ Operating Hours:                                       │ │
│  │ ☑ Show online/offline status based on hours          │ │
│  │ Timezone: [GMT+6 Dhaka ▼]                            │ │
│  │ Mon-Fri: [09:00] to [18:00]  ☑ Enabled              │ │
│  │ Sat-Sun: [10:00] to [15:00]  ☐ Enabled              │ │
│  │                                                        │ │
│  │ Offline Behavior:                                      │ │
│  │ ◉ Show contact form                                   │ │
│  │ ○ Hide widget completely                              │ │
│  │ ○ Allow messages (email notification to admin)       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🔔 Notifications                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Desktop Notifications:                                 │ │
│  │ ☑ Enable browser notifications for new messages      │ │
│  │ ☑ Play sound on new message                          │ │
│  │ Sound: [Gentle Chime ▼]  [🔊 Preview]                │ │
│  │                                                        │ │
│  │ Email Notifications (for admins):                      │ │
│  │ ☑ New message when offline                            │ │
│  │ ☑ New ticket created                                  │ │
│  │ ☑ Mentioned in internal note                          │ │
│  │ ☑ Ticket assigned to me                               │ │
│  │ ☑ Daily digest summary                                │ │
│  │   Daily digest time: [09:00] [GMT+6 ▼]              │ │
│  │                                                        │ │
│  │ Notification Email:                                    │ │
│  │ [support@llcpad.com                            ]      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📨 Email Integration                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Customer Email Notifications:                          │ │
│  │ ☑ Send email when admin replies                       │ │
│  │ ☑ Send chat summary when ticket is resolved          │ │
│  │                                                        │ │
│  │ Auto-send Summary:                                     │ │
│  │ ◉ When ticket status changes to Resolved/Closed      │ │
│  │ ○ Manually by admin                                   │ │
│  │ ○ Ask customer before sending                         │ │
│  │                                                        │ │
│  │ Email Template:                                        │ │
│  │ From Name: [LLCPad Support               ]           │ │
│  │ From Email: [noreply@llcpad.com           ]          │ │
│  │ Reply-To: [support@llcpad.com             ]          │ │
│  │                                                        │ │
│  │ Include in Summary:                                    │ │
│  │ ☑ Ticket details (ID, subject, dates)                │ │
│  │ ☑ Full conversation                                   │ │
│  │ ☑ Attachments (as links)                             │ │
│  │ ☐ Internal notes (not recommended)                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🤖 Automation                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Auto-Response:                                         │ │
│  │ ☑ Send automatic reply to first message              │ │
│  │ Message:                                               │ │
│  │ [Thanks for contacting us! We'll reply soon...]      │ │
│  │                                                        │ │
│  │ Auto-Close Tickets:                                    │ │
│  │ ☑ Auto-close resolved tickets after [7] days         │ │
│  │                                                        │ │
│  │ Inactivity Alert:                                      │ │
│  │ ☑ Mark as "Waiting" if customer doesn't reply for    │ │
│  │   [48] hours                                          │ │
│  │                                                        │ │
│  │ Canned Responses:                                      │ │
│  │ [Manage Canned Responses →]                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🎨 Customization                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Widget Branding:                                       │ │
│  │ Company Logo: [Choose File] logo.png                 │ │
│  │                                                        │ │
│  │ Widget Button Text:                                    │ │
│  │ [Chat with us                         ]               │ │
│  │                                                        │ │
│  │ Powered By Footer:                                     │ │
│  │ ☑ Show "Powered by LLCPad Support"                   │ │
│  │                                                        │ │
│  │ Custom CSS (Advanced):                                 │ │
│  │ [.chat-widget { ... }                  ]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📊 Analytics                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Track response times                                │ │
│  │ ☑ Track customer satisfaction (CSAT)                  │ │
│  │ ☑ Generate weekly reports                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                            [Cancel]  [Save Changes]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Prisma Schema Extensions:

```prisma
model SupportTicket {
  id                String              @id @default(cuid())
  ticketNumber      String              @unique // TKT-001, TKT-002, etc.
  subject           String
  status            TicketStatus        @default(OPEN)
  priority          TicketPriority      @default(MEDIUM)
  category          String?

  // Customer info
  customerId        String?
  customer          User?               @relation("CustomerTickets", fields: [customerId], references: [id])
  guestName         String?             // For non-registered users
  guestEmail        String?
  guestPhone        String?

  // Assignment
  assignedToId      String?
  assignedTo        User?               @relation("AssignedTickets", fields: [assignedToId], references: [id])

  // Relations
  orderId           String?
  order             Order?              @relation(fields: [orderId], references: [id])

  // Metadata
  source            TicketSource        @default(LIVE_CHAT) // LIVE_CHAT, EMAIL, MANUAL
  ipAddress         String?
  userAgent         String?

  // Timestamps
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  firstResponseAt   DateTime?
  resolvedAt        DateTime?
  closedAt          DateTime?

  // Relations
  messages          SupportMessage[]
  internalNotes     InternalNote[]

  @@index([customerId])
  @@index([assignedToId])
  @@index([status])
  @@index([createdAt])
}

model SupportMessage {
  id                String              @id @default(cuid())
  ticketId          String
  ticket            SupportTicket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  // Message content
  content           String              @db.Text
  contentHtml       String?             @db.Text // Formatted HTML version

  // Sender info
  senderId          String?
  sender            User?               @relation(fields: [senderId], references: [id])
  senderType        SenderType          // CUSTOMER, AGENT, SYSTEM
  senderName        String              // For guest users

  // Message type
  type              MessageType         @default(TEXT) // TEXT, IMAGE, DOCUMENT, AUDIO, SYSTEM

  // Attachments
  attachments       MessageAttachment[]

  // Status
  isRead            Boolean             @default(false)
  readAt            DateTime?

  // Timestamps
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([ticketId])
  @@index([senderId])
  @@index([createdAt])
}

model MessageAttachment {
  id                String              @id @default(cuid())
  messageId         String
  message           SupportMessage      @relation(fields: [messageId], references: [id], onDelete: Cascade)

  fileName          String
  fileUrl           String
  fileType          String              // image/jpeg, application/pdf, etc.
  fileSize          Int                 // in bytes

  createdAt         DateTime            @default(now())

  @@index([messageId])
}

model InternalNote {
  id                String              @id @default(cuid())
  ticketId          String
  ticket            SupportTicket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  content           String              @db.Text
  authorId          String
  author            User                @relation(fields: [authorId], references: [id])

  // Mentions
  mentions          String[]            // Array of user IDs

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([ticketId])
  @@index([authorId])
}

model CannedResponse {
  id                String              @id @default(cuid())
  title             String
  content           String              @db.Text
  category          String?

  // Usage tracking
  useCount          Int                 @default(0)

  // Ownership
  createdById       String
  createdBy         User                @relation(fields: [createdById], references: [id])
  isPublic          Boolean             @default(true) // Available to all agents

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([category])
  @@index([createdById])
}

model SupportSetting {
  id                String              @id @default(cuid())
  key               String              @unique
  value             String              @db.Text
  type              String              @default("string") // string, boolean, number, json

  updatedAt         DateTime            @updatedAt

  @@index([key])
}

// Enums
enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  WAITING_AGENT
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketSource {
  LIVE_CHAT
  EMAIL
  MANUAL
  API
}

enum SenderType {
  CUSTOMER
  AGENT
  SYSTEM
}

enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  AUDIO
  SYSTEM
}
```

---

## 🔌 API Endpoints

### Public API (Customer):

```typescript
// 1. Start new chat (guest or logged-in)
POST /api/chat/start
Body: {
  name?: string,
  email?: string,
  phone?: string,
  message: string
}
Response: {
  ticketId: string,
  ticketNumber: string,
  sessionToken: string // For guest users
}

// 2. Send message
POST /api/chat/message
Body: {
  ticketId: string,
  message: string,
  attachments?: File[]
}

// 3. Get ticket messages
GET /api/chat/:ticketId/messages
Query: { offset?: number, limit?: number }
Response: {
  messages: Message[],
  hasMore: boolean
}

// 4. Upload attachment
POST /api/chat/upload
Body: FormData (file)
Response: {
  url: string,
  fileName: string,
  fileSize: number
}

// 5. Mark messages as read
PUT /api/chat/:ticketId/read

// 6. Get online status
GET /api/chat/status
Response: {
  online: boolean,
  estimatedResponseTime: string,
  operatingHours: Object
}
```

### Admin API:

```typescript
// 1. List tickets
GET /api/admin/tickets
Query: {
  status?: string,
  priority?: string,
  assignedTo?: string,
  search?: string,
  page?: number,
  limit?: number
}

// 2. Get ticket details
GET /api/admin/tickets/:id

// 3. Update ticket
PUT /api/admin/tickets/:id
Body: {
  status?: string,
  priority?: string,
  assignedToId?: string,
  category?: string
}

// 4. Send message (admin reply)
POST /api/admin/tickets/:id/messages
Body: {
  content: string,
  sendEmailNotification: boolean
}

// 5. Add internal note
POST /api/admin/tickets/:id/notes
Body: {
  content: string,
  mentions?: string[]
}

// 6. Get canned responses
GET /api/admin/canned-responses
Query: { category?: string, search?: string }

// 7. Create canned response
POST /api/admin/canned-responses
Body: {
  title: string,
  content: string,
  category?: string,
  isPublic: boolean
}

// 8. Get/Update settings
GET /api/admin/settings/support
PUT /api/admin/settings/support
Body: { [key: string]: any }

// 9. Get analytics
GET /api/admin/tickets/analytics
Query: {
  startDate: string,
  endDate: string
}
Response: {
  totalTickets: number,
  resolved: number,
  avgResponseTime: number,
  avgResolutionTime: number,
  satisfactionScore: number,
  topCategories: Array
}

// 10. Bulk actions
POST /api/admin/tickets/bulk
Body: {
  ticketIds: string[],
  action: 'assign' | 'close' | 'delete',
  assignToId?: string
}
```

### Real-time Events (Pusher/Socket.io):

```typescript
// Customer Events
'ticket.message.new' // New message in ticket
'ticket.agent.typing' // Agent is typing
'ticket.status.changed' // Ticket status updated

// Admin Events
'tickets.new' // New ticket created
'ticket.message.new' // New customer message
'ticket.customer.typing' // Customer is typing
'ticket.assigned' // Ticket assigned to agent
'ticket.mention' // Mentioned in internal note
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ Database schema setup
- ✅ Basic ticket CRUD operations
- ✅ Ticket list & detail pages (static)
- ✅ Message display (basic bubbles)
- ✅ Simple reply functionality

### Phase 2: Modern UI (Week 2)
- ✅ Redesign ticket detail page (new layout)
- ✅ Fixed sidebar + scrollable chat
- ✅ Modern message bubbles (Messenger style)
- ✅ Message timestamps & grouping
- ✅ Date separators
- ✅ Scroll to bottom button
- ✅ Typing indicator
- ✅ Read receipts

### Phase 3: Rich Features (Week 3)
- ✅ File upload (images & documents)
- ✅ Image preview & lightbox
- ✅ Document attachment cards
- ✅ Drag & drop files
- ✅ Text formatting toolbar
- ✅ Emoji picker
- ✅ Canned responses
- ✅ Internal notes

### Phase 4: Live Chat Widget (Week 4)
- ✅ Floating chat button
- ✅ Widget open/close animation
- ✅ Pre-chat form
- ✅ Guest chat support
- ✅ Online/offline status
- ✅ Widget customization
- ✅ Mobile responsive
- ✅ Unread badge

### Phase 5: Real-time & Notifications (Week 5)
- ✅ Pusher/Socket.io integration
- ✅ Real-time message updates
- ✅ Browser notifications
- ✅ Sound alerts
- ✅ Desktop notifications
- ✅ In-app toast notifications
- ✅ Typing indicators (real-time)

### Phase 6: Email Integration (Week 6)
- ✅ Email notification to admin (offline)
- ✅ Email notification to customer (reply)
- ✅ Chat summary email (auto-send)
- ✅ Email templates
- ✅ Daily digest for admins
- ✅ Offline message form

### Phase 7: Settings & Admin (Week 7)
- ✅ Support settings page
- ✅ Widget customization
- ✅ Operating hours configuration
- ✅ Notification preferences
- ✅ Email template editor
- ✅ Canned responses manager
- ✅ Analytics dashboard

### Phase 8: Polish & Optimization (Week 8)
- ✅ Performance optimization
- ✅ Virtual scrolling (long chats)
- ✅ Image lazy loading
- ✅ Search functionality
- ✅ Export conversations
- ✅ Dark mode support
- ✅ Accessibility (ARIA labels)
- ✅ Testing & bug fixes

---

## 📦 CodeCanyon Product Specs

### Product Name:
**LiveSupport Pro - Modern Support Chat & Ticketing System**

### Tagline:
*Messenger-style live chat and support ticketing for Next.js*

### Description:

LiveSupport Pro is a complete customer support solution combining live chat widget, ticketing system, and real-time notifications - all with a modern, Messenger-inspired interface.

**🎯 Perfect For:**
- SaaS applications
- E-commerce stores
- Service businesses
- Agency websites
- Any business needing customer support

**✨ Key Features:**

**For Customers:**
- 💬 Beautiful live chat widget (like Intercom)
- 📱 Mobile-responsive design
- 🖼️ Image & document uploads
- 😊 Emoji support
- ⚡ Real-time responses
- 📧 Email summaries of conversations
- 🔒 Secure & private

**For Admins:**
- 🎨 Modern Messenger-style interface
- 🔔 Real-time notifications (desktop + email)
- 📝 Canned responses for quick replies
- 🎯 Internal notes & team collaboration
- 📊 Analytics & reports
- 👥 Multi-agent support
- 🎛️ Extensive customization options

**💡 What Makes It Special:**
- Built with Next.js 16 (latest)
- TypeScript for type safety
- Tailwind CSS for easy customization
- Prisma ORM with PostgreSQL
- Real-time with Pusher
- Email integration with Resend
- Production-ready code
- Clean, documented codebase

### Tech Stack:
- Next.js 16 (App Router)
- React 18 + TypeScript
- Tailwind CSS 4
- shadcn/ui components
- PostgreSQL + Prisma
- NextAuth.js v5
- Pusher (real-time)
- Resend (email)

### Category:
JavaScript → React → Admin Templates & Tools

### Tags:
live chat, support ticket, customer support, helpdesk, chat widget, ticketing system, next.js, react, typescript, real-time chat

### Demo Features:
1. Live chat widget on landing page
2. Admin dashboard with sample tickets
3. Real-time chat simulation
4. Settings panel demo
5. Email template previews

### Documentation Included:
- ✅ Installation guide
- ✅ Configuration tutorial
- ✅ API documentation
- ✅ Customization guide
- ✅ Deployment instructions
- ✅ Troubleshooting FAQ

### Support:
- 6 months included support
- Email support response: 24-48 hours
- Documentation updates
- Bug fixes

### License:
- Regular License: Single end product
- Extended License: SaaS/Multiple end products

### Pricing Strategy:
- Regular License: $49
- Extended License: $249

### Update Plan:
- v1.0: Initial release
- v1.1: WhatsApp integration
- v1.2: AI-powered auto-responses
- v1.3: Multi-language support
- v2.0: Mobile apps (React Native)

---

## 📋 Checklist Before CodeCanyon Submission

### Code Quality:
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Code properly formatted (Prettier)
- [ ] No console.logs in production
- [ ] Error handling implemented
- [ ] Loading states for all async operations
- [ ] Proper TypeScript types

### Features:
- [ ] All core features working
- [ ] Real-time updates tested
- [ ] Email notifications tested
- [ ] File uploads working
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Dark mode implemented

### Security:
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] File upload restrictions (type, size)
- [ ] Rate limiting on API routes
- [ ] Proper authentication checks

### Documentation:
- [ ] README.md complete
- [ ] Installation guide written
- [ ] Configuration guide written
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Code comments added
- [ ] Environment variables documented

### Demo:
- [ ] Seed data created
- [ ] Demo credentials provided
- [ ] Screenshot gallery
- [ ] Video demo recorded
- [ ] Live demo deployed

### Legal:
- [ ] License file included
- [ ] Copyright notices
- [ ] Third-party licenses listed
- [ ] Privacy policy template
- [ ] Terms of service template

---

## 🎉 Conclusion

This specification covers a complete, production-ready support system that can be:
1. **Integrated into LLCPad project** immediately
2. **Sold as standalone product** on CodeCanyon
3. **Customized for clients** as freelance work

**Timeline**: 8 weeks for full implementation
**Complexity**: Medium-High
**Market Value**: $49-249 (CodeCanyon)
**Potential Revenue**: High (recurring sales)

---

**Next Steps:**
1. Review and approve this specification
2. Start Phase 1 implementation
3. Iterate based on feedback
4. Prepare for CodeCanyon submission

**Questions or Changes?**
Let me know what needs to be adjusted or clarified!
