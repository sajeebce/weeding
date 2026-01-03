# Service Page Redesign Plan

## Overview

এই document টি service pages (যেমন `/services/llc-formation`) এর নতুন design plan বর্ণনা করে। বর্তমান two-column layout (left: description, right: packages) এর বদলে একটি full-width, section-based layout প্রস্তাব করা হচ্ছে যেখানে package comparison table থাকবে।

---

## Current Problems

| সমস্যা | বর্ণনা |
|--------|--------|
| White Space | Left side এ "What's Included" section এর নিচে অনেক empty space |
| Hard to Compare | Package cards আলাদা আলাদা - features compare করা কঠিন |
| Mobile UX | Packages একের পর এক দেখায়, comparison friendly না |
| Unbalanced Layout | Left side ছোট, right side অনেক লম্বা |

---

## Proposed Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION 1: Hero (Full Width)                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION 2: What's Included (Full Width Grid)                       │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION 3: Package Comparison Table (Scrollable)                   │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION 4: Long Description / Detailed Content                     │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION 5: FAQ Accordion                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Hero

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [Icon]                                                             │
│                                                                     │
│  LLC Formation                                                      │
│  ════════════════                                                   │
│                                                                     │
│  Launch your US business in 24-48 hours. No SSN required.           │
│  Trusted by 10,000+ international entrepreneurs from                │
│  Bangladesh, India, Pakistan & 50+ countries.                       │
│                                                                     │
│  [Get Started - From $199  →]    [Ask a Question]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Specifications
| Element | Style |
|---------|-------|
| Icon | 48x48px, primary color background, rounded |
| Title | text-4xl / text-5xl, font-bold |
| Description | text-lg, text-muted-foreground, max-w-2xl |
| Primary CTA | Primary button with arrow icon |
| Secondary CTA | Outline button |
| Spacing | py-12 to py-16 |

---

## Section 2: What's Included

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  What's Included                                                    │
│  ─────────────────                                                  │
│                                                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────┐│
│  │ ✓ LLC formation in  │ │ ✓ Articles of Org   │ │ ✓ Free name     ││
│  │   all 50 US states  │ │   filed with state  │ │   availability  ││
│  └─────────────────────┘ └─────────────────────┘ └─────────────────┘│
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────┐│
│  │ ✓ Operating         │ │ ✓ Compliance        │ │ ✓ 100%          ││
│  │   Agreement included│ │   calendar          │ │   satisfaction  ││
│  └─────────────────────┘ └─────────────────────┘ └─────────────────┘│
│  ┌─────────────────────┐ ┌─────────────────────┐                    │
│  │ ✓ Lifetime document │ │ ✓ 24/7 customer     │                    │
│  │   storage           │ │   support           │                    │
│  └─────────────────────┘ └─────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Specifications
| Element | Style |
|---------|-------|
| Section Title | text-2xl, font-semibold |
| Grid | 2 columns (mobile) / 3 columns (desktop) |
| Checkmark | Green color, Lucide Check icon |
| Item Text | text-sm, text-foreground |
| Background | Subtle gray (bg-muted/30) or white |
| Spacing | py-8 to py-12 |

---

## Section 3: Package Comparison Table

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Choose Your Package                                                │
│  ════════════════════                                               │
│  Compare features and select the best plan for your business        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                          ┌──────────────┐       ││
│  │ Features              │ Basic  │ Standard│  Premium     │       ││
│  │                       │ $199   │ $449    │  $699        │       ││
│  │                       │        │ ★ Most  │              │       ││
│  │                       │        │ Popular │              │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ EIN Number            │   ✓    │    ✓    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ Registered Agent      │   ✓    │    ✓    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ Mail Forwarding       │   ✓    │    ✓    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ US Bank Account       │   ✗    │    ✓    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ Stripe Account        │   ✗    │    ✓    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ BOI Filing            │   ✗    │    ✗    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │ Premium Consultation  │   ✗    │    ✗    │     ✓        │       ││
│  ├───────────────────────┼────────┼─────────┼──────────────┤       ││
│  │                       │[Select]│[Select] │   [Select]   │       ││
│  └───────────────────────┴────────┴─────────┴──────────────┘       ││
│                                                                     │
│  ← Swipe to see more packages (mobile hint)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Table Design Specifications

#### Header Row
| Element | Style |
|---------|-------|
| Package Name | font-semibold, text-lg |
| Price | text-2xl, font-bold |
| Popular Badge | bg-primary, text-white, "Most Popular" |
| Sticky | Header stays visible on vertical scroll |

#### Feature Column (Left)
| Element | Style |
|---------|-------|
| Width | min-w-[200px] |
| Text | text-sm, font-medium |
| Sticky | Stays visible on horizontal scroll (mobile) |
| Background | bg-muted/50 |

#### Value Cells
| State | Style |
|-------|-------|
| ✓ Included | Green checkmark, bg-green-50, text-green-600 |
| ✗ Not Included | Gray X icon, text-muted-foreground, opacity-50 |
| Text Value | Normal text if feature has variable value |

#### Select Button Row
| Package Type | Button Style |
|--------------|--------------|
| Popular Package | Primary filled button, full width |
| Other Packages | Outline button, full width |

### Scroll Behavior

#### Desktop (>1024px)
- Full table visible
- Max 4 packages per row
- If more packages, horizontal scroll enabled
- Scroll indicators on edges (gradient fade)

#### Tablet (768-1024px)
- 2-3 packages visible
- Horizontal scroll for more
- Feature column sticky

#### Mobile (<768px)
- 1-2 packages visible at a time
- Feature column sticky on left
- Smooth horizontal scroll
- Scroll hint indicator at bottom

### Mobile View
```
┌─────────────────────────┬───────────┐
│ Features                │ Basic ▸▸  │  ← Scroll indicator
│                         │ $199      │
├─────────────────────────┼───────────┤
│ EIN Number              │    ✓      │
├─────────────────────────┼───────────┤
│ Registered Agent        │    ✓      │
├─────────────────────────┼───────────┤
│ US Bank Account         │    ✗      │
├─────────────────────────┼───────────┤
│                         │ [Select]  │
└─────────────────────────┴───────────┘
        ← Swipe for Standard, Premium →
```

---

## Section 4: Long Description

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  About LLC Formation                                                │
│  ════════════════════                                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  A Limited Liability Company (LLC) is the most popular      │  │
│  │  business structure for international entrepreneurs         │  │
│  │  looking to start a US business. Here's why...              │  │
│  │                                                              │  │
│  │  ## Why Choose an LLC?                                       │  │
│  │                                                              │  │
│  │  - **Personal Asset Protection**: Your personal assets      │  │
│  │    are protected from business liabilities.                 │  │
│  │                                                              │  │
│  │  - **Tax Flexibility**: Choose how your LLC is taxed -      │  │
│  │    as a sole proprietorship, partnership, or corporation.   │  │
│  │                                                              │  │
│  │  - **Credibility**: A US LLC gives your business instant    │  │
│  │    credibility with international clients and partners.     │  │
│  │                                                              │  │
│  │  ## Our Process                                              │  │
│  │                                                              │  │
│  │  1. Choose your state (Wyoming recommended)                  │  │
│  │  2. We file your Articles of Organization                   │  │
│  │  3. Receive your LLC documents within 24-48 hours           │  │
│  │  4. Get your EIN from the IRS                               │  │
│  │  5. Open your US bank account                               │  │
│  │                                                              │  │
│  │  ## Why International Entrepreneurs Trust Us                 │  │
│  │                                                              │  │
│  │  We've helped over 10,000 entrepreneurs from Bangladesh,    │  │
│  │  India, Pakistan, UAE, and 50+ countries start their US     │  │
│  │  businesses. Our team understands the unique challenges     │  │
│  │  faced by non-US residents.                                 │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Specifications
| Element | Style |
|---------|-------|
| Section Title | text-2xl, font-semibold |
| Content | Prose styling, max-w-4xl, mx-auto |
| Headings (H2) | text-xl, font-semibold, mt-8, mb-4 |
| Paragraphs | text-base, text-muted-foreground, leading-relaxed |
| Lists | Styled bullet points or numbered |
| Background | White or subtle gradient |
| Spacing | py-12 to py-16 |

### Content Source
- From database: `Service.longDescription` field (Markdown/Rich text)
- Rendered with proper markdown parsing
- Supports images, links, and embedded content

---

## Section 5: FAQ

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Frequently Asked Questions                                         │
│  ══════════════════════════                                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ▼ Do I need an SSN to form an LLC?                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │   No! International entrepreneurs can form a US LLC          │  │
│  │   without an SSN. We'll help you obtain an EIN (Employer     │  │
│  │   Identification Number) which serves as your business       │  │
│  │   tax ID.                                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ▶ Which state should I form my LLC in?                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ▶ How long does the LLC formation process take?              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ▶ Can I open a US bank account as a non-resident?            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ▶ What ongoing compliance is required?                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Specifications
| Element | Style |
|---------|-------|
| Section Title | text-2xl, font-semibold, text-center |
| Accordion | shadcn/ui Accordion component |
| Question | font-medium, text-base |
| Answer | text-muted-foreground, text-sm, leading-relaxed |
| Max Width | max-w-3xl, mx-auto |
| Animation | Smooth expand/collapse |
| Default | First item open, rest collapsed |

### FAQ Data Source
- From database: `Service.faqs` relation
- Each FAQ has: `question`, `answer`, `sortOrder`
- Admin can add/edit/reorder FAQs per service

---

## Responsive Summary

| Section | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Hero | Stacked, smaller text | Centered | Centered, larger text |
| What's Included | 2 columns | 3 columns | 3 columns |
| Comparison Table | 1-2 packages, scroll | 2-3 packages, scroll | Full table |
| Long Description | Full width | max-w-3xl | max-w-4xl |
| FAQ | Full width accordion | max-w-2xl | max-w-3xl |

---

## Color Scheme

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | white | slate-950 |
| Section Alt BG | slate-50 | slate-900 |
| Table Header | slate-100 | slate-800 |
| Included (✓) | green-500 | green-400 |
| Not Included (✗) | slate-300 | slate-600 |
| Popular Badge | primary-500 | primary-400 |

---

## Admin Panel Redesign

### Current Admin State Analysis

**URL:** `/admin/services/[id]`

#### Current Tab Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Edit Service                          [Form Builder] [Save]      │
│     LLC Formation                                                   │
│                                                                     │
│  ┌──────────┬─────────────┬──────────┬─────────┐                   │
│  │Basic Info│ Packages(3) │ FAQs(4)  │   SEO   │                   │
│  └──────────┴─────────────┴──────────┴─────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Current Package Edit Modal
```
┌─────────────────────────────────────────────┐
│  Edit Package                           ✕   │
│  Configure the package details and pricing  │
│                                             │
│  Package Name *         Price (USD) *       │
│  ┌─────────────────┐   ┌─────────────────┐  │
│  │ Basic           │   │ 199             │  │
│  └─────────────────┘   └─────────────────┘  │
│                                             │
│  Description                                │
│  ┌─────────────────────────────────────────┐│
│  │ Essential LLC formation for budget...   ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ○ Popular    ◉ Active                      │
│                                             │
│  Included Features                      +   │
│  ┌─────────────────────────────────────┐ ✕  │
│  │ Employer Identification Number (EIN)│    │
│  ├─────────────────────────────────────┤ ✕  │
│  │ US Registered Agent for One Year    │    │
│  ├─────────────────────────────────────┤ ✕  │
│  │ US Mail Forwarding for One Year     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Not Included                           +   │
│  ┌─────────────────────────────────────┐ ✕  │
│  │ Premium Consultation for US Business│    │
│  ├─────────────────────────────────────┤ ✕  │
│  │ US BOI Filing                       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│         [Cancel]  [Save Package]            │
└─────────────────────────────────────────────┘
```

### Current Problems with Admin

| সমস্যা | বর্ণনা |
|--------|--------|
| **No Shared Feature List** | প্রতিটা package এ আলাদা আলাদা feature text লিখতে হয় |
| **Inconsistent Names** | Same feature ভিন্ন নামে থাকতে পারে different packages এ |
| **Hard to Compare** | Admin এ packages পাশাপাশি compare করা যায় না |
| **Manual "Not Included"** | Not included features manually add করতে হয় |
| **No Feature Reordering** | Comparison table এ feature order consistent না হতে পারে |

### Proposed Admin Redesign

#### New Tab Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Edit Service                          [Form Builder] [Save]      │
│     LLC Formation                                                   │
│                                                                     │
│  ┌──────────┬──────────┬─────────────┬──────────┬─────────┐        │
│  │Basic Info│ Features │ Packages(3) │ FAQs(4)  │   SEO   │        │
│  └──────────┴──────────┴─────────────┴──────────┴─────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

**নতুন "Features" Tab** - Service level এ সব features define হবে

---

### New Tab: Features (Master Feature List)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Features                                                           │
│  Define all features for this service. These will appear in the     │
│  comparison table.                                                  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                              [+ Add Feature]  │  │
│  │                                                               │  │
│  │  ⋮⋮  1. Employer Identification Number (EIN)              ✎ 🗑 │  │
│  │  ⋮⋮  2. US Registered Agent for One Year                  ✎ 🗑 │  │
│  │  ⋮⋮  3. US Mail Forwarding for One Year                   ✎ 🗑 │  │
│  │  ⋮⋮  4. Basic Tax Consultation on US Earnings             ✎ 🗑 │  │
│  │  ⋮⋮  5. US Business Address for One Year                  ✎ 🗑 │  │
│  │  ⋮⋮  6. Incorporation of Your US Company                  ✎ 🗑 │  │
│  │  ⋮⋮  7. Operating Agreement                               ✎ 🗑 │  │
│  │  ⋮⋮  8. Annual Compliance With the State                  ✎ 🗑 │  │
│  │  ⋮⋮  9. US Fintech Bank Account                           ✎ 🗑 │  │
│  │  ⋮⋮  10. US Business Stripe Account with Expert Hand      ✎ 🗑 │  │
│  │  ⋮⋮  11. US Business Debit Card                           ✎ 🗑 │  │
│  │  ⋮⋮  12. Premium Consultation for US Business             ✎ 🗑 │  │
│  │  ⋮⋮  13. US BOI Filing                                    ✎ 🗑 │  │
│  │  ⋮⋮  14. Unique US Business Address (10 Mail Forwarding)  ✎ 🗑 │  │
│  │                                                               │  │
│  │  ⋮⋮ = Drag to reorder                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  💡 Tip: Order matters - features will appear in this order in      │
│     the comparison table on the service page.                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Feature Edit Modal
```
┌─────────────────────────────────────────┐
│  Edit Feature                       ✕   │
│                                         │
│  Feature Name *                         │
│  ┌─────────────────────────────────────┐│
│  │ US Fintech Bank Account             ││
│  └─────────────────────────────────────┘│
│                                         │
│  Description (optional)                 │
│  ┌─────────────────────────────────────┐│
│  │ Open a Mercury or Relay bank...     ││
│  └─────────────────────────────────────┘│
│                                         │
│  Tooltip (shows on hover in table)      │
│  ┌─────────────────────────────────────┐│
│  │ Includes Mercury or Relay account   ││
│  └─────────────────────────────────────┘│
│                                         │
│         [Cancel]  [Save Feature]        │
└─────────────────────────────────────────┘
```

---

### Redesigned Packages Tab

#### Package List View (with Comparison Preview)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Packages                                           [+ Add Package] │
│  Configure pricing packages for this service                        │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           │    Basic    │  Standard ★  │   Premium   │        │  │
│  │           │    $199     │    $449      │    $672     │        │  │
│  │           │             │   Popular    │             │        │  │
│  │           │   [Edit]    │    [Edit]    │   [Edit]    │        │  │
│  ├───────────┼─────────────┼──────────────┼─────────────┤        │  │
│  │ EIN       │     ✓       │      ✓       │      ✓      │        │  │
│  │ Agent     │     ✓       │      ✓       │      ✓      │        │  │
│  │ Mail      │     ✓       │      ✓       │      ✓      │        │  │
│  │ Bank Acct │     ✗       │      ✓       │      ✓      │        │  │
│  │ Stripe    │     ✗       │      ✓       │      ✓      │        │  │
│  │ BOI Filing│     ✗       │      ✗       │      ✓      │        │  │
│  │ Premium   │     ✗       │      ✗       │      ✓      │        │  │
│  └───────────┴─────────────┴──────────────┴─────────────┘        │  │
│                                                                     │
│  💡 Click ✓/✗ to toggle feature inclusion for each package         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Inline Toggle:** ✓/✗ click করলেই toggle হবে
- **Live Preview:** Admin এ যেমন দেখাচ্ছে, frontend এও তেমন দেখাবে
- **Quick Edit:** Package header এ Edit button

---

### Redesigned Package Edit Modal

```
┌─────────────────────────────────────────────┐
│  Edit Package                           ✕   │
│                                             │
│  Package Name *         Price (USD) *       │
│  ┌─────────────────┐   ┌─────────────────┐  │
│  │ Standard        │   │ 449             │  │
│  └─────────────────┘   └─────────────────┘  │
│                                             │
│  Description                                │
│  ┌─────────────────────────────────────────┐│
│  │ Most popular - Everything you need...   ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ◉ Popular    ◉ Active    Sort Order: [2]   │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Included Features (14 total)               │
│                                             │
│  ☑ Employer Identification Number (EIN)     │
│  ☑ US Registered Agent for One Year         │
│  ☑ US Mail Forwarding for One Year          │
│  ☑ Basic Tax Consultation on US Earnings    │
│  ☑ US Business Address for One Year         │
│  ☑ Incorporation of Your US Company         │
│  ☑ Operating Agreement                      │
│  ☑ Annual Compliance With the State         │
│  ☑ US Fintech Bank Account                  │
│  ☑ US Business Stripe Account               │
│  ☑ US Business Debit Card                   │
│  ☐ Premium Consultation for US Business     │
│  ☐ US BOI Filing                            │
│  ☐ Unique US Business Address               │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│         [Cancel]  [Save Package]            │
└─────────────────────────────────────────────┘
```

**Key Changes:**
- **Checkbox List:** Master feature list থেকে checkbox
- **No Manual Entry:** Features আর manually type করতে হবে না
- **Consistent Order:** Features সব package এ same order এ থাকবে
- **Sort Order:** Package এর position in table

---

### New Tab: Content (Long Description)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Content                                                            │
│  Detailed information shown below the comparison table              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────────────────┐   │  │
│  │ │ B  I  U  H1 H2 • ─ 🔗 📷                               │   │  │
│  │ ├─────────────────────────────────────────────────────────┤   │  │
│  │ │                                                         │   │  │
│  │ │ ## Why Choose an LLC?                                   │   │  │
│  │ │                                                         │   │  │
│  │ │ A Limited Liability Company (LLC) is the most popular   │   │  │
│  │ │ business structure for international entrepreneurs      │   │  │
│  │ │ looking to start a US business.                         │   │  │
│  │ │                                                         │   │  │
│  │ │ ### Benefits                                            │   │  │
│  │ │                                                         │   │  │
│  │ │ - **Personal Asset Protection**: Your personal assets   │   │  │
│  │ │   are protected from business liabilities.              │   │  │
│  │ │                                                         │   │  │
│  │ │ - **Tax Flexibility**: Choose how your LLC is taxed.    │   │  │
│  │ │                                                         │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │  Rich Text Editor with Markdown support                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Database Schema Changes

```prisma
// Service model - Add new fields
model Service {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?   // Short description (existing)
  longDescription String?   @db.Text  // NEW: Rich text content
  icon            String?
  isActive        Boolean   @default(true)

  // Relations
  features        ServiceFeature[]  // NEW: Master feature list
  packages        ServicePackage[]
  faqs            ServiceFaq[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// NEW: Master feature list for a service
model ServiceFeature {
  id          String   @id @default(cuid())
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  name        String
  description String?
  tooltip     String?
  sortOrder   Int      @default(0)

  // Which packages include this feature
  packages    PackageFeature[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([serviceId])
}

// Junction table: Package <-> Feature
model PackageFeature {
  id          String         @id @default(cuid())
  packageId   String
  package     ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  featureId   String
  feature     ServiceFeature @relation(fields: [featureId], references: [id], onDelete: Cascade)

  included    Boolean        @default(true)  // true = ✓, false = ✗
  customValue String?        // Optional: "10 per month" instead of ✓

  @@unique([packageId, featureId])
  @@index([packageId])
  @@index([featureId])
}

// Update ServicePackage
model ServicePackage {
  id          String    @id @default(cuid())
  serviceId   String
  service     Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  name        String
  price       Decimal   @db.Decimal(10, 2)
  description String?
  isPopular   Boolean   @default(false)
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)

  // NEW: Features relation (replaces includedFeatures/notIncludedFeatures JSON)
  features    PackageFeature[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([serviceId])
}
```

---

### Migration Strategy

```
1. Create new tables: ServiceFeature, PackageFeature
2. Migrate existing data:
   - Extract unique features from all packages
   - Create ServiceFeature entries
   - Create PackageFeature entries based on included/notIncluded
3. Update admin UI
4. Update frontend service page
5. Remove old JSON fields after verification
```

---

## Implementation Notes

### Dynamic Table Generation
```
1. Fetch service with features (ordered by sortOrder)
2. Fetch packages with their PackageFeature relations
3. Generate table:
   - Rows = ServiceFeature list (maintains order)
   - Columns = Packages (sorted by sortOrder or price)
   - Cells = PackageFeature.included (✓/✗) or customValue
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add ServiceFeature, PackageFeature models |
| `src/app/services/[slug]/page.tsx` | New section-based layout |
| `src/components/services/package-comparison-table.tsx` | New component |
| `src/components/services/service-faq.tsx` | New component |
| `src/app/admin/services/[id]/page.tsx` | Add Features tab, redesign Packages tab |
| `src/app/admin/services/[id]/features/` | Feature management components |
| `src/app/api/admin/services/[id]/features/` | Feature CRUD API |

---

## Approval

- [ ] Frontend design approved
- [ ] Admin design approved
- [ ] Database schema approved
- [ ] Ready for implementation

---

*Document created: January 2026*
*Last updated: January 2026*
