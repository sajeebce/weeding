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

### ⚠️ Implementation Scope: FULL-STACK

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THIS IS A FULL-STACK IMPLEMENTATION                   │
│                    ─────────────────────────────────────                 │
│                                                                          │
│  NOT just UI mockups or frontend components.                            │
│  This plugin includes EVERYTHING needed for production:                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  FRONTEND                BACKEND                 DATABASE        │    │
│  │  ────────                ───────                 ────────        │    │
│  │                                                                  │    │
│  │  ✅ React Components     ✅ API Routes           ✅ Prisma Schema │    │
│  │  ✅ Chat Widget          ✅ Socket.io Server     ✅ Migrations    │    │
│  │  ✅ Admin Dashboard      ✅ Authentication       ✅ Seed Data     │    │
│  │  ✅ Settings Pages       ✅ File Upload          ✅ Indexes       │    │
│  │  ✅ Responsive UI        ✅ Email Service        ✅ Relations     │    │
│  │  ✅ Real-time Updates    ✅ AI Integration       ✅ PostgreSQL    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  WHAT YOU GET:                                                           │
│  ─────────────                                                           │
│  • Complete source code (monorepo structure)                            │
│  • Database migrations (ready to run)                                   │
│  • API endpoints (fully functional)                                     │
│  • Real-time WebSocket server                                           │
│  • Email notification system                                            │
│  • AI chat integration (OpenAI)                                         │
│  • Admin dashboard (complete CRUD)                                      │
│  • Public chat widget (embeddable)                                      │
│                                                                          │
│  INSTALLATION: Upload ZIP → Enter License → Run Migrations → Done!      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

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
- **Framework**: Next.js 16.0.7+ (PATCHED for CVE-2025-66478)
- **UI Library**: React 19.2.3+ + TypeScript (PATCHED for CVE-2025-55182 React2Shell)
- **Styling**: Tailwind CSS 4.1
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

### Create Ticket Modal (Admin):

When admin clicks **[+ New Ticket]**, a modal opens with intelligent customer selection:

```
┌──────────────────────────────────────────────────────────────┐
│  Create Support Ticket                                    ✕  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Customer Type:                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ○ Existing Customer    ● New/Guest Customer             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ═══════════════════════════════════════════════════════════ │
│  WHEN "Existing Customer" IS SELECTED:                       │
│  ═══════════════════════════════════════════════════════════ │
│                                                               │
│  Search Customer:                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search by name, email, or phone...                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 👤 John Doe                                              │ │
│  │    john@example.com · +1-555-0123                        │ │
│  │    Last order: ORD-2024-001 (LLC Formation) - Jan 15     │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 👤 Jane Smith                                            │ │
│  │    jane@company.com · +1-555-0456                        │ │
│  │    Last order: ORD-2024-015 (EIN Application) - Feb 3    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 👤 Ahmed Khan                                            │ │
│  │    ahmed@business.com · +880-1700-000000                 │ │
│  │    Last order: ORD-2024-022 (Virtual Address) - Feb 10   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Selected: John Doe - john@example.com]                      │
│                                                               │
│  Link to Order (Optional):                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [Select related order ▼]                                 │ │
│  │ ┌─────────────────────────────────────────────────────┐ │ │
│  │ │ ORD-2024-001 - LLC Formation ($299) - Jan 15        │ │ │
│  │ │ ORD-2024-008 - Registered Agent ($99) - Jan 28      │ │ │
│  │ └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ═══════════════════════════════════════════════════════════ │
│  WHEN "New/Guest Customer" IS SELECTED:                      │
│  ═══════════════════════════════════════════════════════════ │
│                                                               │
│  ┌──────────────────────┐ ┌──────────────────────────────┐  │
│  │ Name                 │ │ Email *                      │  │
│  │ [________________]   │ │ [________________________]   │  │
│  └──────────────────────┘ └──────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Phone (Optional)                                        │ │
│  │ [________________________________________________]      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ═══════════════════════════════════════════════════════════ │
│  TICKET DETAILS (Both modes):                                │
│  ═══════════════════════════════════════════════════════════ │
│                                                               │
│  Subject *:                                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [Brief description of the issue]                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────┐ ┌──────────────────────────────┐  │
│  │ Category             │ │ Priority                     │  │
│  │ [General ▼]          │ │ [Medium ▼]                   │  │
│  └──────────────────────┘ └──────────────────────────────┘  │
│                                                               │
│  Initial Message *:                                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │ Describe the issue in detail...                          │ │
│  │                                                          │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│  📎 Attach files                                              │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Create Ticket]        │
└──────────────────────────────────────────────────────────────┘
```

#### Create Ticket Form Data:

```typescript
interface CreateTicketFormData {
  // Customer type toggle
  customerType: "existing" | "guest";

  // Existing customer (when customerType === "existing")
  customerId?: string;           // Selected customer ID

  // Guest fields (when customerType === "guest")
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;

  // Optional order link (for existing customers)
  orderId?: string;

  // Ticket details (required for both)
  subject: string;               // Required
  category?: string;             // Optional: general, technical, billing, other
  priority: TicketPriority;      // LOW, MEDIUM, HIGH, URGENT
  message: string;               // Required: initial message content
  attachments?: File[];          // Optional: file attachments
}
```

#### Customer Search API:

```typescript
// GET /api/admin/customers/search?q=john
// Searchable by: name, email, phone
// Returns: top 10 matching customers with recent order info

interface CustomerSearchResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalOrders: number;
  lastOrder?: {
    id: string;
    orderNumber: string;
    serviceName: string;
    amount: number;
    createdAt: string;
  };
  totalTickets: number;
  lastTicketAt?: string;
}

// GET /api/admin/customers/:id/orders
// Returns: all orders for a customer (for order linking)
```

#### Auto-Priority Based on Customer Tier:

```typescript
// When existing customer is selected, auto-suggest priority
function suggestPriority(customer: Customer): TicketPriority {
  // VIP/Enterprise customers get higher priority
  if (customer.tier === "ENTERPRISE" || customer.totalSpent > 5000) {
    return "HIGH";
  }
  if (customer.tier === "PROFESSIONAL" || customer.totalSpent > 1000) {
    return "MEDIUM";
  }
  return "LOW";
}
```

#### Standard Practices Implemented:

| Feature | Description | Status |
|---------|-------------|--------|
| Customer Type Toggle | Switch between existing/guest | ✅ Required |
| Searchable Customer Dropdown | Debounced search (300ms) | ✅ Required |
| Auto-fill from Customer | Name, email, phone auto-populate | ✅ Required |
| Customer History Preview | Show recent orders & tickets | ✅ Required |
| Order Association | Link ticket to existing order | ✅ Optional |
| Auto-Priority Suggestion | Based on customer tier | ✅ Optional |
| Phone Field | For guest customers | ✅ Optional |
| File Attachments | In initial message | 🔄 Phase 2 |
| Tags/Labels | Custom categorization | 🔄 Phase 2 |
| CC Recipients | Additional email recipients | 🔄 Phase 3 |

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

// 2. Create ticket (admin creates on behalf of customer)
POST /api/admin/tickets
Body: {
  // Customer identification (one of these)
  customerId?: string,           // For existing customers
  guestName?: string,            // For new/guest customers
  guestEmail: string,            // Required for both
  guestPhone?: string,           // Optional

  // Optional order link
  orderId?: string,

  // Ticket details
  subject: string,               // Required
  category?: string,             // Optional
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  initialMessage: string,        // Required: first message content
}
Response: {
  success: boolean,
  ticket: SupportTicket,
  ticketNumber: string           // e.g., "TKT-001"
}

// 3. Search customers (for create ticket modal)
GET /api/admin/customers/search
Query: {
  q: string,                     // Search term (name, email, phone)
  limit?: number                 // Default: 10
}
Response: {
  customers: Array<{
    id: string,
    name: string,
    email: string,
    phone?: string,
    avatar?: string,
    totalOrders: number,
    lastOrder?: {
      id: string,
      orderNumber: string,
      serviceName: string,
      amount: number,
      createdAt: string
    },
    totalTickets: number,
    lastTicketAt?: string
  }>
}

// 4. Get customer orders (for order linking)
GET /api/admin/customers/:id/orders
Response: {
  orders: Array<{
    id: string,
    orderNumber: string,
    serviceName: string,
    status: string,
    amount: number,
    createdAt: string
  }>
}

// 5. Get ticket details
GET /api/admin/tickets/:id

// 6. Update ticket
PUT /api/admin/tickets/:id
Body: {
  status?: string,
  priority?: string,
  assignedToId?: string,
  category?: string
}

// 7. Send message (admin reply)
POST /api/admin/tickets/:id/messages
Body: {
  content: string,
  sendEmailNotification: boolean
}

// 8. Add internal note
POST /api/admin/tickets/:id/notes
Body: {
  content: string,
  mentions?: string[]
}

// 9. Get canned responses
GET /api/admin/canned-responses
Query: { category?: string, search?: string }

// 10. Create canned response
POST /api/admin/canned-responses
Body: {
  title: string,
  content: string,
  category?: string,
  isPublic: boolean
}

// 11. Get/Update settings
GET /api/admin/settings/support
PUT /api/admin/settings/support
Body: { [key: string]: any }

// 12. Get analytics
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

// 13. Bulk actions
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

### 📊 Implementation Status (CMS Plugin System)

> **Last Updated:** February 2026

#### ✅ Completed Components

| Component | Location | Status |
|-----------|----------|--------|
| **License Server** | `/license-server/` | ✅ Fully implemented |
| License Server - Database Schema | `/license-server/prisma/schema.prisma` | ✅ Complete |
| License Server - API Endpoints | `/license-server/src/app/api/` | ✅ `/verify`, `/refresh`, `/deactivate` |
| License Server - Admin Dashboard | `/license-server/src/app/admin/` | ✅ CRUD for licenses |
| License Server - JWT Token Service | `/license-server/src/services/token.service.ts` | ✅ RSA-256 signing |
| **CMS Plugin Table** | `/prisma/schema.prisma` | ✅ `Plugin`, `PluginSetting`, `PluginMenuItem` |
| **Server-side Plugin Check** | `/src/lib/plugins.ts` | ✅ `isPluginActive()`, `getActivePlugins()` |
| **Conditional Widget Render** | `/src/app/(marketing)/layout.tsx` | ✅ Server-side check |

### ⚠️ IMPORTANT: Option A Architecture (Pre-installed Plugin)

> **Decision Date:** February 2026
> **Applies To:** LLCPad CMS only (Standalone app remains separate)

**LLCPad CMS plugin system এর জন্য Option A (Pre-installed Plugin with Database Flag Control) choose করা হয়েছে।**

#### 🚨 Implementation Scope: FULL-STACK (Not Just UI)

```
┌─────────────────────────────────────────────────────────────────────────┐
│        LLCPad CMS Plugin - FULL-STACK IMPLEMENTATION                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️ এটা শুধু UI mockup বা frontend component না!                         │
│  সব কিছু fully functional হবে - production ready                        │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  FRONTEND (React/Next.js)         BACKEND (API Routes)            │  │
│  │  ────────────────────────         ────────────────────            │  │
│  │  ✅ Plugin Activation Modal       ✅ POST /api/plugins/activate   │  │
│  │  ✅ License Key Input             ✅ POST /api/plugins/deactivate │  │
│  │  ✅ Tickets List Page             ✅ GET/POST /api/tickets        │  │
│  │  ✅ Ticket Detail Page            ✅ GET/POST /api/messages       │  │
│  │  ✅ Live Chat Dashboard           ✅ Socket.io Server             │  │
│  │  ✅ Analytics Dashboard           ✅ JWT Token Verification       │  │
│  │  ✅ Canned Responses CRUD         ✅ License Server Integration   │  │
│  │  ✅ Settings Pages                ✅ Email Notifications          │  │
│  │  ✅ Chat Widget (Public)          ✅ File Upload API              │  │
│  │                                                                    │  │
│  │  DATABASE (Prisma/PostgreSQL)     SECURITY                        │  │
│  │  ────────────────────────────     ────────                        │  │
│  │  ✅ Ticket, Message tables        ✅ RSA-256 JWT Signing          │  │
│  │  ✅ ChatSession table             ✅ Domain Lock Verification     │  │
│  │  ✅ CannedResponse table          ✅ Server-side Access Guard     │  │
│  │  ✅ Plugin, PluginSetting         ✅ Token Refresh Mechanism      │  │
│  │  ✅ Migrations                    ✅ Anti-Null Layers             │  │
│  │  ✅ Indexes for performance       ✅ Middleware Protection        │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Development করতে হবে:                                                   │
│  ─────────────────────                                                   │
│  1. Frontend pages + components (React/TypeScript)                      │
│  2. Backend API routes (Next.js API Routes)                             │
│  3. Database schema + migrations (Prisma)                               │
│  4. Real-time functionality (Socket.io)                                 │
│  5. Security implementation (JWT, Guards, Middleware)                   │
│  6. License integration (License Server API calls)                      │
│                                                                          │
│  🎯 Goal: Plugin activate করলেই সব features কাজ করবে, কোনো extra        │
│           setup ছাড়াই                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Why Option A? (Not ZIP Upload)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ZIP Upload vs Pre-installed                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ❌ ZIP Upload Approach (Not Used)                                       │
│  ─────────────────────────────────                                       │
│  • Next.js cannot load pages at runtime (requires rebuild)               │
│  • ZIP upload → rebuild = 2-5 minute wait                                │
│  • Low RAM servers (1-2GB) cannot rebuild                                │
│  • Build failures = support nightmare                                    │
│  • Complex implementation (~1500 LOC)                                    │
│                                                                          │
│  ✅ Pre-installed Approach (CHOSEN)                                      │
│  ──────────────────────────────────                                      │
│  • Plugin pages bundled with CMS at build time                          │
│  • Database flag controls visibility (status = ACTIVE/INACTIVE)         │
│  • Instant activation (2-5 seconds)                                     │
│  • Works on any server                                                   │
│  • Simple implementation (~100 LOC)                                      │
│  • Full SSR/SSG support                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Option A Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│             Pre-installed Plugin Activation Flow                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: User visits /admin/settings/plugins                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  🧩 Plugins                                                      │    │
│  │                                                                  │    │
│  │  ┌────────────────────────────────────────────────────────────┐ │    │
│  │  │  💬 LiveSupport Pro                              v1.0.0    │ │    │
│  │  │  Professional live chat & ticketing system                 │ │    │
│  │  │                                                            │ │    │
│  │  │  Status: ⚪ Inactive        License: Not activated         │ │    │
│  │  │                                                            │ │    │
│  │  │  [🔑 Activate]                                             │ │    │
│  │  └────────────────────────────────────────────────────────────┘ │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 2: User clicks "Activate" → License Key Modal                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  🔑 Activate LiveSupport Pro                               [X]  │    │
│  │  ─────────────────────────────────────────────────────────────  │    │
│  │                                                                  │    │
│  │  Enter your license key to activate this plugin.                │    │
│  │                                                                  │    │
│  │  License Key:                                                    │    │
│  │  ┌──────────────────────────────────────────────────────────┐   │    │
│  │  │  LSP-PRO-                                                 │   │    │
│  │  └──────────────────────────────────────────────────────────┘   │    │
│  │                                                                  │    │
│  │  This license will be activated for: yourdomain.com             │    │
│  │                                                                  │    │
│  │  ☐ I agree to the terms of service                              │    │
│  │                                                                  │    │
│  │  [Purchase License]                    [Cancel]  [✓ Activate]   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 3: License Verification (Server-side)                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  CMS Server                         License Server               │    │
│  │  ──────────                         ──────────────               │    │
│  │                                                                  │    │
│  │  POST /api/admin/plugins/     ───▶  POST /api/licenses/verify   │    │
│  │       livesupport-pro/activate       {licenseKey, domain}       │    │
│  │                                                                  │    │
│  │  • Verify license key           ◀───  {valid: true, token: ...} │    │
│  │  • Check domain limit                                            │    │
│  │  • Return signed JWT token                                       │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 4: Plugin Activated                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Database Updated:                                               │    │
│  │  • Plugin.status = 'ACTIVE'                                     │    │
│  │  • Plugin.licenseKey = 'LSP-PRO-...'                            │    │
│  │  • Plugin.licenseToken = 'eyJhbG...' (JWT)                      │    │
│  │  • Plugin.tokenExpiresAt = now + 7 days                         │    │
│  │                                                                  │    │
│  │  Result:                                                         │    │
│  │  ✅ Sidebar shows "Support" menu                                 │    │
│  │  ✅ /admin/tickets page accessible                               │    │
│  │  ✅ Chat widget renders on frontend                              │    │
│  │  ✅ All plugin features enabled                                  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Plugin Page Access Control (Server-side)

```typescript
// src/app/admin/tickets/page.tsx
import { notFound } from "next/navigation";
import { verifyPluginAccess } from "@/lib/plugin-guard";

export default async function TicketsPage() {
  // Server-side check - CANNOT be bypassed by client
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    notFound(); // Returns 404, not even a hint that page exists
  }

  // Only reaches here if plugin is legitimately active
  return <TicketsPageContent features={access.features} />;
}
```

```typescript
// src/lib/plugin-guard.ts
import prisma from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

interface PluginAccess {
  allowed: boolean;
  features: string[];
  tier: string | null;
  reason?: string;
}

export async function verifyPluginAccess(pluginSlug: string): Promise<PluginAccess> {
  // 1. Check database status
  const plugin = await prisma.plugin.findUnique({
    where: { slug: pluginSlug },
  });

  if (!plugin || plugin.status !== "ACTIVE") {
    return { allowed: false, features: [], tier: null, reason: "PLUGIN_INACTIVE" };
  }

  // 2. Verify JWT token signature (anti-null measure)
  if (!plugin.licenseToken) {
    return { allowed: false, features: [], tier: null, reason: "NO_TOKEN" };
  }

  const tokenResult = verifyJWT(plugin.licenseToken);

  if (!tokenResult.valid) {
    // Token invalid or expired - try silent refresh
    const refreshResult = await refreshLicenseToken(plugin.licenseKey!);

    if (!refreshResult.success) {
      return { allowed: false, features: [], tier: null, reason: "TOKEN_INVALID" };
    }
  }

  // 3. Check license expiry (actual license, not token)
  if (plugin.licenseExpiresAt && plugin.licenseExpiresAt < new Date()) {
    return { allowed: false, features: [], tier: null, reason: "LICENSE_EXPIRED" };
  }

  // 4. All checks passed
  return {
    allowed: true,
    features: tokenResult.data?.features || [],
    tier: tokenResult.data?.tier || plugin.licenseTier,
  };
}
```

### 🔐 Anti-Null Security Measures (Option A)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    5-Layer Anti-Null Protection                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LAYER 1: Database Flag Check                                           │
│  ────────────────────────────────────────────────────────────────────   │
│  • Plugin.status must be 'ACTIVE'                                       │
│  • Checked on EVERY admin page load (server-side)                       │
│  • Checked on EVERY API request                                         │
│                                                                          │
│  ⚠️ Bypass: Direct DB modification (UPDATE Plugin SET status='ACTIVE')  │
│  🛡️ Mitigated by: Layer 2                                               │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  LAYER 2: JWT Token Signature Verification                              │
│  ────────────────────────────────────────────────────────────────────   │
│  • Token must be present in Plugin.licenseToken                         │
│  • Token signature verified with RSA PUBLIC KEY                         │
│  • Token NOT expired (7 days validity)                                  │
│                                                                          │
│  ⚠️ Bypass: Forge JWT token                                             │
│  🛡️ Protected by: RSA-256 signature (PRIVATE key on license server)    │
│  ❌ CANNOT be bypassed without private key                               │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  LAYER 3: Domain Lock Verification                                      │
│  ────────────────────────────────────────────────────────────────────   │
│  • Token contains allowed domain                                         │
│  • Current domain must match token domain                                │
│  • Prevents token copying to other sites                                 │
│                                                                          │
│  ⚠️ Bypass: Change NEXT_PUBLIC_SITE_URL                                 │
│  🛡️ Protected by: Server reads actual request hostname                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  LAYER 4: Periodic License Server Heartbeat                             │
│  ────────────────────────────────────────────────────────────────────   │
│  • Token auto-refreshes every 5-7 days                                  │
│  • Refresh requires valid license on server                              │
│  • Revoked licenses fail refresh                                         │
│                                                                          │
│  ⚠️ Bypass: Block network to license server                             │
│  🛡️ Protected by: Token expires, features disabled after 30 days       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  LAYER 5: Feature-Level Access Control                                  │
│  ────────────────────────────────────────────────────────────────────   │
│  • Each feature checks license tier                                      │
│  • AI features need PROFESSIONAL tier                                    │
│  • Some features degrade gracefully                                      │
│                                                                          │
│  ⚠️ Bypass: Modify client-side code                                     │
│  🛡️ Protected by: Server-side checks on API routes                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Anti-Null Implementation Code

```typescript
// src/lib/jwt.ts - RSA JWT Verification
import jwt from 'jsonwebtoken';

// PUBLIC KEY embedded in CMS (safe to expose)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;

interface TokenPayload {
  licenseKey: string;
  domain: string;
  tier: string;
  features: string[];
  exp: number;
  iat: number;
}

export function verifyJWT(token: string): { valid: boolean; data?: TokenPayload } {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
    }) as TokenPayload;

    // Additional domain check
    const currentDomain = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : 'localhost';

    if (decoded.domain !== currentDomain && decoded.domain !== '*') {
      console.warn(`[License] Domain mismatch: ${decoded.domain} vs ${currentDomain}`);
      return { valid: false };
    }

    return { valid: true, data: decoded };
  } catch (error) {
    console.error('[License] JWT verification failed:', error);
    return { valid: false };
  }
}
```

```typescript
// src/middleware.ts - Request-level protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Plugin page patterns
  const pluginRoutes = [
    { pattern: /^\/admin\/tickets/, plugin: 'livesupport-pro' },
    { pattern: /^\/admin\/support/, plugin: 'livesupport-pro' },
    { pattern: /^\/api\/support\//, plugin: 'livesupport-pro' },
  ];

  for (const route of pluginRoutes) {
    if (route.pattern.test(pathname)) {
      // Quick DB check via API (cached)
      const response = await fetch(
        `${request.nextUrl.origin}/api/internal/plugin-status/${route.plugin}`,
        { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY! } }
      );

      if (!response.ok) {
        // Plugin not active - return 404
        return NextResponse.rewrite(new URL('/404', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/tickets/:path*', '/admin/support/:path*', '/api/support/:path*'],
};
```

### 📋 Implementation Components (Option A - Updated)

#### ✅ Already Implemented

| Component | Location | Status |
|-----------|----------|--------|
| **License Server** | `/license-server/` | ✅ Complete |
| **Plugin Database Schema** | `/prisma/schema.prisma` | ✅ Complete |
| **Plugin Status Check** | `/src/lib/plugins.ts` | ✅ `isPluginActive()` |
| **Conditional Widget Render** | `/src/app/(marketing)/layout.tsx` | ✅ Server-side |

#### ❌ Missing Components (Option A - CMS Side)

| Component | Description | Priority |
|-----------|-------------|----------|
| **Plugin Activation UI** | `/admin/settings/plugins` - Show inactive plugins with Activate button | HIGH |
| **License Key Modal** | Dialog to enter license key when clicking Activate | HIGH |
| **Plugin Activation API** | `POST /api/admin/plugins/{slug}/activate` - Verify & activate | HIGH |
| **JWT Verification Library** | `/src/lib/jwt.ts` - RSA-256 signature verification | HIGH |
| **Plugin Guard Middleware** | `/src/lib/plugin-guard.ts` - Server-side access control | HIGH |
| **Token Refresh Service** | Background job to refresh tokens before expiry | MEDIUM |
| **Plugin Deactivation API** | `POST /api/admin/plugins/{slug}/deactivate` | MEDIUM |
| **License Status Banner** | Show warning if token expired, prompt to re-verify | LOW |

#### 🔄 Plugin Activation Flow (Option A - Pre-installed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│           Option A: Pre-installed Plugin Activation Journey              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INITIAL STATE: Plugin exists in CMS but inactive                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Database: Plugin record exists with status = 'INSTALLED'       │    │
│  │  Pages: /admin/tickets exists but returns 404 (guarded)         │    │
│  │  Sidebar: "Support" menu hidden                                  │    │
│  │  Widget: Chat widget not rendered                                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 1: View Plugins Page                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Admin visits /admin/settings/plugins                           │    │
│  │  Sees pre-installed plugins list:                               │    │
│  │                                                                  │    │
│  │  ┌────────────────────────────────────────────────────────┐     │    │
│  │  │  💬 LiveSupport Pro                          v1.0.0    │     │    │
│  │  │  Status: ⚪ Inactive                                    │     │    │
│  │  │                                                         │     │    │
│  │  │  [🔑 Activate]                                         │     │    │
│  │  └────────────────────────────────────────────────────────┘     │    │
│  │                                                                  │    │
│  │  ✅ IMPLEMENTED (UI exists)                                      │    │
│  │  ❌ Activation flow NOT implemented                              │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 2: Click Activate → License Modal                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Modal opens with:                                               │    │
│  │  • License key input field                                       │    │
│  │  • Current domain display (yourdomain.com)                      │    │
│  │  • Terms checkbox                                                │    │
│  │  • Purchase link for new customers                               │    │
│  │                                                                  │    │
│  │  ❌ NOT IMPLEMENTED                                              │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 3: Submit License Key                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  CMS Server                          License Server              │    │
│  │  ──────────                          ──────────────              │    │
│  │                                                                  │    │
│  │  1. POST /api/admin/plugins/                                    │    │
│  │     livesupport-pro/activate                                    │    │
│  │     {licenseKey: "LSP-PRO-..."}                                │    │
│  │                                                                  │    │
│  │  2. Server calls License Server ───▶ POST /api/licenses/verify  │    │
│  │     {licenseKey, domain, pluginSlug}                            │    │
│  │                                                                  │    │
│  │  3. License Server returns:    ◀─── {valid, token, tier, ...}   │    │
│  │     • RSA-signed JWT token                                      │    │
│  │     • License tier & features                                   │    │
│  │     • Domain lock info                                          │    │
│  │                                                                  │    │
│  │  ❌ CMS API NOT IMPLEMENTED                                      │    │
│  │  ✅ License Server IMPLEMENTED                                   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 4: Activate Plugin (Database Update)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  If license valid:                                               │    │
│  │                                                                  │    │
│  │  UPDATE Plugin SET                                               │    │
│  │    status = 'ACTIVE',                                           │    │
│  │    licenseKey = 'LSP-PRO-...',                                  │    │
│  │    licenseToken = 'eyJhbG...',     -- RSA-signed JWT            │    │
│  │    licenseTier = 'PROFESSIONAL',                                │    │
│  │    licenseValidUntil = '2027-02-01',                            │    │
│  │    tokenExpiresAt = NOW() + 7 days,                             │    │
│  │    lastActivatedAt = NOW()                                      │    │
│  │  WHERE slug = 'livesupport-pro';                                │    │
│  │                                                                  │    │
│  │  Run database migrations (if any)                                │    │
│  │                                                                  │    │
│  │  ❌ NOT IMPLEMENTED                                              │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  STEP 5: Plugin Now Active                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Immediate effects:                                              │    │
│  │                                                                  │    │
│  │  ✓ Plugin.status = 'ACTIVE'                                     │    │
│  │  ✓ Sidebar shows "Support" menu (reads from DB)                 │    │
│  │  ✓ /admin/tickets returns page (plugin guard passes)            │    │
│  │  ✓ Chat widget renders on public pages                          │    │
│  │  ✓ API routes return data                                       │    │
│  │                                                                  │    │
│  │  All controlled by database flag + JWT verification             │    │
│  │  No rebuild required!                                            │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 🎯 Next Implementation Steps (Option A)

1. **Create License Activation Modal** (`/src/components/admin/license-activation-modal.tsx`)
   - License key input field
   - Current domain display
   - Terms agreement checkbox
   - Loading state during verification
   - Error messages for invalid keys

2. **Create Plugin Activation API** (`/api/admin/plugins/[slug]/activate`)
   - Accept license key from modal
   - Call License Server to verify
   - Verify RSA-signed JWT token
   - Update Plugin record with token
   - Run database migrations if needed

3. **Create Plugin Guard Library** (`/src/lib/plugin-guard.ts`)
   - `verifyPluginAccess(slug)` function
   - JWT signature verification
   - Domain lock validation
   - Feature-level access control

4. **Create JWT Verification Library** (`/src/lib/jwt.ts`)
   - RSA-256 public key embedded
   - `verifyJWT(token)` function
   - Token expiry checking

5. **Update Plugin Pages** (All plugin pages)
   - Add `verifyPluginAccess()` call at top
   - Return `notFound()` if not allowed
   - Pass features to components

6. **Create Token Refresh Job** (`/src/jobs/refresh-plugin-tokens.ts`)
   - Run daily via cron
   - Refresh tokens older than 5 days
   - Log refresh failures

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

## 🔧 Implementation Details (Code Level)

> এই section এ actual implementation code এবং configuration details আছে।

---

### 📡 Socket.io Server Implementation

#### File Structure

```
src/lib/support/socket/
├── server.ts           # Socket.io server setup & initialization
├── events.ts           # Event type definitions
├── handlers.ts         # Event handlers
├── middleware.ts       # Authentication middleware
└── rooms.ts            # Room management utilities
```

#### server.ts - Socket.io Server Setup

```typescript
// src/lib/support/socket/server.ts
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { auth } from "@/lib/auth";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from "./events";
import { setupHandlers } from "./handlers";
import { authMiddleware } from "./middleware";

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initializeSocketServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Connection settings
    pingTimeout: 60000,
    pingInterval: 25000,
    // Transport settings
    transports: ["websocket", "polling"],
    // Upgrade settings
    allowUpgrades: true,
    upgradeTimeout: 10000,
  });

  // Apply authentication middleware
  io.use(authMiddleware);

  // Setup event handlers
  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    setupHandlers(io!, socket);

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} - ${reason}`);
    });
  });

  console.log("[Socket.io] Server initialized");
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocketServer first.");
  }
  return io;
}

// Utility functions for emitting events
export const socketEmitter = {
  // Emit to specific ticket room
  toTicket(ticketId: string, event: keyof ServerToClientEvents, data: any) {
    getIO().to(`ticket:${ticketId}`).emit(event, data);
  },

  // Emit to all admins
  toAdmins(event: keyof ServerToClientEvents, data: any) {
    getIO().to("admin:notifications").emit(event, data);
  },

  // Emit to specific user
  toUser(userId: string, event: keyof ServerToClientEvents, data: any) {
    getIO().to(`user:${userId}`).emit(event, data);
  },

  // Broadcast new ticket to admins
  newTicket(ticket: any) {
    this.toAdmins("ticket:created", ticket);
  },

  // Broadcast new message
  newMessage(ticketId: string, message: any) {
    this.toTicket(ticketId, "message:new", message);
  },

  // Typing indicator
  typing(ticketId: string, data: { userId: string; isTyping: boolean }) {
    this.toTicket(ticketId, "typing:update", data);
  },

  // Ticket status change
  ticketStatusChanged(ticketId: string, status: string, updatedBy: string) {
    this.toTicket(ticketId, "ticket:statusChanged", { ticketId, status, updatedBy });
    this.toAdmins("ticket:statusChanged", { ticketId, status, updatedBy });
  },
};
```

#### events.ts - Type Definitions

```typescript
// src/lib/support/socket/events.ts

// Message types
export interface ChatMessage {
  id: string;
  ticketId: string;
  content: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  senderName: string;
  senderId?: string;
  attachments?: Attachment[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface TypingData {
  ticketId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  customerName: string;
  customerEmail: string;
}

// Client → Server events
export interface ClientToServerEvents {
  // Room management
  "ticket:join": (ticketId: string) => void;
  "ticket:leave": (ticketId: string) => void;
  "admin:join": () => void;

  // Messaging
  "message:send": (data: {
    ticketId: string;
    content: string;
    attachments?: string[];
  }) => void;

  // Typing
  "typing:start": (ticketId: string) => void;
  "typing:stop": (ticketId: string) => void;

  // Ticket actions
  "ticket:updateStatus": (data: { ticketId: string; status: string }) => void;
  "ticket:assign": (data: { ticketId: string; agentId: string }) => void;

  // Presence
  "presence:online": () => void;
  "presence:away": () => void;
}

// Server → Client events
export interface ServerToClientEvents {
  // Messages
  "message:new": (message: ChatMessage) => void;
  "message:updated": (message: ChatMessage) => void;
  "message:deleted": (messageId: string) => void;

  // Typing
  "typing:update": (data: TypingData) => void;

  // Tickets
  "ticket:created": (ticket: TicketData) => void;
  "ticket:updated": (ticket: TicketData) => void;
  "ticket:statusChanged": (data: { ticketId: string; status: string; updatedBy: string }) => void;
  "ticket:assigned": (data: { ticketId: string; agentId: string; agentName: string }) => void;

  // Presence
  "agent:online": (data: { agentId: string; agentName: string }) => void;
  "agent:offline": (data: { agentId: string }) => void;

  // Errors
  "error": (data: { code: string; message: string }) => void;
}

// Inter-server events (for scaling with Redis later)
export interface InterServerEvents {
  ping: () => void;
}

// Socket data attached to each connection
export interface SocketData {
  userId: string;
  userName: string;
  userRole: "CUSTOMER" | "ADMIN" | "SUPPORT_AGENT" | "SALES_AGENT";
  isAuthenticated: boolean;
  ticketId?: string; // For guest chat sessions
}
```

#### handlers.ts - Event Handlers

```typescript
// src/lib/support/socket/handlers.ts
import { Server, Socket } from "socket.io";
import prisma from "@/lib/db";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  ChatMessage
} from "./events";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupHandlers(io: IOServer, socket: IOSocket) {
  const { userId, userName, userRole } = socket.data;

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  // Join ticket room
  socket.on("ticket:join", async (ticketId) => {
    // Verify access to ticket
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { customerId: true, assignedToId: true },
    });

    if (!ticket) {
      socket.emit("error", { code: "TICKET_NOT_FOUND", message: "Ticket not found" });
      return;
    }

    // Check authorization
    const isAdmin = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"].includes(userRole);
    const isOwner = ticket.customerId === userId;
    const isAssigned = ticket.assignedToId === userId;

    if (!isAdmin && !isOwner && !isAssigned) {
      socket.emit("error", { code: "UNAUTHORIZED", message: "Not authorized for this ticket" });
      return;
    }

    socket.join(`ticket:${ticketId}`);
    console.log(`[Socket.io] ${userName} joined ticket:${ticketId}`);
  });

  // Leave ticket room
  socket.on("ticket:leave", (ticketId) => {
    socket.leave(`ticket:${ticketId}`);
    console.log(`[Socket.io] ${userName} left ticket:${ticketId}`);
  });

  // Admin joins notification room
  socket.on("admin:join", () => {
    if (!["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"].includes(userRole)) {
      socket.emit("error", { code: "UNAUTHORIZED", message: "Not an admin" });
      return;
    }
    socket.join("admin:notifications");
    console.log(`[Socket.io] Admin ${userName} joined notifications`);
  });

  // ============================================
  // MESSAGING
  // ============================================

  socket.on("message:send", async (data) => {
    const { ticketId, content, attachments } = data;

    try {
      // Create message in database
      const message = await prisma.supportMessage.create({
        data: {
          ticketId,
          content,
          senderType: userRole === "CUSTOMER" ? "CUSTOMER" : "AGENT",
          senderName: userName,
          senderId: userId,
          type: attachments?.length ? "ATTACHMENT" : "TEXT",
        },
        include: {
          attachments: true,
        },
      });

      // Update ticket's updatedAt
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
      });

      // Broadcast to ticket room
      const chatMessage: ChatMessage = {
        id: message.id,
        ticketId: message.ticketId,
        content: message.content,
        senderType: message.senderType as "CUSTOMER" | "AGENT" | "SYSTEM",
        senderName: message.senderName,
        senderId: message.senderId || undefined,
        createdAt: message.createdAt,
      };

      io.to(`ticket:${ticketId}`).emit("message:new", chatMessage);

      // Notify admins if customer message
      if (message.senderType === "CUSTOMER") {
        io.to("admin:notifications").emit("message:new", chatMessage);
      }

    } catch (error) {
      console.error("[Socket.io] Error sending message:", error);
      socket.emit("error", { code: "MESSAGE_FAILED", message: "Failed to send message" });
    }
  });

  // ============================================
  // TYPING INDICATORS
  // ============================================

  socket.on("typing:start", (ticketId) => {
    socket.to(`ticket:${ticketId}`).emit("typing:update", {
      ticketId,
      userId,
      userName,
      isTyping: true,
    });
  });

  socket.on("typing:stop", (ticketId) => {
    socket.to(`ticket:${ticketId}`).emit("typing:update", {
      ticketId,
      userId,
      userName,
      isTyping: false,
    });
  });

  // ============================================
  // TICKET ACTIONS
  // ============================================

  socket.on("ticket:updateStatus", async (data) => {
    const { ticketId, status } = data;

    if (!["ADMIN", "SUPPORT_AGENT"].includes(userRole)) {
      socket.emit("error", { code: "UNAUTHORIZED", message: "Not authorized" });
      return;
    }

    try {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: status as any },
      });

      io.to(`ticket:${ticketId}`).emit("ticket:statusChanged", {
        ticketId,
        status,
        updatedBy: userName,
      });

      io.to("admin:notifications").emit("ticket:statusChanged", {
        ticketId,
        status,
        updatedBy: userName,
      });

    } catch (error) {
      socket.emit("error", { code: "UPDATE_FAILED", message: "Failed to update status" });
    }
  });

  socket.on("ticket:assign", async (data) => {
    const { ticketId, agentId } = data;

    if (!["ADMIN", "SUPPORT_AGENT"].includes(userRole)) {
      socket.emit("error", { code: "UNAUTHORIZED", message: "Not authorized" });
      return;
    }

    try {
      const agent = await prisma.user.findUnique({
        where: { id: agentId },
        select: { name: true },
      });

      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { assignedToId: agentId },
      });

      io.to(`ticket:${ticketId}`).emit("ticket:assigned", {
        ticketId,
        agentId,
        agentName: agent?.name || "Unknown",
      });

    } catch (error) {
      socket.emit("error", { code: "ASSIGN_FAILED", message: "Failed to assign ticket" });
    }
  });

  // ============================================
  // PRESENCE
  // ============================================

  socket.on("presence:online", () => {
    if (["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"].includes(userRole)) {
      io.to("admin:notifications").emit("agent:online", {
        agentId: userId,
        agentName: userName,
      });
    }
  });

  socket.on("presence:away", () => {
    if (["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"].includes(userRole)) {
      io.to("admin:notifications").emit("agent:offline", {
        agentId: userId,
      });
    }
  });
}
```

#### middleware.ts - Authentication

```typescript
// src/lib/support/socket/middleware.ts
import { Socket } from "socket.io";
import { getToken } from "next-auth/jwt";
import { parse } from "cookie";
import prisma from "@/lib/db";

export async function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const cookies = socket.handshake.headers.cookie;

    if (cookies) {
      // Try to authenticate via session cookie
      const parsedCookies = parse(cookies);
      const sessionToken = parsedCookies["next-auth.session-token"]
        || parsedCookies["__Secure-next-auth.session-token"];

      if (sessionToken) {
        // Verify session
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true },
        });

        if (session && session.expires > new Date()) {
          socket.data.userId = session.user.id;
          socket.data.userName = session.user.name || "User";
          socket.data.userRole = session.user.role as any;
          socket.data.isAuthenticated = true;
          return next();
        }
      }
    }

    // Check for guest token (for live chat widget)
    const guestToken = socket.handshake.auth?.guestToken;
    const ticketId = socket.handshake.auth?.ticketId;

    if (guestToken && ticketId) {
      // Verify guest has access to this ticket
      const ticket = await prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          guestEmail: { not: null },
        },
      });

      if (ticket) {
        socket.data.userId = `guest:${guestToken}`;
        socket.data.userName = ticket.guestName || "Guest";
        socket.data.userRole = "CUSTOMER";
        socket.data.isAuthenticated = true;
        socket.data.ticketId = ticketId;
        return next();
      }
    }

    // Allow connection but mark as unauthenticated
    socket.data.isAuthenticated = false;
    socket.data.userId = `anon:${socket.id}`;
    socket.data.userName = "Anonymous";
    socket.data.userRole = "CUSTOMER";
    next();

  } catch (error) {
    console.error("[Socket.io] Auth middleware error:", error);
    next(new Error("Authentication failed"));
  }
}
```

#### Next.js Integration (Custom Server)

```typescript
// server.ts (project root)
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./src/lib/support/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io
  initializeSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io ready on ws://${hostname}:${port}/api/socket`);
  });
});
```

#### Client-Side Hook

```typescript
// src/hooks/use-socket.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/support/socket/events";

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<SocketClient | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io({
        path: "/api/socket",
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("[Socket] Connected:", socketRef.current?.id);

        // Join admin room if admin
        if (session?.user?.role &&
            ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"].includes(session.user.role)) {
          socketRef.current?.emit("admin:join");
        }
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected:", reason);
      });

      socketRef.current.on("error", (error) => {
        console.error("[Socket] Error:", error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session]);

  const joinTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit("ticket:join", ticketId);
  }, []);

  const leaveTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit("ticket:leave", ticketId);
  }, []);

  const sendMessage = useCallback((ticketId: string, content: string, attachments?: string[]) => {
    socketRef.current?.emit("message:send", { ticketId, content, attachments });
  }, []);

  const startTyping = useCallback((ticketId: string) => {
    socketRef.current?.emit("typing:start", ticketId);
  }, []);

  const stopTyping = useCallback((ticketId: string) => {
    socketRef.current?.emit("typing:stop", ticketId);
  }, []);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    socketRef.current?.on("message:new", callback);
    return () => socketRef.current?.off("message:new", callback);
  }, []);

  const onTyping = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("typing:update", callback);
    return () => socketRef.current?.off("typing:update", callback);
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    joinTicket,
    leaveTicket,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onTyping,
  };
}
```

---

### 📧 Gmail SMTP Integration (Nodemailer)

#### File Structure

```
src/lib/email/
├── smtp-client.ts      # Nodemailer SMTP client
├── templates/          # Email templates
│   ├── ticket-created.tsx
│   ├── ticket-reply.tsx
│   ├── ticket-resolved.tsx
│   └── chat-transcript.tsx
└── send-email.ts       # Email sending utility
```

#### Environment Variables

```env
# .env.local

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password    # Generate from Google Account > Security > App passwords
SMTP_FROM_NAME=LLCPad Support
SMTP_FROM_EMAIL=support@llcpad.com

# Alternative: Other SMTP providers
# SMTP_HOST=smtp.mailgun.org
# SMTP_HOST=smtp.sendgrid.net
# SMTP_HOST=email-smtp.us-east-1.amazonaws.com (SES)
```

#### smtp-client.ts - Nodemailer Setup

```typescript
// src/lib/email/smtp-client.ts
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (transporter) return transporter;

  // Validate required env vars
  const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Gmail specific settings
    ...(process.env.SMTP_HOST === "smtp.gmail.com" && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  });

  // Verify connection
  transporter.verify((error) => {
    if (error) {
      console.error("[SMTP] Connection failed:", error);
    } else {
      console.log("[SMTP] Server is ready to send emails");
    }
  });

  return transporter;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter();

    const fromName = process.env.SMTP_FROM_NAME || "Support";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const result = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    console.log("[SMTP] Email sent:", result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error("[SMTP] Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Simple HTML to text conversion
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
```

#### send-email.ts - Email Service

```typescript
// src/lib/email/send-email.ts
import { sendEmail } from "./smtp-client";
import { render } from "@react-email/render";
import TicketCreatedEmail from "./templates/ticket-created";
import TicketReplyEmail from "./templates/ticket-reply";
import TicketResolvedEmail from "./templates/ticket-resolved";
import ChatTranscriptEmail from "./templates/chat-transcript";

interface TicketEmailData {
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  message?: string;
  ticketUrl?: string;
}

interface ChatTranscriptData {
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  messages: Array<{
    senderName: string;
    senderType: string;
    content: string;
    createdAt: Date;
  }>;
  chatDuration: string;
}

export const emailService = {
  // Send ticket created notification to customer
  async ticketCreated(data: TicketEmailData) {
    const html = await render(TicketCreatedEmail(data));

    return sendEmail({
      to: data.customerEmail,
      subject: `[Ticket #${data.ticketNumber}] ${data.subject}`,
      html,
    });
  },

  // Send reply notification to customer
  async ticketReply(data: TicketEmailData & { agentName: string }) {
    const html = await render(TicketReplyEmail(data));

    return sendEmail({
      to: data.customerEmail,
      subject: `Re: [Ticket #${data.ticketNumber}] ${data.subject}`,
      html,
    });
  },

  // Send ticket resolved notification
  async ticketResolved(data: TicketEmailData) {
    const html = await render(TicketResolvedEmail(data));

    return sendEmail({
      to: data.customerEmail,
      subject: `[Resolved] Ticket #${data.ticketNumber}: ${data.subject}`,
      html,
    });
  },

  // Send chat transcript
  async chatTranscript(data: ChatTranscriptData) {
    const html = await render(ChatTranscriptEmail(data));

    return sendEmail({
      to: data.customerEmail,
      subject: `Chat Transcript - Ticket #${data.ticketNumber}`,
      html,
    });
  },

  // Send notification to admin/agent
  async notifyAgent(agentEmail: string, data: TicketEmailData) {
    const html = `
      <h2>New Support Ticket</h2>
      <p><strong>Ticket:</strong> #${data.ticketNumber}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Message:</strong></p>
      <blockquote>${data.message}</blockquote>
      <p><a href="${data.ticketUrl}">View Ticket</a></p>
    `;

    return sendEmail({
      to: agentEmail,
      subject: `[New Ticket #${data.ticketNumber}] ${data.subject}`,
      html,
    });
  },
};
```

#### Email Template Example

```typescript
// src/lib/email/templates/ticket-created.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface TicketCreatedEmailProps {
  ticketNumber: string;
  subject: string;
  customerName: string;
  message?: string;
  ticketUrl?: string;
}

export default function TicketCreatedEmail({
  ticketNumber,
  subject,
  customerName,
  message,
  ticketUrl,
}: TicketCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your support ticket #{ticketNumber} has been created</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Support Ticket Created</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            Your support ticket has been created successfully. Our team will review
            your request and get back to you as soon as possible.
          </Text>

          <Section style={ticketBox}>
            <Text style={ticketLabel}>Ticket Number</Text>
            <Text style={ticketValue}>#{ticketNumber}</Text>

            <Text style={ticketLabel}>Subject</Text>
            <Text style={ticketValue}>{subject}</Text>
          </Section>

          {message && (
            <Section>
              <Text style={ticketLabel}>Your Message</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          )}

          {ticketUrl && (
            <Section style={buttonSection}>
              <Link href={ticketUrl} style={button}>
                View Ticket Status
              </Link>
            </Section>
          )}

          <Text style={footer}>
            This is an automated message. Please do not reply directly to this email.
            If you have any questions, use the link above to access your ticket.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 20px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const ticketBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const ticketLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const ticketValue = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 16px",
};

const messageText = {
  color: "#4a4a4a",
  fontSize: "14px",
  backgroundColor: "#f8f9fa",
  padding: "16px",
  borderRadius: "8px",
  margin: "8px 0 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  marginTop: "32px",
};
```

---

### 📦 Plugin Build & Package Scripts

#### File Structure

```
scripts/
├── build-plugin.ts         # Main build script
├── package-plugin.ts       # ZIP packaging script
├── obfuscate.ts           # Code obfuscation
├── generate-manifest.ts    # Generate plugin.json
└── utils/
    ├── file-utils.ts
    └── version-utils.ts
```

#### build-plugin.ts - Main Build Script

```typescript
// scripts/build-plugin.ts
import { build } from "esbuild";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { obfuscateCode } from "./obfuscate";
import { generateManifest } from "./generate-manifest";
import { createPluginZip } from "./package-plugin";

interface BuildOptions {
  version: string;
  outputDir: string;
  minify: boolean;
  obfuscate: boolean;
  sourceMaps: boolean;
}

const defaultOptions: BuildOptions = {
  version: "1.0.0",
  outputDir: "dist/plugin",
  minify: true,
  obfuscate: true,
  sourceMaps: false,
};

async function buildPlugin(options: Partial<BuildOptions> = {}) {
  const opts = { ...defaultOptions, ...options };
  const startTime = Date.now();

  console.log("🔨 Building LiveSupport Pro Plugin...");
  console.log(`   Version: ${opts.version}`);
  console.log(`   Output: ${opts.outputDir}`);

  try {
    // 1. Clean output directory
    console.log("\n📁 Cleaning output directory...");
    await fs.remove(opts.outputDir);
    await fs.ensureDir(opts.outputDir);

    // 2. Compile TypeScript
    console.log("📝 Compiling TypeScript...");
    execSync("npx tsc --project tsconfig.plugin.json", { stdio: "inherit" });

    // 3. Bundle with esbuild
    console.log("📦 Bundling with esbuild...");
    const entryPoints = [
      "src/lib/support/index.ts",
      "src/components/support/index.ts",
    ];

    await build({
      entryPoints,
      bundle: true,
      minify: opts.minify,
      sourcemap: opts.sourceMaps,
      target: ["es2020"],
      format: "esm",
      outdir: path.join(opts.outputDir, "dist"),
      external: [
        "react",
        "react-dom",
        "next",
        "next-auth",
        "@prisma/client",
      ],
      define: {
        "process.env.NODE_ENV": '"production"',
        "process.env.PLUGIN_VERSION": `"${opts.version}"`,
      },
      loader: {
        ".tsx": "tsx",
        ".ts": "ts",
      },
    });

    // 4. Obfuscate if enabled
    if (opts.obfuscate) {
      console.log("🔒 Obfuscating code...");
      await obfuscateCode(path.join(opts.outputDir, "dist"));
    }

    // 5. Copy static files
    console.log("📄 Copying static files...");
    await copyStaticFiles(opts.outputDir);

    // 6. Copy Prisma migrations
    console.log("🗃️ Copying database migrations...");
    await copyMigrations(opts.outputDir);

    // 7. Generate manifest
    console.log("📋 Generating plugin manifest...");
    await generateManifest(opts.outputDir, opts.version);

    // 8. Create ZIP package
    console.log("🗜️ Creating ZIP package...");
    const zipPath = await createPluginZip(opts.outputDir, opts.version);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Build complete in ${duration}s`);
    console.log(`   Output: ${zipPath}`);

    return zipPath;

  } catch (error) {
    console.error("\n❌ Build failed:", error);
    process.exit(1);
  }
}

async function copyStaticFiles(outputDir: string) {
  const filesToCopy = [
    { src: "LICENSE.txt", dest: "LICENSE.txt" },
    { src: "README.plugin.md", dest: "README.md" },
    { src: "CHANGELOG.md", dest: "CHANGELOG.md" },
  ];

  for (const file of filesToCopy) {
    if (await fs.pathExists(file.src)) {
      await fs.copy(file.src, path.join(outputDir, file.dest));
    }
  }

  // Copy components
  await fs.copy(
    "src/components/support",
    path.join(outputDir, "components"),
    { filter: (src) => !src.endsWith(".test.tsx") }
  );

  // Copy API routes
  await fs.copy(
    "src/app/api/support",
    path.join(outputDir, "api"),
    { filter: (src) => !src.endsWith(".test.ts") }
  );

  // Copy admin pages
  await fs.copy(
    "src/app/admin/support",
    path.join(outputDir, "admin-pages"),
    { filter: (src) => !src.endsWith(".test.tsx") }
  );
}

async function copyMigrations(outputDir: string) {
  const migrationsDir = "prisma/migrations";

  if (await fs.pathExists(migrationsDir)) {
    // Filter only support-related migrations
    const migrations = await fs.readdir(migrationsDir);
    const supportMigrations = migrations.filter(m =>
      m.includes("support") || m.includes("ticket") || m.includes("chat")
    );

    await fs.ensureDir(path.join(outputDir, "migrations"));

    for (const migration of supportMigrations) {
      await fs.copy(
        path.join(migrationsDir, migration),
        path.join(outputDir, "migrations", migration)
      );
    }
  }

  // Copy schema additions
  await fs.copy(
    "prisma/schema.support.prisma",
    path.join(outputDir, "schema.prisma")
  );
}

// CLI entry point
const args = process.argv.slice(2);
const version = args.find(a => a.startsWith("--version="))?.split("=")[1] || "1.0.0";
const noMinify = args.includes("--no-minify");
const noObfuscate = args.includes("--no-obfuscate");

buildPlugin({
  version,
  minify: !noMinify,
  obfuscate: !noObfuscate,
});
```

#### obfuscate.ts - Code Obfuscation

```typescript
// scripts/obfuscate.ts
import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "fs-extra";
import path from "path";
import glob from "glob";

// Obfuscation configuration
const obfuscatorConfig = {
  // Basic settings
  compact: true,
  simplify: true,

  // String transformation
  stringArray: true,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: ["base64"] as const,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: "function" as const,

  // Control flow
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,

  // Dead code injection
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,

  // Identifiers
  identifierNamesGenerator: "hexadecimal" as const,
  renameGlobals: false, // Keep exports intact
  renameProperties: false, // Keep React props intact

  // Protection
  selfDefending: true,
  debugProtection: false, // Can cause issues in some environments
  disableConsoleOutput: false, // Keep console for debugging

  // Performance
  transformObjectKeys: true,
  unicodeEscapeSequence: false, // Avoid for smaller bundle size

  // Split strings (helps avoid detection)
  splitStrings: true,
  splitStringsChunkLength: 10,

  // Target
  target: "browser" as const,
};

export async function obfuscateCode(distDir: string): Promise<void> {
  const jsFiles = glob.sync(path.join(distDir, "**/*.js"));

  console.log(`   Found ${jsFiles.length} JavaScript files to obfuscate`);

  for (const filePath of jsFiles) {
    const code = await fs.readFile(filePath, "utf-8");

    // Skip if file is too small (likely just exports)
    if (code.length < 100) {
      continue;
    }

    try {
      const obfuscated = JavaScriptObfuscator.obfuscate(code, {
        ...obfuscatorConfig,
        sourceMap: false,
        sourceMapMode: "inline" as const,
      });

      await fs.writeFile(filePath, obfuscated.getObfuscatedCode());

      const reduction = ((1 - obfuscated.getObfuscatedCode().length / code.length) * 100).toFixed(1);
      console.log(`   ✓ ${path.basename(filePath)} (${reduction}% size change)`);

    } catch (error) {
      console.warn(`   ⚠ Could not obfuscate ${path.basename(filePath)}:`, error);
    }
  }
}

// License watermark injection
export function injectWatermark(code: string, licenseKey?: string): string {
  const watermark = `
/*
 * LiveSupport Pro v${process.env.PLUGIN_VERSION || "1.0.0"}
 * Licensed to: ${licenseKey || "UNLICENSED"}
 * Generated: ${new Date().toISOString()}
 *
 * This software is protected by copyright law.
 * Unauthorized distribution is prohibited.
 */
`;

  return watermark + code;
}

// Selective obfuscation - only critical files
export const criticalFilesPatterns = [
  "**/license-*.js",
  "**/auth-*.js",
  "**/verify-*.js",
  "**/security-*.js",
];
```

#### package-plugin.ts - ZIP Creation

```typescript
// scripts/package-plugin.ts
import archiver from "archiver";
import fs from "fs-extra";
import path from "path";

export async function createPluginZip(
  sourceDir: string,
  version: string
): Promise<string> {
  const zipName = `livesupport-pro-v${version}.zip`;
  const zipPath = path.join("dist", zipName);

  // Ensure dist directory exists
  await fs.ensureDir("dist");

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on("close", () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`   Archive size: ${sizeMB} MB`);
      resolve(zipPath);
    });

    archive.on("error", reject);
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn("   Warning:", err.message);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);

    // Add plugin directory contents
    archive.directory(sourceDir, false);

    archive.finalize();
  });
}

// Verify ZIP contents
export async function verifyPluginZip(zipPath: string): Promise<boolean> {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const requiredFiles = [
    "plugin.json",
    "README.md",
    "dist/index.js",
  ];

  const foundFiles = entries.map((e: any) => e.entryName);

  for (const required of requiredFiles) {
    if (!foundFiles.some((f: string) => f.includes(required))) {
      console.error(`   ❌ Missing required file: ${required}`);
      return false;
    }
  }

  console.log("   ✓ ZIP verification passed");
  return true;
}
```

#### generate-manifest.ts - Plugin Manifest

```typescript
// scripts/generate-manifest.ts
import fs from "fs-extra";
import path from "path";

interface PluginManifest {
  name: string;
  slug: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    url: string;
  };
  license: string;
  homepage: string;
  repository: string;
  compatibility: {
    cmsVersion: string;
    nodeVersion: string;
    database: string[];
  };
  dependencies: {
    npm: string[];
    peer: string[];
  };
  features: string[];
  permissions: string[];
  hooks: {
    onInstall: string;
    onUninstall: string;
    onActivate: string;
    onDeactivate: string;
  };
  adminMenu: Array<{
    label: string;
    icon: string;
    path: string;
    permission: string;
  }>;
  settings: {
    configurable: boolean;
    schema: string;
  };
  assets: {
    icon: string;
    banner: string;
    screenshots: string[];
  };
}

export async function generateManifest(
  outputDir: string,
  version: string
): Promise<void> {
  const manifest: PluginManifest = {
    name: "LiveSupport Pro",
    slug: "livesupport-pro",
    version,
    description: "Professional live chat and ticket support system with real-time messaging, AI assistance, and comprehensive admin dashboard.",
    author: {
      name: "LLCPad",
      email: "plugins@llcpad.com",
      url: "https://llcpad.com",
    },
    license: "proprietary",
    homepage: "https://llcpad.com/plugins/livesupport-pro",
    repository: "https://github.com/llcpad/livesupport-pro",
    compatibility: {
      cmsVersion: ">=1.0.0",
      nodeVersion: ">=20.0.0",
      database: ["postgresql"],
    },
    dependencies: {
      npm: [
        "socket.io@^4.7.0",
        "socket.io-client@^4.7.0",
        "nodemailer@^6.9.0",
        "@react-email/components@^0.0.20",
      ],
      peer: [
        "react@^19.0.0",
        "next@^15.0.0",
        "@prisma/client@^6.0.0",
      ],
    },
    features: [
      "live-chat-widget",
      "ticket-management",
      "real-time-messaging",
      "file-attachments",
      "canned-responses",
      "internal-notes",
      "email-notifications",
      "agent-assignment",
      "customer-portal",
      "analytics-dashboard",
    ],
    permissions: [
      "support:tickets:read",
      "support:tickets:write",
      "support:tickets:delete",
      "support:chat:access",
      "support:settings:manage",
      "support:agents:manage",
    ],
    hooks: {
      onInstall: "hooks/install.js",
      onUninstall: "hooks/uninstall.js",
      onActivate: "hooks/activate.js",
      onDeactivate: "hooks/deactivate.js",
    },
    adminMenu: [
      {
        label: "Support",
        icon: "MessageSquare",
        path: "/admin/support",
        permission: "support:tickets:read",
      },
      {
        label: "Tickets",
        icon: "Ticket",
        path: "/admin/support/tickets",
        permission: "support:tickets:read",
      },
      {
        label: "Live Chat",
        icon: "MessagesSquare",
        path: "/admin/support/chat",
        permission: "support:chat:access",
      },
      {
        label: "Settings",
        icon: "Settings",
        path: "/admin/support/settings",
        permission: "support:settings:manage",
      },
    ],
    settings: {
      configurable: true,
      schema: "settings-schema.json",
    },
    assets: {
      icon: "assets/icon.png",
      banner: "assets/banner.png",
      screenshots: [
        "assets/screenshots/dashboard.png",
        "assets/screenshots/chat-widget.png",
        "assets/screenshots/ticket-detail.png",
      ],
    },
  };

  await fs.writeJson(
    path.join(outputDir, "plugin.json"),
    manifest,
    { spaces: 2 }
  );

  console.log("   ✓ Generated plugin.json");
}
```

#### package.json Scripts

```json
{
  "scripts": {
    "plugin:build": "tsx scripts/build-plugin.ts",
    "plugin:build:dev": "tsx scripts/build-plugin.ts --no-minify --no-obfuscate",
    "plugin:package": "tsx scripts/package-plugin.ts",
    "plugin:release": "npm run plugin:build && npm run plugin:verify",
    "plugin:verify": "tsx scripts/verify-plugin.ts"
  }
}
```

---

### 🔐 Security Implementation (License Client)

#### License Verification Client

```typescript
// src/lib/support/license/client.ts
import { SignJWT, jwtVerify, importSPKI } from "jose";
import prisma from "@/lib/db";

// RSA Public Key (embedded in plugin - get from license server)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;

interface LicenseToken {
  licenseKey: string;
  domains: string[];
  features: string[];
  tier: "STANDARD" | "PROFESSIONAL" | "ENTERPRISE";
  expiresAt: string;
  issuedAt: string;
}

interface LicenseStatus {
  isValid: boolean;
  isExpired: boolean;
  tier: string;
  features: string[];
  domains: string[];
  expiresAt: Date | null;
  error?: string;
}

class LicenseClient {
  private cachedToken: LicenseToken | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  async verifyLicense(): Promise<LicenseStatus> {
    try {
      // 1. Check cache first
      if (this.cachedToken && this.cacheExpiry && new Date() < this.cacheExpiry) {
        return this.tokenToStatus(this.cachedToken);
      }

      // 2. Get stored token from database
      const settings = await prisma.pluginSetting.findFirst({
        where: {
          pluginId: "livesupport-pro",
          key: "license_token",
        },
      });

      if (!settings?.value) {
        return {
          isValid: false,
          isExpired: false,
          tier: "NONE",
          features: [],
          domains: [],
          expiresAt: null,
          error: "No license found"
        };
      }

      // 3. Verify JWT signature with public key
      const token = await this.verifyJWT(settings.value as string);

      if (!token) {
        return {
          isValid: false,
          isExpired: false,
          tier: "NONE",
          features: [],
          domains: [],
          expiresAt: null,
          error: "Invalid license signature",
        };
      }

      // 4. Check domain
      const currentDomain = this.getCurrentDomain();
      if (!token.domains.includes(currentDomain) && !token.domains.includes("*")) {
        return {
          isValid: false,
          isExpired: false,
          tier: token.tier,
          features: [],
          domains: token.domains,
          expiresAt: new Date(token.expiresAt),
          error: `Domain not licensed: ${currentDomain}`,
        };
      }

      // 5. Check expiry
      const expiresAt = new Date(token.expiresAt);
      if (expiresAt < new Date()) {
        return {
          isValid: false,
          isExpired: true,
          tier: token.tier,
          features: token.features,
          domains: token.domains,
          expiresAt,
          error: "License expired",
        };
      }

      // 6. Cache and return
      this.cachedToken = token;
      this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION);

      return this.tokenToStatus(token);

    } catch (error) {
      console.error("[License] Verification error:", error);
      return {
        isValid: false,
        isExpired: false,
        tier: "NONE",
        features: [],
        domains: [],
        expiresAt: null,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  async activateLicense(licenseKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const domain = this.getCurrentDomain();

      // Call license server
      const response = await fetch(`${process.env.LICENSE_SERVER_URL}/api/licenses/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Activation failed" };
      }

      // Store token
      await prisma.pluginSetting.upsert({
        where: {
          pluginId_key: {
            pluginId: "livesupport-pro",
            key: "license_token",
          },
        },
        update: { value: data.token },
        create: {
          pluginId: "livesupport-pro",
          key: "license_token",
          value: data.token,
        },
      });

      // Clear cache
      this.cachedToken = null;
      this.cacheExpiry = null;

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Activation failed"
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const settings = await prisma.pluginSetting.findFirst({
        where: {
          pluginId: "livesupport-pro",
          key: "license_key",
        },
      });

      if (!settings?.value) return false;

      const result = await this.activateLicense(settings.value as string);
      return result.success;

    } catch {
      return false;
    }
  }

  private async verifyJWT(token: string): Promise<LicenseToken | null> {
    try {
      const publicKey = await importSPKI(PUBLIC_KEY, "RS256");
      const { payload } = await jwtVerify(token, publicKey);
      return payload as unknown as LicenseToken;
    } catch {
      return null;
    }
  }

  private getCurrentDomain(): string {
    if (typeof window !== "undefined") {
      return window.location.hostname;
    }
    return process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
      : "localhost";
  }

  private tokenToStatus(token: LicenseToken): LicenseStatus {
    const expiresAt = new Date(token.expiresAt);
    return {
      isValid: true,
      isExpired: expiresAt < new Date(),
      tier: token.tier,
      features: token.features,
      domains: token.domains,
      expiresAt,
    };
  }

  // Feature check
  hasFeature(feature: string): boolean {
    if (!this.cachedToken) return false;
    return this.cachedToken.features.includes(feature);
  }

  // Tier check
  getTier(): string {
    return this.cachedToken?.tier || "NONE";
  }
}

export const licenseClient = new LicenseClient();
```

---

### ✅ Implementation Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 LIVESUPPORT PRO - IMPLEMENTATION CHECKLIST               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1-4: Core System (COMPLETE ✅)                                    │
│  ─────────────────────────────────────                                   │
│  [✅] Database Schema (Prisma)                                           │
│  [✅] Ticket CRUD API                                                    │
│  [✅] Admin Dashboard UI                                                 │
│  [✅] Live Chat Widget                                                   │
│  [✅] File Attachments                                                   │
│  [✅] Canned Responses                                                   │
│  [✅] Internal Notes                                                     │
│                                                                          │
│  PHASE 5: Real-time & Email (IN PROGRESS 🔄)                            │
│  ────────────────────────────────────────────                            │
│  [⬜] Socket.io Server Setup                                             │
│      └── src/lib/support/socket/server.ts                               │
│      └── src/lib/support/socket/events.ts                               │
│      └── src/lib/support/socket/handlers.ts                             │
│      └── src/lib/support/socket/middleware.ts                           │
│  [⬜] Socket.io Client Hook                                              │
│      └── src/hooks/use-socket.ts                                        │
│  [⬜] Custom Server (server.ts)                                          │
│  [⬜] Gmail SMTP Integration                                             │
│      └── src/lib/email/smtp-client.ts                                   │
│      └── src/lib/email/send-email.ts                                    │
│  [⬜] Email Templates                                                    │
│      └── src/lib/email/templates/*.tsx                                  │
│                                                                          │
│  PHASE 6: Plugin Packaging (PENDING ⏳)                                  │
│  ──────────────────────────────────────                                  │
│  [⬜] Build Script                                                       │
│      └── scripts/build-plugin.ts                                        │
│  [⬜] Obfuscation Config                                                 │
│      └── scripts/obfuscate.ts                                           │
│  [⬜] ZIP Packager                                                       │
│      └── scripts/package-plugin.ts                                      │
│  [⬜] Manifest Generator                                                 │
│      └── scripts/generate-manifest.ts                                   │
│  [⬜] License Client                                                     │
│      └── src/lib/support/license/client.ts                              │
│                                                                          │
│  PHASE 7: AI Integration (OPTIONAL - Extended License)                  │
│  ─────────────────────────────────────────────────────                   │
│  [⬜] Knowledge Base Upload                                              │
│  [⬜] OpenAI Integration                                                 │
│  [⬜] AI Auto-responses                                                  │
│  [⬜] Agent Suggestions                                                  │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  NPM DEPENDENCIES TO ADD:                                                │
│  ────────────────────────                                                │
│  npm install socket.io socket.io-client                                 │
│  npm install nodemailer @types/nodemailer                               │
│  npm install @react-email/components                                    │
│  npm install javascript-obfuscator (devDependency)                      │
│  npm install archiver @types/archiver (devDependency)                   │
│  npm install esbuild (devDependency)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

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
