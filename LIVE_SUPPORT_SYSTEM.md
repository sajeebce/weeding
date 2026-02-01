# 🎯 LiveSupport Pro - Plugin Specification

> A standalone support plugin for Next.js applications, installable via CMS settings

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
13. [Checklist Before CodeCanyon Submission](#checklist-before-codecanyon-submission)
14. [Real-time Technology: Socket.io](#real-time-technology-socketio)
15. [Plugin Architecture (Monorepo)](#plugin-architecture-monorepo)
16. [AI Chat Integration](#ai-chat-integration)
17. [CodeCanyon Product Strategy](#codecanyon-product-strategy)
18. [**LLCPad CMS Plugin System** (NEW)](#llcpad-cms-plugin-system)

---

## 🎯 Overview

A modern, real-time customer support system combining:
- **Live Chat Widget** (public website)
- **Support Ticket System** (admin dashboard)
- **Real-time Notifications** (Socket.io WebSocket)
- **Email Notifications** (automated)
- **Chat-to-Email Transcripts** (automatic summaries)
- **AI-powered Support** (document-fed knowledge base)

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
- **Real-time**: Socket.io (self-hosted, free)
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

### Backend Stack:
- **API**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **File Storage**: Local uploads (configurable to S3/R2)
- **Email**: Resend API
- **Real-time**: Socket.io Server (attached to Next.js)

### Real-time Communication:
```
┌─────────────────────────────────────────────────┐
│                 Next.js Server                  │
│  ┌──────────────┐    ┌───────────────────────┐ │
│  │  API Routes  │◄──►│  Socket.io Server     │ │
│  └──────┬───────┘    └───────────┬───────────┘ │
│         │                        │             │
│         ▼                        ▼             │
│  ┌─────────────────────────────────────────┐  │
│  │           PostgreSQL Database           │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         ▲                        ▲
         │                        │
    Customer Widget          Admin Dashboard
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
- ✅ Socket.io server integration
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

## 🔌 Real-time Technology: Socket.io

### Why Socket.io?

**কেন Socket.io এই plugin এর জন্য:**

1. **100% Free** - MIT License, কোনো monthly bill নেই
2. **Same VPS** - Next.js এর সাথে same process এ run করা যায়
3. **Ultra-low Latency** - Same server এ থাকলে 1-5ms response time
4. **No External Dependency** - Internet ছাড়াও local এ কাজ করবে
5. **Battle-tested** - Millions of production apps এ proven
6. **Automatic Fallback** - WebSocket না হলে HTTP long-polling করে
7. **Room Support** - Ticket-based private channels built-in
8. **TypeScript Support** - Full type definitions available

### Socket.io Architecture (Phase 1 - Without Redis)

```
┌─────────────────────────────────────────────────────────┐
│                      VPS (4GB RAM)                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Next.js Application                    │   │
│  │  ┌─────────────────┐  ┌─────────────────────┐   │   │
│  │  │   App Router    │  │   Socket.io Server  │   │   │
│  │  │  (API Routes)   │◄─┤   (Attached to HTTP)│   │   │
│  │  └────────┬────────┘  └──────────┬──────────┘   │   │
│  │           │                      │              │   │
│  │           ▼                      ▼              │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │            PostgreSQL Database          │   │   │
│  │  │  (Messages, Tickets, Users, Settings)   │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ❌ Redis - প্রথমে লাগবে না                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 📊 Scaling Thresholds (Redis কখন লাগবে)

| Metric | Socket.io Only | Redis Required |
|--------|----------------|----------------|
| **Concurrent Connections** | 1 - 10,000 | 10,000+ |
| **Messages/Second** | 1 - 1,000 | 1,000+ |
| **Active Chat Sessions** | 1 - 500 | 500+ |
| **Server Instances** | 1 | 2+ (horizontal scaling) |

**আপনার CodeCanyon Customer এর জন্য:**
- Typical usage: 50-500 concurrent visitors
- Active chats: 5-50 at a time
- **Redis লাগবে না।** বছরখানেক পরেও probably লাগবে না।

### ⚠️ Important Note: Redis Implementation

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ REDIS WILL NOT BE IMPLEMENTED IN INITIAL RELEASE   │
│                                                         │
│  Redis শুধুমাত্র horizontal scaling এর জন্য লাগে:       │
│  - Multiple server instances                            │
│  - Load balancer এর পেছনে multiple processes           │
│  - 10,000+ concurrent connections                       │
│                                                         │
│  এই thresholds CodeCanyon customers reach করবে না।     │
│  Redis support future version এ add করা হবে (v2.0+)   │
│                                                         │
│  Redis ও 100% free এবং self-hosted:                    │
│  - BSD License                                          │
│  - apt install redis-server (Ubuntu)                   │
│  - ~50-100MB RAM usage                                  │
└─────────────────────────────────────────────────────────┘
```

### Socket.io Events Structure

```typescript
// Channels (Rooms)
'ticket:{ticketId}'        // Private ticket conversation
'admin:notifications'      // All admin broadcasts
'agent:{agentId}'          // Agent-specific notifications
'presence:agents'          // Online agent tracking

// Customer → Server Events
'chat:message:send'        // Send new message
'chat:typing:start'        // Customer started typing
'chat:typing:stop'         // Customer stopped typing
'chat:read:mark'           // Mark messages as read

// Server → Customer Events
'chat:message:new'         // New message received
'chat:agent:typing'        // Agent is typing
'chat:ticket:updated'      // Ticket status changed

// Server → Admin Events
'admin:ticket:new'         // New ticket created
'admin:ticket:updated'     // Ticket status/priority changed
'admin:message:new'        // New customer message
'admin:customer:typing'    // Customer is typing
```

---

## 🧩 Plugin Architecture (Monorepo)

### Overview

LiveSupport Pro একটি **Monorepo architecture** এ build করা হবে যাতে:
1. **Standalone Product** হিসেবে CodeCanyon এ আলাদা sell করা যায়
2. **LLCPad CMS Plugin** হিসেবে integrate করা যায়
3. **Future Integrations** (WordPress, Shopify) সহজে করা যায়

### Why Monorepo?

| Aspect | Single Package | Monorepo |
|--------|----------------|----------|
| **Sell Standalone** | Hard 🔴 | Easy 🟢 |
| **Sell as Plugin** | Easy 🟢 | Easy 🟢 |
| **Code Reuse** | Low | High 🟢 |
| **Future Integrations** | Hard | Easy 🟢 |
| **Team Scaling** | Hard | Easy 🟢 |
| **Maintenance** | One codebase | Shared packages 🟢 |

### Monorepo Structure

```
livesupport-pro/                        ← 📦 MONOREPO ROOT
│
├── package.json                        # Workspace root config
├── pnpm-workspace.yaml                 # pnpm workspace config
├── turbo.json                          # Turborepo build config
├── tsconfig.json                       # Base TypeScript config
│
├── packages/                           ← 📚 SHARED PACKAGES
│   │
│   ├── core/                           ← 🧠 Core Business Logic
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                # Main exports
│   │       ├── services/
│   │       │   ├── ticket-service.ts   # Ticket CRUD operations
│   │       │   ├── message-service.ts  # Message handling
│   │       │   ├── chat-service.ts     # Live chat logic
│   │       │   ├── notification-service.ts
│   │       │   └── ai-service.ts       # AI integration
│   │       ├── socket/
│   │       │   ├── server.ts           # Socket.io server setup
│   │       │   ├── events.ts           # Event definitions
│   │       │   └── handlers.ts         # Event handlers
│   │       ├── types/
│   │       │   ├── ticket.ts
│   │       │   ├── message.ts
│   │       │   ├── user.ts
│   │       │   └── index.ts
│   │       └── utils/
│   │           ├── validation.ts
│   │           └── helpers.ts
│   │
│   ├── ui/                             ← 🎨 React Components
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                # Main exports
│   │       ├── components/
│   │       │   ├── chat-widget/
│   │       │   │   ├── ChatWidget.tsx
│   │       │   │   ├── ChatButton.tsx
│   │       │   │   ├── ChatWindow.tsx
│   │       │   │   ├── ChatInput.tsx
│   │       │   │   ├── ChatMessages.tsx
│   │       │   │   └── index.ts
│   │       │   ├── admin/
│   │       │   │   ├── TicketList.tsx
│   │       │   │   ├── TicketDetail.tsx
│   │       │   │   ├── TicketSidebar.tsx
│   │       │   │   ├── MessageBubble.tsx
│   │       │   │   └── index.ts
│   │       │   └── shared/
│   │       │       ├── Avatar.tsx
│   │       │       ├── Badge.tsx
│   │       │       ├── EmojiPicker.tsx
│   │       │       └── index.ts
│   │       ├── hooks/
│   │       │   ├── use-chat.ts
│   │       │   ├── use-socket.ts
│   │       │   ├── use-tickets.ts
│   │       │   ├── use-notifications.ts
│   │       │   └── index.ts
│   │       ├── stores/
│   │       │   ├── chat-store.ts
│   │       │   ├── ticket-store.ts
│   │       │   └── index.ts
│   │       └── styles/
│   │           ├── chat-widget.css
│   │           └── admin.css
│   │
│   ├── database/                       ← 🗄️ Database Package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Full database schema
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts
│   │       └── client.ts               # Prisma client singleton
│   │
│   └── ai/                             ← 🤖 AI Package
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── providers/
│           │   ├── openai.ts
│           │   ├── anthropic.ts
│           │   └── local.ts            # Ollama support
│           ├── knowledge-base.ts
│           ├── document-processor.ts
│           └── embeddings.ts
│
├── apps/                               ← 🚀 APPLICATIONS
│   │
│   ├── standalone/                     ← 📦 Standalone Product
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── README.md                   # Installation guide
│   │   │
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx            # Landing/demo page
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   └── dashboard/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── tickets/
│   │   │   │   ├── (admin)/
│   │   │   │   │   └── admin/
│   │   │   │   │       ├── tickets/
│   │   │   │   │       ├── settings/
│   │   │   │   │       └── analytics/
│   │   │   │   └── api/
│   │   │   │       ├── chat/
│   │   │   │       ├── tickets/
│   │   │   │       ├── socket/
│   │   │   │       └── webhooks/
│   │   │   ├── components/             # App-specific components
│   │   │   └── lib/
│   │   │       ├── auth.ts
│   │   │       └── db.ts
│   │   │
│   │   └── public/
│   │       ├── sounds/
│   │       └── images/
│   │
│   └── llcpad-plugin/                  ← 🔌 LLCPad CMS Plugin
│       ├── package.json
│       ├── plugin.json                 # Plugin manifest
│       ├── tsconfig.json
│       ├── README.md
│       │
│       └── src/
│           ├── index.ts                # Plugin entry point
│           ├── adapter.ts              # CMS adapter layer
│           ├── routes.ts               # API route handlers
│           └── pages/                  # Admin pages (if needed)
│
└── docs/                               ← 📖 DOCUMENTATION
    ├── installation.md
    ├── configuration.md
    ├── api-reference.md
    └── deployment.md
```

### Package Exports

```typescript
// packages/core/src/index.ts
export { TicketService } from './services/ticket-service';
export { MessageService } from './services/message-service';
export { ChatService } from './services/chat-service';
export { AIService } from './services/ai-service';
export { createSocketServer } from './socket/server';
export * from './types';

// packages/ui/src/index.ts
export { ChatWidget } from './components/chat-widget';
export { TicketList, TicketDetail } from './components/admin';
export { useChat, useSocket, useTickets } from './hooks';
export { useChatStore, useTicketStore } from './stores';

// packages/database/src/index.ts
export { prisma } from './client';
export * from '@prisma/client';

// packages/ai/src/index.ts
export { AIService } from './providers';
export { KnowledgeBase } from './knowledge-base';
export { DocumentProcessor } from './document-processor';
```

### Usage in Standalone App

```typescript
// apps/standalone/src/app/api/tickets/route.ts
import { TicketService } from '@livesupport/core';
import { prisma } from '@livesupport/database';

export async function GET(request: Request) {
  const tickets = await TicketService.getAll(prisma);
  return Response.json(tickets);
}

export async function POST(request: Request) {
  const data = await request.json();
  const ticket = await TicketService.create(prisma, data);
  return Response.json(ticket);
}
```

```typescript
// apps/standalone/src/app/(public)/page.tsx
import { ChatWidget } from '@livesupport/ui';

export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Our Support</h1>
      <ChatWidget
        apiUrl="/api/chat"
        socketUrl="/api/socket"
        theme="light"
      />
    </main>
  );
}
```

### Usage in LLCPad Plugin

```typescript
// apps/llcpad-plugin/src/index.ts
import { TicketService, ChatService } from '@livesupport/core';
import { ChatWidget, TicketList, useChat } from '@livesupport/ui';
import type { CMSContext, PluginExports } from '@llcpad/types';

export function initPlugin(context: CMSContext): PluginExports {
  // Use CMS's database connection
  const services = {
    tickets: new TicketService(context.prisma),
    chat: new ChatService(context.prisma, context.socket),
  };

  return {
    // Components (re-export from ui package)
    components: {
      ChatWidget,
      TicketList,
    },

    // Hooks
    hooks: {
      useChat,
    },

    // Services
    services,

    // API handlers for CMS to register
    apiHandlers: {
      'GET /api/tickets': services.tickets.getAll,
      'POST /api/tickets': services.tickets.create,
      'GET /api/chat/status': services.chat.getStatus,
    },

    // Admin menu items
    adminMenu: [
      { label: 'Tickets', path: '/admin/tickets', icon: 'MessageSquare' },
      { label: 'Settings', path: '/admin/tickets/settings', icon: 'Settings' },
    ],
  };
}

export default initPlugin;
```

### Plugin Manifest

```json
// apps/llcpad-plugin/plugin.json
{
  "name": "livesupport-pro",
  "displayName": "LiveSupport Pro",
  "version": "1.0.0",
  "description": "Live chat & ticketing system with AI support",
  "author": "LLCPad",

  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "requires": {
    "llcpad": ">=1.0.0"
  },

  "permissions": [
    "database:read",
    "database:write",
    "socket:connect",
    "email:send"
  ],

  "adminMenu": {
    "label": "Support",
    "icon": "MessageSquare",
    "position": 5,
    "items": [
      { "label": "All Tickets", "path": "/admin/tickets" },
      { "label": "Analytics", "path": "/admin/tickets/analytics" },
      { "label": "Settings", "path": "/admin/tickets/settings" }
    ]
  },

  "widgets": [
    {
      "name": "ChatWidget",
      "position": "body-end",
      "config": {
        "enabled": true,
        "position": "bottom-right"
      }
    }
  ],

  "database": {
    "migrations": "./prisma/migrations"
  }
}
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

```json
// Root package.json
{
  "name": "livesupport-pro",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate",
    "standalone:dev": "turbo run dev --filter=standalone",
    "standalone:build": "turbo run build --filter=standalone",
    "plugin:build": "turbo run build --filter=llcpad-plugin"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.9.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### CodeCanyon Products from Same Codebase

| Product | Build Command | Output |
|---------|--------------|--------|
| **LiveSupport Pro (Standalone)** | `pnpm standalone:build` | `apps/standalone/` |
| **LLCPad Plugin** | `pnpm plugin:build` | `apps/llcpad-plugin/dist/` |
| **WordPress Plugin** (future) | `pnpm wp:build` | `apps/wordpress-plugin/dist/` |

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start standalone app development
pnpm standalone:dev

# Build all packages
pnpm build

# Build only plugin for LLCPad
pnpm plugin:build

# Run tests
pnpm test

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate
```

---

## 🤖 AI Chat Integration

### Overview

AI Assistant feature যা:
1. **Knowledge Base** থেকে documents process করে
2. **Customer queries** তে instant AI response দেয়
3. **Agent assistance** - agents কে suggested replies দেয়
4. **24/7 availability** - Agents offline থাকলেও basic support

### AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Support Flow                          │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │  Customer   │───▶│  AI Router  │───▶│  Can AI Answer? │ │
│  │  Message    │    │             │    │                 │ │
│  └─────────────┘    └─────────────┘    └────────┬────────┘ │
│                                                  │          │
│                          ┌───────────────────────┼──────┐   │
│                          │                       │      │   │
│                          ▼                       ▼      │   │
│                    ┌───────────┐          ┌───────────┐ │   │
│                    │    YES    │          │    NO     │ │   │
│                    │           │          │           │ │   │
│                    │ AI Reply  │          │ Queue for │ │   │
│                    │ (Instant) │          │ Human     │ │   │
│                    └─────┬─────┘          └─────┬─────┘ │   │
│                          │                      │       │   │
│                          ▼                      ▼       │   │
│                    ┌───────────┐          ┌───────────┐ │   │
│                    │ Customer  │          │ Agent     │ │   │
│                    │ Satisfied?│          │ Responds  │ │   │
│                    └─────┬─────┘          └───────────┘ │   │
│                          │                              │   │
│                   ┌──────┴──────┐                       │   │
│                   │             │                       │   │
│                   ▼             ▼                       │   │
│             ┌─────────┐  ┌─────────────┐               │   │
│             │   YES   │  │     NO      │               │   │
│             │  Close  │  │ Escalate to │───────────────┘   │
│             │  Chat   │  │   Human     │                   │
│             └─────────┘  └─────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Knowledge Base (Document Feeding)

```typescript
// AI Module: src/ai/knowledge-base.ts

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: 'faq' | 'guide' | 'policy' | 'product';
  tags: string[];
  embedding?: number[];  // Vector embedding for similarity search
  createdAt: Date;
  updatedAt: Date;
}

// Database Schema Addition
model KnowledgeDocument {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  type        String   // faq, guide, policy, product
  tags        String[] // Array of tags
  embedding   Bytes?   // Vector embedding (binary)

  isActive    Boolean  @default(true)
  useCount    Int      @default(0)
  helpfulCount Int     @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type])
  @@index([isActive])
}

model AIConversation {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id])

  query       String   @db.Text
  response    String   @db.Text
  confidence  Float    // 0-1 confidence score
  sources     String[] // Document IDs used

  wasHelpful  Boolean?
  escalated   Boolean  @default(false)

  createdAt   DateTime @default(now())

  @@index([ticketId])
}
```

### Document Processing Pipeline

```typescript
// AI Module: src/ai/document-processor.ts

interface DocumentProcessor {
  // Supported formats
  supportedFormats: ['pdf', 'docx', 'txt', 'md', 'html'];

  // Process uploaded document
  processDocument(file: File): Promise<{
    title: string;
    content: string;
    chunks: TextChunk[];  // Split into smaller chunks
  }>;

  // Generate embeddings for semantic search
  generateEmbedding(text: string): Promise<number[]>;

  // Find relevant documents for a query
  findRelevant(query: string, limit?: number): Promise<KnowledgeDocument[]>;
}

// Chunking strategy for large documents
interface TextChunk {
  content: string;
  startIndex: number;
  endIndex: number;
  embedding: number[];
}
```

### AI Provider Abstraction

```typescript
// AI Module: src/ai/providers/index.ts

interface AIProvider {
  name: string;

  // Generate chat response
  generateResponse(options: {
    query: string;
    context: string[];      // Relevant document chunks
    conversationHistory: Message[];
    systemPrompt: string;
  }): Promise<{
    response: string;
    confidence: number;
    tokensUsed: number;
  }>;

  // Generate embedding
  generateEmbedding(text: string): Promise<number[]>;
}

// Supported Providers
class OpenAIProvider implements AIProvider { /* ... */ }
class AnthropicProvider implements AIProvider { /* ... */ }
class LocalProvider implements AIProvider { /* Ollama/LocalAI */ }
```

### AI Settings UI

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI Assistant Settings                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  AI Features                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Enable AI Auto-Response                              │ │
│  │   AI will attempt to answer customer queries           │ │
│  │                                                        │ │
│  │ ☑ Show AI Suggestions to Agents                       │ │
│  │   Suggest replies based on knowledge base             │ │
│  │                                                        │ │
│  │ ☐ AI-Only Mode (No Human Agents)                      │ │
│  │   All queries handled by AI, escalate if needed       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  AI Provider                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Provider: [OpenAI ▼]                                   │ │
│  │                                                        │ │
│  │ API Key: [sk-...........................] [Test]      │ │
│  │                                                        │ │
│  │ Model: [gpt-4o-mini ▼]                                │ │
│  │        • gpt-4o-mini (Fast, Cost-effective)           │ │
│  │        • gpt-4o (Most capable)                        │ │
│  │        • gpt-3.5-turbo (Legacy)                       │ │
│  │                                                        │ │
│  │ Max Tokens: [500]                                     │ │
│  │ Temperature: [0.7] (0=Focused, 1=Creative)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Knowledge Base                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Documents: 12 active                   [+ Add Document] │ │
│  │                                                        │ │
│  │ ┌──────────────────────────────────────────────────┐  │ │
│  │ │ 📄 LLC Formation FAQ           faq    ✓ Active   │  │ │
│  │ │    Used: 234 times | Helpful: 89%               │  │ │
│  │ ├──────────────────────────────────────────────────┤  │ │
│  │ │ 📄 EIN Application Guide       guide  ✓ Active   │  │ │
│  │ │    Used: 156 times | Helpful: 92%               │  │ │
│  │ ├──────────────────────────────────────────────────┤  │ │
│  │ │ 📄 Refund Policy               policy ✓ Active   │  │ │
│  │ │    Used: 45 times | Helpful: 78%                │  │ │
│  │ └──────────────────────────────────────────────────┘  │ │
│  │                                                        │ │
│  │ Supported formats: PDF, DOCX, TXT, MD                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  AI Behavior                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Confidence Threshold: [70]%                           │ │
│  │ (Below this, escalate to human)                       │ │
│  │                                                        │ │
│  │ System Prompt:                                        │ │
│  │ ┌──────────────────────────────────────────────────┐ │ │
│  │ │ You are a helpful customer support assistant     │ │ │
│  │ │ for LLCPad, a US LLC formation service. Be      │ │ │
│  │ │ professional, friendly, and concise. If you're  │ │ │
│  │ │ not sure about something, say so and offer to   │ │ │
│  │ │ connect with a human agent.                     │ │ │
│  │ └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │ ☑ Include disclaimer in AI responses                  │ │
│  │   "This is an AI-generated response..."              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                            [Cancel]  [Save Changes]         │
└─────────────────────────────────────────────────────────────┘
```

### AI Chat Flow (Customer Side)

```typescript
// Chat Widget AI Integration

async function handleCustomerMessage(message: string) {
  // 1. Check if AI is enabled
  const settings = await getSupportSettings();
  if (!settings.ai.enabled) {
    return createTicketForHuman(message);
  }

  // 2. Find relevant documents
  const relevantDocs = await knowledgeBase.findRelevant(message, 5);

  // 3. Generate AI response
  const aiResponse = await aiProvider.generateResponse({
    query: message,
    context: relevantDocs.map(d => d.content),
    conversationHistory: currentConversation,
    systemPrompt: settings.ai.systemPrompt,
  });

  // 4. Check confidence
  if (aiResponse.confidence >= settings.ai.confidenceThreshold) {
    // Send AI response
    await sendMessage({
      content: aiResponse.response,
      senderType: 'AI',
      metadata: {
        confidence: aiResponse.confidence,
        sources: relevantDocs.map(d => d.id),
      }
    });

    // Ask if helpful
    await sendMessage({
      type: 'FEEDBACK_REQUEST',
      content: 'Was this helpful?',
      options: ['Yes', 'No, connect me with a human']
    });
  } else {
    // Low confidence - escalate to human
    await escalateToHuman(message, aiResponse);
  }
}
```

### AI Suggestions for Agents

```
┌─────────────────────────────────────────────────────────────┐
│  Agent Chat Interface                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer: "How long does it take to get an EIN after       │
│            LLC formation?"                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  💡 AI Suggestion (92% confidence)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ The EIN is typically issued within 24-48 business      │ │
│  │ hours after your LLC is approved by the state. For     │ │
│  │ expedited orders, it can be as fast as same-day.      │ │
│  │                                                        │ │
│  │ Source: EIN Application Guide                         │ │
│  │                                                        │ │
│  │ [Use This Reply]  [Edit & Send]  [Dismiss]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Type your message...                               ] [➤]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 CodeCanyon Product Strategy

### Two Products

#### 1. LLCPad CMS (Main Product)
- **Price**: $69-149
- **Includes**: Support plugin pre-installed
- **Target**: Entrepreneurs selling LLC services

#### 2. LiveSupport Pro (Plugin)
- **Price**: $49 (Regular), $249 (Extended)
- **Standalone**: Works with any Next.js app
- **Target**: Any business needing support system

### Plugin Features by License

| Feature | Regular ($49) | Extended ($249) |
|---------|---------------|-----------------|
| Live Chat Widget | ✅ | ✅ |
| Ticket Management | ✅ | ✅ |
| Real-time (Socket.io) | ✅ | ✅ |
| Canned Responses | ✅ | ✅ |
| File Attachments | ✅ | ✅ |
| Email Notifications | ✅ | ✅ |
| Multiple Agents | ✅ | ✅ |
| AI Integration | ❌ | ✅ |
| Knowledge Base | ❌ | ✅ |
| White-label | ❌ | ✅ |
| Priority Support | ❌ | ✅ |
| SaaS Usage | ❌ | ✅ |

---

---

## 🔌 LLCPad CMS Plugin System

> A WordPress-like plugin architecture with ZIP upload, license verification, and domain lock for selling premium plugins.

### Why This Architecture?

**Industry Standard Plugin Installation Methods:**

| Platform | Method | Our Approach |
|----------|--------|--------------|
| **WordPress** | Upload ZIP + Activate | ✅ Same |
| **Shopify** | App Store + OAuth | Marketplace (future) |
| **VSCode** | .vsix package | Similar to ZIP |
| **Magento** | Composer package | Too complex for CMS |

**JSON-only manifest is NOT sufficient because:**
- ❌ JSON only stores metadata, not actual code
- ❌ No component files, API routes, or migrations
- ❌ Anyone can fake a manifest without having the plugin
- ❌ No way to verify purchase/license

### Plugin System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LLCPad CMS Plugin System                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐  │
│  │   Plugin ZIP    │───▶│  License Server │───▶│   CMS Installation  │  │
│  │   Upload        │    │   Verification  │    │   & Activation      │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Plugin Package                             │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │  │
│  │  │ plugin.json  │ │  /src code   │ │ /migrations  │ │  /assets  │ │  │
│  │  │  (manifest)  │ │  (React/TS)  │ │   (Prisma)   │ │  (static) │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Plugin Package Structure (ZIP)

```
livesupport-pro-v1.0.0.zip/
├── plugin.json                    # Plugin manifest (required)
├── LICENSE.txt                    # License file
├── README.md                      # Installation guide
│
├── dist/                          # Compiled code (required)
│   ├── index.js                   # Main entry point
│   ├── index.d.ts                 # TypeScript definitions
│   ├── components/
│   │   ├── admin/                 # Admin dashboard components
│   │   │   ├── TicketList.js
│   │   │   ├── TicketDetail.js
│   │   │   └── SupportSettings.js
│   │   └── widgets/               # Public-facing widgets
│   │       ├── ChatWidget.js
│   │       └── ChatButton.js
│   ├── api/                       # API route handlers
│   │   ├── tickets.js
│   │   ├── messages.js
│   │   └── chat.js
│   └── lib/                       # Utilities & services
│       ├── ticket-service.js
│       └── socket-handlers.js
│
├── migrations/                    # Database migrations (optional)
│   ├── 001_create_support_tables.sql
│   └── 002_add_ai_tables.sql
│
├── assets/                        # Static assets (optional)
│   ├── sounds/
│   │   └── notification.mp3
│   └── images/
│       └── logo.png
│
└── locales/                       # i18n translations (optional)
    ├── en.json
    └── bn.json
```

### Plugin Manifest (plugin.json)

```json
{
  "$schema": "https://llcpad.com/schemas/plugin-v1.json",

  "slug": "livesupport-pro",
  "name": "LiveSupport Pro",
  "version": "1.0.0",
  "description": "Professional live chat & ticketing system with AI support",

  "author": {
    "name": "LLCPad",
    "email": "plugins@llcpad.com",
    "url": "https://llcpad.com"
  },

  "license": {
    "type": "commercial",
    "requiresActivation": true,
    "licenseServerUrl": "https://api.llcpad.com/licenses"
  },

  "compatibility": {
    "minCmsVersion": "1.0.0",
    "maxCmsVersion": "2.x",
    "nodeVersion": ">=18.0.0"
  },

  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "permissions": [
    "database:read",
    "database:write",
    "socket:connect",
    "email:send",
    "files:upload",
    "settings:read",
    "settings:write"
  ],

  "dependencies": {
    "socket.io": "^4.8.0",
    "zod": "^3.23.0"
  },

  "adminMenu": {
    "label": "Support",
    "icon": "MessageSquare",
    "position": 5,
    "items": [
      { "label": "All Tickets", "path": "/admin/tickets", "icon": "Inbox" },
      { "label": "Live Chat", "path": "/admin/tickets/chat", "icon": "MessageCircle" },
      { "label": "Analytics", "path": "/admin/tickets/analytics", "icon": "BarChart3" },
      { "label": "Canned Responses", "path": "/admin/tickets/canned", "icon": "FileText" },
      { "label": "Settings", "path": "/admin/tickets/settings", "icon": "Settings" }
    ]
  },

  "routes": {
    "admin": [
      { "path": "/admin/tickets", "component": "TicketList" },
      { "path": "/admin/tickets/[id]", "component": "TicketDetail" },
      { "path": "/admin/tickets/chat", "component": "LiveChatDashboard" },
      { "path": "/admin/tickets/analytics", "component": "SupportAnalytics" },
      { "path": "/admin/tickets/settings", "component": "SupportSettings" }
    ],
    "public": [
      { "path": "/support", "component": "CustomerPortal" },
      { "path": "/support/ticket/[id]", "component": "TicketView" }
    ],
    "api": [
      { "path": "/api/support/tickets", "handler": "ticketsHandler" },
      { "path": "/api/support/messages", "handler": "messagesHandler" },
      { "path": "/api/support/chat", "handler": "chatHandler" },
      { "path": "/api/support/socket", "handler": "socketHandler" }
    ]
  },

  "widgets": [
    {
      "name": "ChatWidget",
      "position": "body-end",
      "component": "ChatWidget",
      "defaultConfig": {
        "enabled": true,
        "position": "bottom-right",
        "primaryColor": "#2563eb"
      }
    }
  ],

  "settings": {
    "schema": "./settings-schema.json",
    "defaults": {
      "chat.enabled": true,
      "chat.requireEmail": true,
      "notifications.sound": true,
      "ai.enabled": false
    }
  },

  "migrations": {
    "directory": "./migrations",
    "type": "sql"
  },

  "hooks": {
    "onInstall": "install",
    "onActivate": "activate",
    "onDeactivate": "deactivate",
    "onUninstall": "uninstall",
    "onUpgrade": "upgrade"
  },

  "features": {
    "adminPages": true,
    "publicPages": true,
    "widgets": true,
    "apiRoutes": true,
    "socketServer": true,
    "migrations": true
  }
}
```

### License Verification System

#### License Key Format

```
FORMAT: {PRODUCT}-{TIER}-{RANDOM}-{CHECKSUM}

Examples:
  LSP-STD-A7B2K9M3-4X2Q    (LiveSupport Pro - Standard)
  LSP-PRO-C3D8F1H7-9K5L    (LiveSupport Pro - Professional)
  LSP-ENT-E5G2J4N6-2M8P    (LiveSupport Pro - Enterprise)

Components:
  - LSP: Product code (LiveSupport Pro)
  - STD/PRO/ENT: License tier
  - A7B2K9M3: Random 8-char alphanumeric
  - 4X2Q: CRC32 checksum of previous parts
```

#### License Database Schema

```prisma
// prisma/schema.prisma - License Server Database

model License {
  id              String          @id @default(cuid())
  licenseKey      String          @unique

  // Product info
  productSlug     String          // e.g., "livesupport-pro"
  productName     String
  tier            LicenseTier     @default(STANDARD)

  // Customer info
  customerEmail   String
  customerName    String?
  orderId         String?         // CodeCanyon/Gumroad order ID
  purchasedAt     DateTime

  // Domain restrictions
  maxDomains      Int             @default(1)
  activations     LicenseActivation[]

  // Validity
  status          LicenseStatus   @default(ACTIVE)
  expiresAt       DateTime?       // null = lifetime
  supportExpiresAt DateTime?

  // Metadata
  features        Json?           // Tier-specific features
  notes           String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([licenseKey])
  @@index([customerEmail])
  @@index([productSlug])
}

model LicenseActivation {
  id              String          @id @default(cuid())
  licenseId       String
  license         License         @relation(fields: [licenseId], references: [id], onDelete: Cascade)

  // Domain info
  domain          String          // e.g., "example.com"
  domainHash      String          // SHA256 hash for verification

  // Environment info
  ipAddress       String?
  serverInfo      Json?           // PHP version, OS, etc.
  cmsVersion      String?
  pluginVersion   String?

  // Status
  isActive        Boolean         @default(true)
  activatedAt     DateTime        @default(now())
  lastVerifiedAt  DateTime        @default(now())
  deactivatedAt   DateTime?

  @@unique([licenseId, domain])
  @@index([domain])
  @@index([domainHash])
}

enum LicenseTier {
  STANDARD      // 1 domain, basic features
  PROFESSIONAL  // 3 domains, all features
  ENTERPRISE    // unlimited domains, priority support
  DEVELOPER     // unlimited domains, resale rights
}

enum LicenseStatus {
  ACTIVE
  EXPIRED
  SUSPENDED
  REVOKED
  REFUNDED
}
```

#### License Server API Endpoints

```typescript
// License Server API (https://api.llcpad.com/licenses)

// 1. Verify License (called during plugin activation)
POST /api/licenses/verify
Request:
{
  "licenseKey": "LSP-STD-A7B2K9M3-4X2Q",
  "domain": "customer-site.com",
  "pluginSlug": "livesupport-pro",
  "pluginVersion": "1.0.0",
  "cmsVersion": "1.2.0"
}

Response (Success):
{
  "valid": true,
  "license": {
    "tier": "STANDARD",
    "features": ["chat", "tickets", "email"],
    "expiresAt": null,
    "supportExpiresAt": "2027-02-01T00:00:00Z",
    "maxDomains": 1,
    "activeDomains": 1
  },
  "activation": {
    "id": "act_123",
    "domain": "customer-site.com",
    "activatedAt": "2026-02-01T10:30:00Z"
  }
}

Response (Error):
{
  "valid": false,
  "error": "LICENSE_DOMAIN_LIMIT",
  "message": "This license is already activated on another domain. Max domains: 1",
  "activeDomains": ["other-site.com"]
}

// 2. Deactivate License (transfer to another domain)
POST /api/licenses/deactivate
Request:
{
  "licenseKey": "LSP-STD-A7B2K9M3-4X2Q",
  "domain": "old-site.com"
}

// 3. Check License Status (periodic heartbeat)
POST /api/licenses/status
Request:
{
  "licenseKey": "LSP-STD-A7B2K9M3-4X2Q",
  "domain": "customer-site.com"
}

// 4. Get License Info (for customer dashboard)
GET /api/licenses/{licenseKey}
Headers: { "X-Customer-Email": "customer@email.com" }

// 5. Generate License (admin/webhook from payment)
POST /api/licenses/generate
Headers: { "Authorization": "Bearer {admin_token}" }
Request:
{
  "productSlug": "livesupport-pro",
  "tier": "STANDARD",
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "orderId": "codecanyon-12345",
  "expiresAt": null
}
```

#### License Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Plugin Activation Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. UPLOAD PLUGIN                                                        │
│  ┌─────────────────┐                                                     │
│  │  Admin uploads  │                                                     │
│  │  plugin.zip     │                                                     │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  2. EXTRACT & VALIDATE                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  • Extract ZIP to temp directory                                 │    │
│  │  • Validate plugin.json schema                                   │    │
│  │  • Check compatibility (CMS version, Node version)               │    │
│  │  • Verify required files exist                                   │    │
│  │  • Scan for security issues (optional)                           │    │
│  └────────┬────────────────────────────────────────────────────────┘    │
│           │                                                              │
│           ▼                                                              │
│  3. LICENSE CHECK (if requiresActivation: true)                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐    │
│  │  Show license   │────▶│  User enters    │────▶│  Verify with    │    │
│  │  key prompt     │     │  license key    │     │  license server │    │
│  └─────────────────┘     └─────────────────┘     └────────┬────────┘    │
│                                                            │             │
│                          ┌─────────────────────────────────┼─────────┐   │
│                          │                                 │         │   │
│                          ▼                                 ▼         │   │
│                    ┌───────────┐                    ┌───────────┐    │   │
│                    │  VALID    │                    │  INVALID  │    │   │
│                    │           │                    │           │    │   │
│                    │ Continue  │                    │ Show error│    │   │
│                    │ install   │                    │ Abort     │    │   │
│                    └─────┬─────┘                    └───────────┘    │   │
│                          │                                           │   │
│           ┌──────────────┘                                           │   │
│           ▼                                                              │
│  4. INSTALL PLUGIN                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  • Copy files to /plugins/{slug}/                                │    │
│  │  • Run database migrations                                       │    │
│  │  • Register routes in CMS                                        │    │
│  │  • Add menu items to sidebar                                     │    │
│  │  • Store plugin record in database                               │    │
│  │  • Call onInstall hook                                           │    │
│  └────────┬────────────────────────────────────────────────────────┘    │
│           │                                                              │
│           ▼                                                              │
│  5. ACTIVATE PLUGIN                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  • Set status to ACTIVE                                          │    │
│  │  • Enable routes and widgets                                     │    │
│  │  • Call onActivate hook                                          │    │
│  │  • Show success message                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### CMS Plugin Database Schema

```prisma
// LLCPad CMS - Plugin System Schema

enum PluginStatus {
  INSTALLED       // Installed but not activated
  ACTIVE          // Fully active and running
  DISABLED        // Manually disabled by admin
  LICENSE_EXPIRED // License expired, features disabled
  ERROR           // Error during operation
}

model Plugin {
  id                  String              @id @default(cuid())
  slug                String              @unique
  name                String
  description         String?             @db.Text
  version             String

  // Author info
  author              String?
  authorEmail         String?
  authorUrl           String?

  // Display
  icon                String?             // Icon name or URL

  // Status
  status              PluginStatus        @default(INSTALLED)

  // License info
  requiresLicense     Boolean             @default(false)
  licenseKey          String?
  licenseTier         String?
  licenseValidUntil   DateTime?
  licenseLastChecked  DateTime?

  // Plugin capabilities
  hasAdminPages       Boolean             @default(false)
  hasPublicPages      Boolean             @default(false)
  hasWidgets          Boolean             @default(false)
  hasApiRoutes        Boolean             @default(false)
  hasMigrations       Boolean             @default(false)

  // Menu configuration
  adminMenuLabel      String?
  adminMenuIcon       String?
  adminMenuPosition   Int?

  // Full manifest stored as JSON
  manifest            Json?

  // Installation info
  installedAt         DateTime            @default(now())
  installedBy         String?
  installedFromUrl    String?             // If downloaded from marketplace

  // Activation tracking
  lastActivatedAt     DateTime?
  lastDeactivatedAt   DateTime?

  // Error tracking
  lastError           String?             @db.Text
  errorAt             DateTime?

  // Relations
  menuItems           PluginMenuItem[]
  settings            PluginSetting[]
  migrations          PluginMigration[]

  updatedAt           DateTime            @updatedAt

  @@index([slug])
  @@index([status])
}

model PluginMenuItem {
  id              String          @id @default(cuid())
  pluginId        String
  plugin          Plugin          @relation(fields: [pluginId], references: [id], onDelete: Cascade)

  label           String
  path            String
  icon            String?
  parentLabel     String?         // For nested menus
  sortOrder       Int             @default(0)
  isActive        Boolean         @default(true)

  @@index([pluginId])
}

model PluginSetting {
  id              String          @id @default(cuid())
  pluginId        String
  plugin          Plugin          @relation(fields: [pluginId], references: [id], onDelete: Cascade)

  key             String
  value           String          @db.Text
  type            String          @default("string")  // string, number, boolean, json

  updatedAt       DateTime        @updatedAt

  @@unique([pluginId, key])
  @@index([pluginId])
}

model PluginMigration {
  id              String          @id @default(cuid())
  pluginId        String
  plugin          Plugin          @relation(fields: [pluginId], references: [id], onDelete: Cascade)

  migrationName   String
  executedAt      DateTime        @default(now())
  checksum        String          // MD5 of migration file
  success         Boolean         @default(true)
  errorMessage    String?

  @@unique([pluginId, migrationName])
  @@index([pluginId])
}
```

### Plugin Installation API

```typescript
// POST /api/admin/plugins/install
// Content-Type: multipart/form-data

interface InstallPluginRequest {
  file: File;               // plugin.zip file
  licenseKey?: string;      // Optional license key
  activateAfterInstall?: boolean;
}

interface InstallPluginResponse {
  success: boolean;
  plugin?: {
    id: string;
    slug: string;
    name: string;
    version: string;
    status: PluginStatus;
    requiresLicense: boolean;
    licenseValid?: boolean;
  };
  requiresLicense?: boolean;  // If true, prompt for license
  error?: string;
  details?: string[];
}

// POST /api/admin/plugins/{slug}/activate
interface ActivatePluginRequest {
  licenseKey?: string;
}

interface ActivatePluginResponse {
  success: boolean;
  plugin?: Plugin;
  license?: {
    valid: boolean;
    tier: string;
    features: string[];
    expiresAt?: string;
  };
  error?: string;
}

// POST /api/admin/plugins/{slug}/deactivate
// DELETE /api/admin/plugins/{slug}
// POST /api/admin/plugins/{slug}/verify-license
```

### Admin UI: Plugin Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🧩 Plugins                                     [Upload Plugin] [Refresh]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Installed Plugins (3)                                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  ┌──────┐  LiveSupport Pro                               v1.0.0   │  │
│  │  │  💬  │  Live chat & ticketing system with AI support           │  │
│  │  └──────┘  By LLCPad                                               │  │
│  │                                                                    │  │
│  │  Status: ✅ Active                   License: PRO (Valid)          │  │
│  │                                                                    │  │
│  │  [Deactivate]  [Settings]  [Check Updates]  [⋮ More]              │  │
│  │                                                                    │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  ┌──────┐  SEO Manager                                   v2.1.0   │  │
│  │  │  📊  │  Advanced SEO tools, meta tags, sitemap generator       │  │
│  │  └──────┘  By LLCPad                                               │  │
│  │                                                                    │  │
│  │  Status: ✅ Active                   License: Standard (Valid)     │  │
│  │                                                                    │  │
│  │  [Deactivate]  [Settings]  [Check Updates]  [⋮ More]              │  │
│  │                                                                    │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  ┌──────┐  Analytics Dashboard                           v1.5.0   │  │
│  │  │  📈  │  Comprehensive analytics and reporting                  │  │
│  │  └──────┘  By ThirdParty Dev                                       │  │
│  │                                                                    │  │
│  │  Status: ⚠️ License Expired           License: Expired (Jan 2026)  │  │
│  │          Some features are disabled                                │  │
│  │                                                                    │  │
│  │  [Renew License]  [Deactivate]  [⋮ More]                          │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  💡 How to Install Plugins                                         │  │
│  │                                                                    │  │
│  │  1. Purchase a plugin from LLCPad Marketplace or CodeCanyon       │  │
│  │  2. Download the plugin ZIP file                                  │  │
│  │  3. Click "Upload Plugin" and select the ZIP file                 │  │
│  │  4. Enter your license key when prompted                          │  │
│  │  5. Activate the plugin to enable its features                    │  │
│  │                                                                    │  │
│  │  [Browse Marketplace →]                                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Upload Plugin Dialog

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Upload Plugin                                                     [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │                    📦                                              │  │
│  │                                                                    │  │
│  │           Drag and drop your plugin ZIP file here                 │  │
│  │                   or click to browse                              │  │
│  │                                                                    │  │
│  │              Supported format: .zip (max 50MB)                    │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ── Or enter download URL ──────────────────────────────────────────    │
│                                                                          │
│  [https://example.com/plugin.zip                                    ]   │
│                                                                          │
│                                             [Cancel]  [Upload & Install] │
└─────────────────────────────────────────────────────────────────────────┘
```

### License Activation Dialog

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔑 Activate Plugin License                                        [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LiveSupport Pro requires a valid license key to activate.              │
│                                                                          │
│  License Key:                                                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  LSP-PRO-                                                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ℹ️ Your license key was sent to your email after purchase.      │    │
│  │     You can also find it in your CodeCanyon downloads page.     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  This license will be activated for: customer-site.com                  │
│                                                                          │
│  □ I agree to the plugin terms of service                               │
│                                                                          │
│  [Don't have a license? Purchase here →]                                │
│                                                                          │
│                                           [Cancel]  [Activate License]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### License Generation (Seller Dashboard)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  License Management - Admin Dashboard                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Generate License]  [Import from CodeCanyon]  [Export CSV]             │
│                                                                          │
│  🔍 Search licenses...                           [Filter ▼] [Sort ▼]    │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ License Key          Product           Tier    Customer    Status │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │ LSP-PRO-A7B2K9M3    LiveSupport Pro   PRO     john@...    Active │  │
│  │                     Domains: 2/3       Expires: Never              │  │
│  │                     Activated: customer-site.com, test.local       │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │ LSP-STD-C3D8F1H7    LiveSupport Pro   STD     jane@...    Active │  │
│  │                     Domains: 1/1       Expires: Never              │  │
│  │                     Activated: janes-store.com                     │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │ LSP-ENT-E5G2J4N6    LiveSupport Pro   ENT     corp@...    Active │  │
│  │                     Domains: 5/∞       Expires: 2027-02-01        │  │
│  │                     Support expires: 2027-02-01                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Showing 1-3 of 156 licenses                        [← Prev] [Next →]   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Generate License Dialog

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Generate New License                                              [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Product:                                                                │
│  [LiveSupport Pro ▼]                                                    │
│                                                                          │
│  License Tier:                                                           │
│  ◉ Standard ($49)     - 1 domain, basic features                        │
│  ○ Professional ($99) - 3 domains, all features                         │
│  ○ Enterprise ($249)  - Unlimited domains, priority support             │
│  ○ Developer ($499)   - Unlimited domains, resale rights                │
│                                                                          │
│  Customer Email: *                                                       │
│  [customer@email.com                                                ]   │
│                                                                          │
│  Customer Name:                                                          │
│  [John Doe                                                          ]   │
│                                                                          │
│  Order ID (CodeCanyon/Gumroad):                                         │
│  [codecanyon-12345678                                               ]   │
│                                                                          │
│  Expiration:                                                             │
│  ◉ Lifetime (never expires)                                             │
│  ○ 1 Year from purchase                                                 │
│  ○ Custom date: [____-__-__]                                            │
│                                                                          │
│  Support Period:                                                         │
│  [1 Year ▼]  (6 months included, extended available)                    │
│                                                                          │
│  Notes (internal):                                                       │
│  [                                                                   ]  │
│                                                                          │
│  ☑ Send license key to customer email                                   │
│                                                                          │
│                                           [Cancel]  [Generate License]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### CodeCanyon/Envato Webhook Integration

```typescript
// Automatic license generation when someone buys on CodeCanyon

// POST /api/webhooks/envato
// Envato webhook sends purchase notifications

interface EnvatoPurchaseWebhook {
  sale: {
    id: string;
    item_id: string;           // Your plugin's item ID
    item_name: string;
    amount: string;
    buyer: string;             // Envato username
    license: string;           // "Regular" or "Extended"
    purchase_count: number;
    sold_at: string;
  };
}

async function handleEnvatoWebhook(payload: EnvatoPurchaseWebhook) {
  const { sale } = payload;

  // 1. Verify webhook signature
  // 2. Determine tier from Envato license type
  const tier = sale.license === "Extended" ? "PROFESSIONAL" : "STANDARD";

  // 3. Get buyer email from Envato API
  const buyerEmail = await envato.getBuyerEmail(sale.buyer, sale.id);

  // 4. Generate license key
  const license = await generateLicense({
    productSlug: "livesupport-pro",
    tier,
    customerEmail: buyerEmail,
    customerName: sale.buyer,
    orderId: `envato-${sale.id}`,
  });

  // 5. Send license email to customer
  await sendLicenseEmail(buyerEmail, license);

  return { success: true, licenseKey: license.licenseKey };
}
```

### Plugin Installation Code (CMS Side)

```typescript
// src/lib/plugins/installer.ts

import AdmZip from 'adm-zip';
import { z } from 'zod';
import prisma from '@/lib/db';

const pluginManifestSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  version: z.string(),
  description: z.string().optional(),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }).optional(),
  license: z.object({
    type: z.enum(['free', 'commercial']),
    requiresActivation: z.boolean().default(false),
    licenseServerUrl: z.string().url().optional(),
  }).optional(),
  main: z.string(),
  permissions: z.array(z.string()).optional(),
  adminMenu: z.object({
    label: z.string(),
    icon: z.string(),
    position: z.number().optional(),
    items: z.array(z.object({
      label: z.string(),
      path: z.string(),
      icon: z.string().optional(),
    })),
  }).optional(),
  // ... more fields
});

export class PluginInstaller {
  private tempDir: string;
  private pluginsDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), '.temp/plugins');
    this.pluginsDir = path.join(process.cwd(), 'plugins');
  }

  async install(zipBuffer: Buffer, licenseKey?: string): Promise<InstallResult> {
    const extractPath = path.join(this.tempDir, `install-${Date.now()}`);

    try {
      // 1. Extract ZIP
      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(extractPath, true);

      // 2. Find and validate plugin.json
      const manifestPath = path.join(extractPath, 'plugin.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error('plugin.json not found in ZIP');
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const validatedManifest = pluginManifestSchema.parse(manifest);

      // 3. Check if plugin already exists
      const existing = await prisma.plugin.findUnique({
        where: { slug: validatedManifest.slug },
      });

      if (existing) {
        throw new Error(`Plugin ${validatedManifest.slug} is already installed`);
      }

      // 4. Verify license if required
      if (validatedManifest.license?.requiresActivation) {
        if (!licenseKey) {
          return {
            success: false,
            requiresLicense: true,
            manifest: validatedManifest,
          };
        }

        const licenseResult = await this.verifyLicense(
          licenseKey,
          validatedManifest.slug,
          validatedManifest.license.licenseServerUrl
        );

        if (!licenseResult.valid) {
          throw new Error(licenseResult.error || 'Invalid license key');
        }
      }

      // 5. Copy files to plugins directory
      const pluginDir = path.join(this.pluginsDir, validatedManifest.slug);
      await fs.promises.cp(extractPath, pluginDir, { recursive: true });

      // 6. Run migrations if present
      const migrationsDir = path.join(pluginDir, 'migrations');
      if (fs.existsSync(migrationsDir)) {
        await this.runMigrations(validatedManifest.slug, migrationsDir);
      }

      // 7. Create database record
      const plugin = await prisma.plugin.create({
        data: {
          slug: validatedManifest.slug,
          name: validatedManifest.name,
          version: validatedManifest.version,
          description: validatedManifest.description,
          author: validatedManifest.author?.name,
          authorEmail: validatedManifest.author?.email,
          authorUrl: validatedManifest.author?.url,
          status: 'INSTALLED',
          requiresLicense: validatedManifest.license?.requiresActivation ?? false,
          licenseKey: licenseKey,
          manifest: validatedManifest,
          hasAdminPages: !!validatedManifest.routes?.admin?.length,
          hasPublicPages: !!validatedManifest.routes?.public?.length,
          hasWidgets: !!validatedManifest.widgets?.length,
          hasApiRoutes: !!validatedManifest.routes?.api?.length,
          hasMigrations: fs.existsSync(migrationsDir),
          adminMenuLabel: validatedManifest.adminMenu?.label,
          adminMenuIcon: validatedManifest.adminMenu?.icon,
          adminMenuPosition: validatedManifest.adminMenu?.position,
          menuItems: validatedManifest.adminMenu?.items ? {
            create: validatedManifest.adminMenu.items.map((item, index) => ({
              label: item.label,
              path: item.path,
              icon: item.icon,
              sortOrder: index,
            })),
          } : undefined,
        },
        include: {
          menuItems: true,
        },
      });

      // 8. Call onInstall hook
      await this.callHook(pluginDir, 'onInstall');

      return {
        success: true,
        plugin,
      };

    } finally {
      // Cleanup temp directory
      await fs.promises.rm(extractPath, { recursive: true, force: true });
    }
  }

  private async verifyLicense(
    licenseKey: string,
    pluginSlug: string,
    serverUrl?: string
  ): Promise<LicenseVerifyResult> {
    const url = serverUrl || 'https://api.llcpad.com/licenses/verify';
    const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL || '').hostname;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        domain,
        pluginSlug,
        pluginVersion: '1.0.0', // Get from manifest
        cmsVersion: process.env.CMS_VERSION,
      }),
    });

    return response.json();
  }

  private async runMigrations(pluginSlug: string, migrationsDir: string) {
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      const checksum = crypto.createHash('md5').update(sql).digest('hex');

      // Check if already executed
      const existing = await prisma.pluginMigration.findFirst({
        where: { pluginId: pluginSlug, migrationName: file },
      });

      if (existing) continue;

      // Execute migration
      try {
        await prisma.$executeRawUnsafe(sql);

        await prisma.pluginMigration.create({
          data: {
            pluginId: pluginSlug,
            migrationName: file,
            checksum,
            success: true,
          },
        });
      } catch (error) {
        await prisma.pluginMigration.create({
          data: {
            pluginId: pluginSlug,
            migrationName: file,
            checksum,
            success: false,
            errorMessage: error.message,
          },
        });
        throw error;
      }
    }
  }

  private async callHook(pluginDir: string, hookName: string) {
    try {
      const pluginModule = require(path.join(pluginDir, 'dist/index.js'));
      if (typeof pluginModule[hookName] === 'function') {
        await pluginModule[hookName]();
      }
    } catch (error) {
      console.warn(`Failed to call ${hookName} hook:`, error);
    }
  }
}
```

### License Tiers & Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LiveSupport Pro - License Tiers                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  STANDARD - $49                                                  │    │
│  │  ─────────────────────────────────────────────────────────────   │    │
│  │  ✓ 1 Domain activation                                          │    │
│  │  ✓ Live chat widget                                              │    │
│  │  ✓ Ticket management                                             │    │
│  │  ✓ Real-time updates (Socket.io)                                │    │
│  │  ✓ Email notifications                                           │    │
│  │  ✓ Canned responses                                              │    │
│  │  ✓ File attachments                                              │    │
│  │  ✓ 6 months support                                              │    │
│  │  ✗ AI Integration                                                │    │
│  │  ✗ Knowledge Base                                                │    │
│  │  ✗ White-label                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PROFESSIONAL - $99                                              │    │
│  │  ─────────────────────────────────────────────────────────────   │    │
│  │  ✓ Everything in Standard                                        │    │
│  │  ✓ 3 Domain activations                                          │    │
│  │  ✓ AI-powered auto-responses                                     │    │
│  │  ✓ Knowledge Base (document upload)                              │    │
│  │  ✓ Advanced analytics                                            │    │
│  │  ✓ 12 months support                                             │    │
│  │  ✗ White-label                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ENTERPRISE - $249                                               │    │
│  │  ─────────────────────────────────────────────────────────────   │    │
│  │  ✓ Everything in Professional                                    │    │
│  │  ✓ Unlimited domain activations                                  │    │
│  │  ✓ White-label (remove branding)                                 │    │
│  │  ✓ Priority email support                                        │    │
│  │  ✓ Custom feature requests                                       │    │
│  │  ✓ 24 months support                                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  DEVELOPER - $499                                                │    │
│  │  ─────────────────────────────────────────────────────────────   │    │
│  │  ✓ Everything in Enterprise                                      │    │
│  │  ✓ Resale rights (include in your products)                     │    │
│  │  ✓ Source code access                                            │    │
│  │  ✓ Private Slack channel                                         │    │
│  │  ✓ Lifetime updates                                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Summary: Plugin System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Complete Plugin System Flow                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SELLER SIDE (You)                      BUYER SIDE (Customer)           │
│  ─────────────────                      ─────────────────────           │
│                                                                          │
│  1. Build Plugin                                                         │
│     ↓                                                                    │
│  2. Package as ZIP                                                       │
│     ↓                                                                    │
│  3. Upload to CodeCanyon      ───────▶  1. Purchase Plugin              │
│     ↓                                       ↓                            │
│  4. CodeCanyon sends webhook            2. Download ZIP                 │
│     ↓                                       ↓                            │
│  5. Auto-generate license              3. Upload to CMS                 │
│     ↓                                       ↓                            │
│  6. Email license to buyer             4. Enter License Key             │
│                                             ↓                            │
│  LICENSE SERVER                        5. Verify with Server            │
│  ───────────────                            ↓                            │
│  • Store licenses                      6. Activate on Domain            │
│  • Verify activations                      ↓                            │
│  • Track domains                       7. Plugin Active! 🎉             │
│  • Handle expirations                                                    │
│                                                                          │
│  PERIODIC                                                                │
│  ────────                                                                │
│  • Daily license check (heartbeat)                                      │
│  • Disable features if expired                                          │
│  • Notify before expiration                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Build Version Distribution (Anti-Plagiarism)

**Why Build Version, Not Source Code?**

| Distribution | Pros | Cons |
|--------------|------|------|
| **Source Code** | Easy to modify | ❌ Easy to plagiarize, resell |
| **Build Version** | ✅ Hard to copy/modify | Can't customize internals |

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Plugin Build Pipeline                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SOURCE CODE              BUILD PROCESS              DISTRIBUTED ZIP     │
│  ────────────              ─────────────              ───────────────    │
│                                                                          │
│  src/                     1. TypeScript Compile      dist/               │
│  ├── components/    ───▶  2. Bundle (esbuild)   ───▶ ├── index.js       │
│  ├── api/                 3. Minify                  ├── index.js.map   │
│  └── lib/                 4. Obfuscate               └── chunks/        │
│                           5. Tree-shake                                  │
│                           6. Add watermark                               │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Obfuscation Techniques:                                          │  │
│  │  • Variable name mangling: customerName → a, ticketId → b         │  │
│  │  • String encryption: "API_KEY" → decrypt("x7k2m...")             │  │
│  │  • Control flow flattening: if/else → switch with random order    │  │
│  │  • Dead code injection: fake functions that never execute         │  │
│  │  • License watermark embedded in multiple places                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Build Script Example:**

```typescript
// build-plugin.ts
import esbuild from 'esbuild';
import JavaScriptObfuscator from 'javascript-obfuscator';

async function buildPlugin(licenseKey?: string) {
  // 1. Compile TypeScript
  const result = await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    target: 'es2020',
    format: 'esm',
    outdir: 'dist',
    write: false,
  });

  // 2. Obfuscate
  const obfuscated = JavaScriptObfuscator.obfuscate(result.outputFiles[0].text, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    rotateStringArray: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  });

  // 3. Inject watermark (hidden in multiple places)
  const watermarkedCode = injectWatermark(obfuscated.getObfuscatedCode(), licenseKey);

  // 4. Write output
  await fs.writeFile('dist/index.js', watermarkedCode);
}
```

### 4-Layer Protection System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    4-Layer Protection Architecture                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Layer 1: CODE OBFUSCATION                                              │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Minified + Obfuscated JavaScript                                     │
│  • Variable names mangled                                                │
│  • Control flow flattened                                                │
│  • Strings encrypted                                                     │
│  🛡️ Prevents: Casual copying, easy understanding                        │
│                                                                          │
│  Layer 2: LICENSE VERIFICATION                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  • License key required for activation                                   │
│  • Server-side validation                                                │
│  • RSA-signed tokens                                                     │
│  🛡️ Prevents: Unlicensed usage                                          │
│                                                                          │
│  Layer 3: DOMAIN LOCK                                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  • License tied to specific domain(s)                                   │
│  • Domain hash verification                                              │
│  • Cannot transfer without deactivation                                  │
│  🛡️ Prevents: License sharing, multiple installations                   │
│                                                                          │
│  Layer 4: WATERMARK                                                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Hidden watermark in code (license key embedded)                      │
│  • Multiple injection points                                             │
│  • Traceable if leaked                                                   │
│  🛡️ Prevents: Anonymous redistribution                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flexible Domain Lock

**Domain Lock Options (Set During License Generation):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Domain Lock Flexibility                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LICENSE GENERATION OPTIONS:                                             │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Domain Lock Mode:                                                  │  │
│  │                                                                     │  │
│  │  ◉ LOCKED - Specific Domains Only                                  │  │
│  │    License will ONLY work on specified domains                     │  │
│  │    • Standard: 1 domain                                            │  │
│  │    • Professional: 3 domains                                       │  │
│  │    • Enterprise: Unlimited domains                                 │  │
│  │                                                                     │  │
│  │  ○ UNLOCKED - Any Domain                                           │  │
│  │    License works on ANY domain (no restrictions)                   │  │
│  │    Use for: Developer licenses, special customers                  │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  DATABASE SCHEMA:                                                        │
│                                                                          │
│  model License {                                                         │
│    domainLockMode    DomainLockMode    @default(LOCKED)                 │
│    maxDomains        Int               @default(1)                       │
│    // LOCKED: Check domain on every verification                        │
│    // UNLOCKED: Skip domain check, allow any domain                     │
│  }                                                                       │
│                                                                          │
│  enum DomainLockMode {                                                   │
│    LOCKED      // Restricted to maxDomains specific domains             │
│    UNLOCKED    // Works on any domain                                   │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### JWT Token Caching (Cost Optimization)

**Problem: API Cost on Every Page Load**

```
❌ BAD: Verify on Every Request
──────────────────────────────
User visits admin page → API call to license server
User navigates to tickets → Another API call
User opens settings → Another API call
...
Result: 100+ API calls per day per user = $$$$ cost
```

**Solution: JWT Token with 7-Day Cache**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    JWT Token Caching Architecture                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INITIAL VERIFICATION (Once every 7 days)                               │
│  ─────────────────────────────────────────                               │
│                                                                          │
│  ┌──────────┐       ┌─────────────────┐       ┌─────────────────┐       │
│  │   CMS    │──────▶│  License Server │──────▶│  Return signed  │       │
│  │          │ POST  │                 │       │  JWT Token      │       │
│  │ License  │       │  Verify license │       │                 │       │
│  │ Key +    │       │  + domain       │       │  Valid 7 days   │       │
│  │ Domain   │       │                 │       │  RSA signed     │       │
│  └──────────┘       └─────────────────┘       └─────────────────┘       │
│                                                                          │
│  TOKEN STRUCTURE:                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  {                                                                  │  │
│  │    "licenseKey": "LSP-PRO-A7B2K9M3-4X2Q",                          │  │
│  │    "productSlug": "livesupport-pro",                               │  │
│  │    "tier": "PROFESSIONAL",                                         │  │
│  │    "features": ["chat", "tickets", "ai", "analytics"],             │  │
│  │    "domain": "customer-site.com",                                  │  │
│  │    "domainLockMode": "LOCKED",                                     │  │
│  │    "issuedAt": "2026-02-01T10:00:00Z",                             │  │
│  │    "expiresAt": "2026-02-08T10:00:00Z",  // 7 days                │  │
│  │    "licenseExpiresAt": "2027-02-01T00:00:00Z",  // 1 year         │  │
│  │    "signature": "RSA_SHA256_SIGNATURE..."  // Cannot forge        │  │
│  │  }                                                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  LOCAL VERIFICATION (Every request - FREE)                              │
│  ──────────────────────────────────────────                              │
│                                                                          │
│  ┌──────────┐       ┌─────────────────┐       ┌─────────────────┐       │
│  │   CMS    │──────▶│  Local Check    │──────▶│  Allow/Deny     │       │
│  │          │       │                 │       │                 │       │
│  │  Cached  │       │  1. Parse JWT   │       │  No API call    │       │
│  │  Token   │       │  2. Verify sig  │       │  Instant check  │       │
│  │          │       │  3. Check expiry│       │  FREE           │       │
│  └──────────┘       └─────────────────┘       └─────────────────┘       │
│                                                                          │
│  RSA KEY DISTRIBUTION:                                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  LICENSE SERVER         CMS PLUGIN (Customer Site)                 │  │
│  │  ───────────────         ─────────────────────────                 │  │
│  │                                                                    │  │
│  │  🔐 PRIVATE KEY          🔓 PUBLIC KEY                             │  │
│  │  (Secret, never shared)   (Embedded in plugin code)                │  │
│  │                                                                    │  │
│  │  Signs JWT tokens         Verifies JWT signatures                  │  │
│  │                                                                    │  │
│  │  ❌ Cannot forge token without private key                         │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  COST COMPARISON:                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  Without Caching:                                                  │  │
│  │  • 100 users × 10 pages/day × 30 days = 30,000 API calls/month    │  │
│  │  • Cost: HIGH                                                      │  │
│  │                                                                    │  │
│  │  With JWT Caching:                                                 │  │
│  │  • 100 users × 4 refreshes/month = 400 API calls/month            │  │
│  │  • Cost: ~99% reduction ✅                                         │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Automatic Silent Token Refresh

**No Manual Refresh Required - Happens Automatically**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Automatic Silent Refresh                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  HOW IT WORKS:                                                           │
│  ─────────────                                                           │
│                                                                          │
│  1. Admin visits dashboard (any page)                                    │
│  2. Plugin checks token age in background                                │
│  3. If token > 5 days old → Silent refresh in background                │
│  4. User sees nothing, experiences no delay                              │
│  5. New token cached, valid for 7 more days                             │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  TOKEN AGE        ACTION                  USER EXPERIENCE          │  │
│  │  ─────────        ──────                  ───────────────          │  │
│  │                                                                    │  │
│  │  0-5 days         No action               Normal                   │  │
│  │  5-7 days         Background refresh      Normal (no delay)        │  │
│  │  7-30 days        Foreground refresh*     Brief loading spinner   │  │
│  │  30+ days         Force re-verify         "Verify License" prompt │  │
│  │                                                                    │  │
│  │  * Only if background refresh failed                              │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  CODE IMPLEMENTATION:                                                    │
│                                                                          │
│  // Plugin automatically runs on admin load                              │
│  useEffect(() => {                                                       │
│    const checkAndRefreshToken = async () => {                           │
│      const token = await getStoredToken();                              │
│      const tokenAge = daysSince(token.issuedAt);                        │
│                                                                          │
│      if (tokenAge >= 5 && tokenAge < 7) {                               │
│        // Background refresh - user sees nothing                        │
│        refreshTokenSilently().catch(console.error);                     │
│      } else if (tokenAge >= 7 && tokenAge < 30) {                       │
│        // Still works, but try harder to refresh                        │
│        await refreshTokenWithRetry();                                   │
│      } else if (tokenAge >= 30) {                                       │
│        // Show verification prompt                                       │
│        setShowVerifyPrompt(true);                                       │
│      }                                                                   │
│    };                                                                    │
│                                                                          │
│    checkAndRefreshToken();                                               │
│  }, []);                                                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Public vs Admin Feature Separation

**Token Expiry Only Affects Admin - Public Features Continue Working**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Feature Separation Architecture                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DATABASE (Persistent Source of Truth)                                   │
│  ──────────────────────────────────────                                  │
│                                                                          │
│  model Plugin {                                                          │
│    ...                                                                   │
│    status              PluginStatus    // ACTIVE, DISABLED, etc.        │
│    licenseExpiresAt    DateTime?       // Actual license expiry (1 yr)  │
│    tokenExpiresAt      DateTime?       // JWT token expiry (7 days)     │
│    tokenIssuedAt       DateTime?       // When token was issued         │
│  }                                                                       │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  PUBLIC FEATURES                    ADMIN FEATURES                 │  │
│  │  (Chat Widget, Customer Portal)      (Dashboard, Settings)         │  │
│  │  ───────────────────────────────    ────────────────────────       │  │
│  │                                                                    │  │
│  │  CHECK: DB flag + licenseExpiresAt   CHECK: JWT token validity     │  │
│  │                                                                    │  │
│  │  ✅ Works even if admin doesn't      ⚠️ Needs valid token          │  │
│  │     log in for weeks                    (auto-refreshes)           │  │
│  │                                                                    │  │
│  │  ✅ No token dependency               ⚠️ Shows warning if          │  │
│  │                                          token expired             │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  SCENARIO: Admin doesn't log in for 30 days                             │
│  ───────────────────────────────────────────                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Chat Widget (Public)          Admin Dashboard                   │    │
│  │  ─────────────────────          ───────────────                  │    │
│  │                                                                  │    │
│  │  ✅ Still works!                ⚠️ "Please verify license"       │    │
│  │  ✅ Visitors can chat           ⚠️ Shows warning banner          │    │
│  │  ✅ Tickets created             ✅ Still functional              │    │
│  │                                 ✅ Just needs one click to fix   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  SCENARIO: Actual license expires (1 year)                              │
│  ─────────────────────────────────────────                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Chat Widget (Public)          Admin Dashboard                   │    │
│  │  ─────────────────────          ───────────────                  │    │
│  │                                                                  │    │
│  │  ⚠️ Shows watermark             ❌ Locked, must renew            │    │
│  │  ⚠️ "Powered by LLCPad"        ❌ Features disabled              │    │
│  │  ✅ Basic chat still works      ❌ Cannot access settings        │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Security Attack Vectors & Defenses

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Security Attack & Defense Matrix                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ATTACK #1: Client-side JavaScript Modification                         │
│  ───────────────────────────────────────────────                         │
│                                                                          │
│  ❌ Attack: Hacker modifies JS to skip license check                    │
│                                                                          │
│  ✅ Defense: Critical features validated SERVER-SIDE                    │
│                                                                          │
│  // API Route - Cannot be modified by client                            │
│  export async function GET(request: NextRequest) {                      │
│    const license = await verifyLicenseServerSide();                     │
│                                                                          │
│    if (!license.valid) {                                                │
│      return NextResponse.json(                                          │
│        { error: "Invalid license" },                                    │
│        { status: 403 }                                                  │
│      );                                                                  │
│    }                                                                     │
│                                                                          │
│    // Only return data if license valid                                 │
│    return NextResponse.json(data);                                      │
│  }                                                                       │
│                                                                          │
│  🛡️ Result: Client JS modification doesn't help                         │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ATTACK #2: Database Direct Modification                                │
│  ───────────────────────────────────────                                 │
│                                                                          │
│  ❌ Attack: Hacker sets plugin_licensed = true in database              │
│                                                                          │
│  ✅ Defense: RSA Signature Verification                                 │
│                                                                          │
│  // DB value alone is not trusted                                       │
│  // Token signature MUST be valid                                       │
│                                                                          │
│  const verifyToken = (token: string) => {                               │
│    const PUBLIC_KEY = process.env.LICENSE_PUBLIC_KEY;                   │
│                                                                          │
│    try {                                                                 │
│      const decoded = jwt.verify(token, PUBLIC_KEY, {                    │
│        algorithms: ['RS256']                                            │
│      });                                                                 │
│      return { valid: true, data: decoded };                             │
│    } catch {                                                             │
│      return { valid: false };                                           │
│    }                                                                     │
│  };                                                                       │
│                                                                          │
│  🛡️ Result: Cannot forge token without private key                      │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ATTACK #3: Fake License Server Response                                │
│  ───────────────────────────────────────                                 │
│                                                                          │
│  ❌ Attack: MITM attack spoofing license server response                │
│                                                                          │
│  ✅ Defense: Response is RSA Signed                                     │
│                                                                          │
│  // Server signs response with PRIVATE key                              │
│  // Client verifies with PUBLIC key (embedded in plugin)                │
│  // Even if response is intercepted, cannot create valid signature      │
│                                                                          │
│  🛡️ Result: Spoofed responses rejected                                  │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ATTACK #4: Code Deobfuscation                                          │
│  ─────────────────────────────                                           │
│                                                                          │
│  ❌ Attack: Reverse engineer obfuscated code                            │
│                                                                          │
│  ⚠️ Defense: Multi-layer, but not 100%                                  │
│                                                                          │
│  • Multiple obfuscation passes                                          │
│  • License checks scattered throughout code                             │
│  • Self-defending code (detects debugging)                              │
│  • Watermark for traceability                                           │
│                                                                          │
│  ⚡ Reality: Determined experts CAN crack any client-side protection    │
│             BUT server-side checks remain unbreakable                   │
│                                                                          │
│  🛡️ Result: Stops 95%+ casual piracy                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Security Protection Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Protection Effectiveness Matrix                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PROTECTION LAYER          CAN BE BYPASSED?     WHO CAN BYPASS?         │
│  ────────────────────       ────────────────     ─────────────────       │
│                                                                          │
│  Code Obfuscation          Yes                  Expert developers       │
│  Client-side checks        Yes                  Intermediate devs       │
│  Server-side checks        No*                  Need server access      │
│  RSA Signatures            No                   Need private key        │
│  Domain Lock               No*                  Need license server     │
│                                                                          │
│  * Unless they host their own server (lose updates/support)             │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  IF SOMEONE CRACKS THE PLUGIN:                                          │
│  ─────────────────────────────                                           │
│                                                                          │
│  ❌ No automatic updates                                                 │
│  ❌ No bug fixes                                                         │
│  ❌ No security patches                                                  │
│  ❌ No customer support                                                  │
│  ❌ Legal action possible (watermark traceable)                         │
│  ❌ Domain blocked if detected                                           │
│                                                                          │
│  BOTTOM LINE:                                                            │
│  ────────────                                                            │
│  • This system prevents 95%+ of casual piracy                           │
│  • Remaining 5% are experts who could crack any software                │
│  • Even Adobe, Microsoft face this - it's industry reality              │
│  • Focus: Make legitimate purchase easier than piracy                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### License Server API - Complete Specification

```typescript
// License Server API Routes (https://api.llcpad.com/licenses)

// ═══════════════════════════════════════════════════════════════════════
// 1. VERIFY LICENSE (Called during activation & token refresh)
// ═══════════════════════════════════════════════════════════════════════

POST /api/licenses/verify

// Request
{
  "licenseKey": "LSP-PRO-A7B2K9M3-4X2Q",
  "domain": "customer-site.com",
  "pluginSlug": "livesupport-pro",
  "pluginVersion": "1.0.0",
  "cmsVersion": "1.2.0"
}

// Response (Success) - Returns signed JWT token
{
  "valid": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", // 7-day JWT
  "license": {
    "tier": "PROFESSIONAL",
    "features": ["chat", "tickets", "ai", "analytics"],
    "domainLockMode": "LOCKED",
    "maxDomains": 3,
    "activeDomains": 2,
    "expiresAt": "2027-02-01T00:00:00Z",
    "supportExpiresAt": "2027-02-01T00:00:00Z"
  }
}

// Response (Error)
{
  "valid": false,
  "error": "LICENSE_DOMAIN_LIMIT",
  "message": "License already activated on maximum domains",
  "details": {
    "maxDomains": 3,
    "activeDomains": ["site1.com", "site2.com", "site3.com"]
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. REFRESH TOKEN (Silent background refresh)
// ═══════════════════════════════════════════════════════════════════════

POST /api/licenses/refresh

// Request (includes current token for validation)
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "domain": "customer-site.com"
}

// Response - New token issued
{
  "valid": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." // New 7-day token
}

// ═══════════════════════════════════════════════════════════════════════
// 3. DEACTIVATE DOMAIN (Transfer license to new domain)
// ═══════════════════════════════════════════════════════════════════════

POST /api/licenses/deactivate

// Request
{
  "licenseKey": "LSP-PRO-A7B2K9M3-4X2Q",
  "domain": "old-site.com"
}

// Response
{
  "success": true,
  "remainingDomains": 2,
  "message": "Domain old-site.com deactivated. You can now activate on a new domain."
}

// ═══════════════════════════════════════════════════════════════════════
// 4. GENERATE LICENSE (Admin/Webhook - after purchase)
// ═══════════════════════════════════════════════════════════════════════

POST /api/licenses/generate
Authorization: Bearer {admin_api_key}

// Request
{
  "productSlug": "livesupport-pro",
  "tier": "PROFESSIONAL",
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "orderId": "envato-12345678",
  "domainLockMode": "LOCKED",  // or "UNLOCKED"
  "expiresAt": null,           // null = lifetime
  "supportExpiresAt": "2027-02-01T00:00:00Z"
}

// Response
{
  "success": true,
  "license": {
    "licenseKey": "LSP-PRO-X7K2M9N3-5Q2W",
    "tier": "PROFESSIONAL",
    "domainLockMode": "LOCKED",
    "maxDomains": 3,
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

---

## 🎉 Conclusion

This specification covers a complete, production-ready support system that can be:
1. **Sold as standalone product** on CodeCanyon
2. **Integrated into LLCPad CMS** as a plugin
3. **Extended to other platforms** (WordPress, Shopify) in future

### Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| **Architecture** | Monorepo (Turborepo + pnpm) | Standalone + Plugin from same codebase |
| **Real-time** | Socket.io | Free, self-hosted, low latency |
| **Redis** | Not initially | Not needed under 10K concurrent |
| **AI Provider** | OpenAI (configurable) | Best quality, affordable |
| **Database** | PostgreSQL + Prisma | Type-safe, reliable |

### CodeCanyon Products

| Product | Source | Price |
|---------|--------|-------|
| **LiveSupport Pro** | `apps/standalone/` | $59-299 |
| **LLCPad CMS** | Main CMS + `apps/llcpad-plugin/` | $69-149 |

**Timeline**: 10-12 weeks for full implementation (including AI)
**Complexity**: Medium-High
**Market Value**: $59-299 (Standalone), $69-149 (Full CMS)
**Potential Revenue**: High (two separate products)

---

**Next Steps:**
1. Review and approve this specification
2. Setup Monorepo structure (Turborepo + pnpm)
3. Create shared packages (core, ui, database, ai)
4. Build standalone app (`apps/standalone/`)
5. Build LLCPad plugin wrapper (`apps/llcpad-plugin/`)
6. Implement Socket.io server in core package
7. Build AI integration module
8. Prepare for CodeCanyon submission (two products)

**Questions or Changes?**
Let me know what needs to be adjusted or clarified!
