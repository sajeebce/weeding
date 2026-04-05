# Core Architect Document: VowMatrix Wedding Planning Platform

## Development Guide v1.0

---

## 1. Executive Summary

This document establishes the comprehensive technical architecture for VowMatrix, an all-in-one wedding and event planning platform. The platform serves as a "Planning Command Center" that combines vendor discovery, event website creation, guest management, seating chart design, and RSVP handling into a unified ecosystem. The architecture follows a Modular Monolith approach, enabling rapid development velocity while maintaining clear domain boundaries between complex functional areas.

The platform distinguishes itself through tool-first experiences rather than simple vendor directories. Key differentiators include a real-time visual website builder, advanced SVG-based seating chart editor with drag-and-drop functionality, multilingual support for Swedish, English, and Arabic with full RTL capabilities, and tiered subscription plans with integrated payment processing.

This architecture document provides developers with the foundational blueprint for implementation, covering system architecture, module relationships, database design, API structures, frontend strategy, and development roadmap.

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

The platform employs a **Modular Monolith** architecture designed to balance development speed with maintainable domain separation. This approach allows teams to develop rapidly across multiple domains while preserving clear boundaries between complex functional areas such as Planning, Design, and Public Site generation.

The architecture consists of four primary layers working in concert to deliver a seamless user experience. The Client Layer encompasses three distinct interfaces: a Dashboard Application built as a Single Page Application using React and Next.js for couples and planners, a collection of Public Wedding Sites rendered server-side for optimal SEO performance targeting wedding guests, and a Mobile Application built with React Native planned for future development phases. The API Gateway Layer handles routing, rate limiting, and SSL termination using Nginx or Kong, providing a unified entry point for all client requests. The Application Layer consists of a Node.js server built with the NestJS framework, organized into domain-specific modules that encapsulate business logic. Finally, the Data Layer combines PostgreSQL for relational data storage, Redis for caching and session management, and AWS S3 for media asset storage.

This layered approach ensures that changes in one domain do not cascade unpredictably across others, while enabling horizontal scaling of individual components based on traffic patterns.

### 2.2 Technology Stack

The technology stack has been selected to meet the requirements of performance, developer productivity, and maintainability. The frontend utilizes Next.js 14 with App Router for both the dashboard application and public-facing websites, TypeScript for type safety across the codebase, TailwindCSS for utility-first styling, and Shadcn/UI for accessible component foundations. Visual editing capabilities are powered by Konva.js or Fabric.js, chosen for their high-performance canvas manipulation required by the seating chart and invitation designer features.

The backend infrastructure centers on NestJS, a progressive Node.js framework that provides modular architecture with dependency injection, making it well-suited for complex domain logic. Prisma ORM handles database operations with type-safe queries and migration management. The database layer uses PostgreSQL 16 for its robust relational capabilities and JSONB support, while Redis handles caching, session storage, and real-time pub/sub messaging. Real-time functionality for collaborative editing features relies on Socket.io, and the entire system containerizes with Docker for consistent deployment across environments. Infrastructure hosting utilizes AWS services including ECS for container orchestration, RDS for managed PostgreSQL, and S3 for scalable media storage.

---

## 3. Core Modules and Relationships

### 3.1 Module Architecture Overview

The platform divides into eight core functional modules, each representing a distinct domain with clear responsibilities and well-defined interfaces for inter-module communication. Understanding these modules and their relationships is essential for developers working on any part of the system.

### 3.2 Module 1: Identity and Access Management

The Identity and Access Management module serves as the foundational security layer for the entire platform. This module handles all authentication and authorization concerns, establishing the trust framework within which all other operations occur. The module manages user registration and login with support for email/password credentials, social authentication through providers such as Google and Facebook, and multi-factor authentication for enhanced account security. Role-based access control defines four primary roles: Couple members who own and manage their wedding events, Planners who assist couples with event coordination, Vendors who list services in the marketplace, and Guests who interact with public event sites.

The module maintains a comprehensive user profile system capturing names, contact information, preferred language settings, and profile images. Session management utilizes JWT tokens with refresh token rotation for secure, stateless authentication. Integration with downstream modules is achieved through a shared authentication context that propagates user identity and permissions throughout the request lifecycle.

### 3.3 Module 2: Planning Engine

The Planning Engine provides couples with comprehensive tools for managing the logistical aspects of their event. This module encompasses three primary functional areas: budget tracking and calculation, timeline management with Gantt and list view options, and task checklist management with automated suggestions.

Budget tracking maintains a hierarchical categorization system for expenses, supporting categories such as Venue, Catering, Photography, Flowers, Attire, and Miscellaneous. Each budget item stores estimated costs, actual costs, paid amounts, and payment status. The system automatically calculates totals, remaining balances, and percentage spent per category, generating visual reports and alerts when spending approaches or exceeds budget thresholds.

Timeline management provides both Gantt chart visualization for project planning and linear list views for sequential task tracking. The module supports milestone definition, task dependencies, and date-based reminders. An intelligent checklist generator analyzes the wedding date and creates suggested tasks with appropriate timing, covering preparations from 12 months out through the wedding day.

The Planning Engine maintains relationships with other modules: Budget items optionally link to Vendor bookings from the Marketplace module, Timeline tasks reference Vendor schedules and bookings, and Task completion status influences the overall planning progress indicator displayed on the dashboard.

### 3.4 Module 3: Guest Management

The Guest Management module forms the central repository for all attendee-related data, functioning as the authoritative source of truth for guest information that feeds multiple downstream modules. Core capabilities include guest list database management with import from CSV and Excel sources, RSVP tracking with comprehensive response history, guest grouping for family units andPlus-one allocations, and meal preference collection.

The RSVP Engine implements sophisticated conditional logic that adapts form fields based on guest responses. When a guest selects "Not Attending," the system hides all optional fields and collects only first name, last name, and optional phone number. When a guest selects "Attending," the full form reveals including email, guest count with slider/stepper control, high chair requirements, dietary restrictions with checkboxes for Vegetarian, Vegan, Gluten-free, Dairy-free, and custom options, meal selection from preset options, accommodation needs, transportation preferences, arrival date selection, song requests for the DJ, and personal messages to the hosts.

Custom question support enables couples to define their own questions with various input types including text, radio buttons, and checkboxes. Responses are stored in association with the guest record and displayed in guest management views.

The Guest Management module integrates with the Seating Chart module by providing guest data for assignment to seats, with RSVP status determining whether guests appear in the seating assignment interface. The module also supplies guest data to the RSVP form on public websites and stores all responses back to the guest record.

### 3.5 Module 4: Visual Studio — Seating Chart Editor

The Seating Chart Editor represents one of the platform's most technically complex features, providing an interactive canvas for designing event floor plans and assigning guests to specific seats. The editor supports multiple table configurations including round tables with configurable seat counts, rectangular tables, head tables for wedding parties, and buffet stations without seating.

Layout management features include SVG venue layout upload capability, allowing venues to provide floor plans in SVG format that users upload and position as background layers. Custom element support enables uploading additional SVG assets fordecorative elements or custom furniture. The system maintains automatic save history storing the last 24 changes with timestamps and creator attribution, supporting both automatic snapshots every five minutes and manual snapshot creation. Users can restore any previous version from the history panel.

The editor canvas provides drag-and-drop functionality for placing and repositioning tables, with snap-to-grid alignment assistance and collision detection preventing table overlap. Guest assignment occurs through dragging guest cards from a side panel onto specific seats, with visual indicators showing occupied and available positions. Search functionality allows finding guests by seat number or name, displaying results directly on the layout map for quick location during event entrance management.

Export capabilities generate high-resolution PDFs suitable for printing at 300 DPI resolution, providing table number cards, place cards with guest names, and comprehensive seating charts for venue staff. Digital sharing generates unique URLs enabling guests to search for their seat assignments using the QR Seat Finder feature.

### 3.6 Module 5: Visual Studio — Invitation Designer

The Invitation Designer provides couples with tools to create cohesive digital and physical invitations matching their event's visual theme. The designer integrates closely with the Website Builder, sharing theme settings including colors, gradients, fonts, and logos to ensure visual consistency across all event communications.

Template management provides a minimum of ten professionally designed templates at launch, organized by event type. Templates include placeholders for couple names, event date, venue information, and RSVP deadline, with live preview showing real-time updates as users modify content or styling. The designer supports solid color backgrounds and CSS gradient backgrounds with customizable color stops, logo upload with positioning controls, and font selection from curated font pairings.

Export functionality generates digital invitations as image files or PDFs suitable for email distribution, while print export produces high-resolution PDFs for physical invitation printing. QR code generation creates unique codes linking to the event's RSVP form, printable on physical invitations to drive digital responses.

### 3.7 Module 6: CMS — Website Builder

The Website Builder enables couples to create public-facing event websites with minimal technical expertise. The builder employs a block-based architecture with drag-and-drop functionality, allowing users to compose pages from pre-built components.

Template selection offers event-type-specific templates with appropriate components: Wedding templates include Registry and Story sections, Baptism templates feature Godparent sections and Blessing components, while Party templates provide appropriate celebration-focused layouts. All templates are fully responsive, rendering correctly on mobile devices, tablets, and desktop computers.

The builder includes twelve core modules for MVP release: Header modules displaying hero images with overlaid names and dates, Image and Text combination blocks, Text and Image list layouts, plain Text sections for stories and details, Location blocks with embedded maps and directions, People List blocks for wedding party or event participants, Countdown timers displaying time remaining to the event, YouTube Video embed blocks, Image Gallery components with lightbox viewing, Wishlist or Registry blocks, RSVP Form blocks connected to the Guest Management module, and Custom Form blocks for additional data collection.

Theme customization supports gradient color engines for backgrounds and buttons, logo upload with dedicated branding slots, and font selection with live preview. Multilingual toggle provides a floating widget on published sites enabling visitors to switch between Swedish, English, and Arabic languages, with full RTL support for Arabic content rendering.

### 3.8 Module 7: Vendor Marketplace

The Vendor Marketplace connects couples with service providers across wedding categories including venues, photographers, caterers, florists, DJs, and rental companies. The marketplace follows a directory-style model similar to WeddingWire, with listing pages, search functionality, and detailed vendor profiles.

Vendor discovery supports geographic search with location-based filtering, category browsing with subcategory drilling, date availability checking using an integrated calendar system, and keyword search across vendor names and descriptions. Vendor profiles display business details, years of experience, languages spoken, team size, portfolio images, and customer reviews.

The inquiry system enables couples to submit vendor-specific inquiry forms capturing event details, preferred dates, and budget ranges. Venue integration extends to a "Venue Not Listed" option capturing information about venues not yet in the system, feeding a database expansion pipeline.

Vendor listings may include premium features requiring subscription tiers, with the system tracking which features display based on vendor subscription status.

### 3.9 Module 8: Billing and Payments

The Billing and Payments module manages all financial transactions including subscription payments, premium feature purchases, and vendor listing fees. The module integrates with multiple payment processors to serve both global and Swedish market requirements.

Global payment support covers credit and debit cards, Apple Pay, Google Pay, and PayPal through Stripe integration. Swedish market integration adds Swish for mobile payments popular in Sweden and Klarna for Buy Now Pay Later and Installment options. Subscription management defines three tiers: Basic (free) providing website with subdomain and ads enabled, Premium (paid) adding seating chart, guest list, custom domain, and ad-free experience, and Elite (paid) including all Premium features plus printable assets, QR entrance logic, and collaborator access.

The module generates automated PDF invoices with VAT (Moms) calculations and organization numbers for Swedish compliance. Users access the Stripe Customer Portal for self-service subscription management, billing history review, and payment method updates. Advertisements can be enabled or disabled via a dashboard toggle, with the admin panel providing upload and management capabilities for ad banners.

### 3.10 Module Relationships and Data Flow

Understanding how modules interact is critical for implementing features that span domain boundaries. The primary data flow relationships establish the Wedding as the central entity: the Wedding record serves as the parent container for virtually all platform data, with nearly every table including a wedding_id foreign key establishing this relationship.

Guest Management sits at the center of many cross-module interactions, receiving RSVP submissions from public websites, providing guest lists to the Seating Chart editor, supplying attendee counts for budget calculations, and populating guest data for printable place cards and escort cards.

The Website Builder consumes data from multiple sources, displaying timeline information, registry items, photo galleries, and embedded RSVP forms. The builder exports theme settings to the Invitation Designer ensuring visual consistency.

Payment status from the Billing module gates feature availability across the platform, with the subscription tier determining which capabilities are accessible in the Seating Chart editor, Website Builder, and other modules.

---

## 4. Database Schema Design

### 4.1 Design Philosophy

The database schema follows relational modeling best practices with strategic use of PostgreSQL's JSONB capability for flexible data storage. The primary design principles include maintaining referential integrity through foreign key relationships, implementing soft deletes on all planning-related tables to preserve data history, using UUIDs for globally unique identifiers across distributed systems, and leveraging JSONB for canvas layouts and custom field definitions where relational modeling would require complex EAV patterns.

### 4.2 Core Entity Definitions

The Users table serves as the authentication anchor, storing email addresses as unique identifiers, password hashes using bcrypt with appropriate salt rounds, role enumerations defining user types, and language preferences for UI localization settings.

The Weddings table functions as the root entity for the entire platform, containing an owner_id foreign key linking to the user who created the wedding, wedding_date storing the primary event timestamp, slug generating unique public-facing URLs, budget_total storing the overall budget ceiling, and status tracking wedding planning progress.

The Guests table maintains attendee information with wedding_id as a required foreign key linking to parent weddings, group_id enabling family and Plus-one grouping, rsvp_status capturing response states including pending, accepted, declined, and waitlisted, dietary_requirements storing allergy and preference data as a JSON object, and custom_fields storing responses to couple-defined questions.

The FloorPlans table stores seating chart layouts with wedding_id establishing ownership, layout_json containing the complete canvas state as a JSONB blob including table positions, seat coordinates, and background layer references, version tracking enables history management, and auto_save_metadata tracking change timestamps.

The Seats table maintains individual seat assignments linking floor_plan_id to parent floor plans, guest_id optionally referencing assigned guests, table_number identifying the table containing this seat, position_coordinates storing x/y positioning as JSON, and seat_label enabling custom labels such as "Head Table 1".

The BudgetItems table tracks individual expenses with wedding_id as ownership, category enumerating expense types, estimated_cost storing planned amounts, actual_cost storing final amounts, paid_amount tracking partial payments, vendor_id optionally linking to marketplace vendors, and payment_status tracking settlement state.

The WebsitePages table stores public website content with wedding_id establishing ownership, slug generating page URLs, page_type identifying template types, content_json storing block data as JSONB, and published_status controlling visibility.

The Subscriptions table manages payment plans with wedding_id or user_id establishing ownership, plan_type defining tier levels, stripe_subscription_id linking to payment processor, status tracking active/paused/canceled states, and current_period_end recording renewal dates.

### 4.3 Indexing Strategy

Performance optimization requires strategic indexing beyond primary keys. Composite indexes support common query patterns: wedding_id combined with rsvp_status enables quick filtering of guest lists by response, wedding_id with category enables budget reports by expense type, and floor_plan_id with version enables efficient history retrieval. Full-text search indexes accelerate content search across website pages and vendor listings. Partial indexes improve specific query performance: idx_active_subscriptions filters to currently active plans only, and idx_pending_rsvps targets guests awaiting responses.

---

## 5. API Structure

### 5.1 API Design Principles

The API follows RESTful conventions with resource-oriented URLs, consistent HTTP verb usage, and standard response codes. Versioning uses URL-based versioning with /api/v1/ prefixes enabling API evolution without breaking existing clients. Authentication utilizes Bearer token schemes with access and refresh token flows, with sensitive endpoints requiring valid authentication and tier-appropriate authorization checks.

### 5.2 Authentication Endpoints

The authentication domain provides core security operations including user registration with email verification, standard login with email and password, social authentication endpoints for OAuth flows, token refresh operations issuing new access tokens, password reset request and confirmation flows, and logout mechanisms invalidating refresh tokens.

### 5.3 Wedding Management Endpoints

Wedding-related operations center on the /api/v1/weddings namespace. The summary endpoint returns aggregated statistics including guest counts by RSVP status, budget utilization percentages, task completion rates, and website publication status. Budget operations enable CRUD for line items with automatic total recalculation, while timeline endpoints support creating, updating, and reordering tasks with drag-and-drop positions persisted to the server.

### 5.4 Guest Management Endpoints

Guest operations provide full CRUD capability with /api/v1/weddings/{weddingId}/guests as the primary resource. Bulk import enables CSV upload with parsing and validation returning detailed results. RSVP submission receives form data and updates guest status with email confirmations triggered on status changes. Group management handles family unit creation and Plus-one allocation logic.

### 5.5 Seating Chart Endpoints

Seating operations access /api/v1/weddings/{weddingId}/floorplans resources. The GET endpoint returns complete layout state as JSON for canvas rendering. Save operations accept batch updates to the layout with optimistic concurrency handling preventing overwrite conflicts. History endpoints list all versions with metadata enabling restore operations to revert to previous states.

### 5.6 Website Builder Endpoints

Website operations at /api/v1/weddings/{weddingId}/sites manage public presence. Pages CRUD handles individual page management, block operations enable adding, updating, reordering, and deleting content blocks within pages, theme endpoints manage color, font, and logo settings, and publication toggles control public visibility with cache invalidation.

### 5.7 Vendor Marketplace Endpoints

Marketplace resources exist under /api/v1/vendors and /api/v1/listings. Search operations support filtering by location, category, availability dates, and keyword with pagination. Vendor profile endpoints return detailed information including portfolio images and reviews. Inquiry submission sends notifications to vendors with couple contact information.

### 5.8 Payment Endpoints

Billing resources at /api/v1/billing manage subscriptions and invoices. Checkout session creation initiates Stripe payment flows with appropriate price IDs for selected tiers. Portal access provides URLs to Stripe's self-service billing management. Webhook handlers process payment events including subscription changes and invoice payments.

### 5.9 Public Access Endpoints

Public endpoints serve guest-facing functionality without authentication requirements. Public site retrieval caches rendered site content with appropriate TTL, RSVP submission accepts guest responses with validation, seat lookup returns seating assignments for QR code scans, and language switching manages locale preferences for multilingual content.

---

## 6. Frontend Architecture

### 6.1 Application Shell Strategy

The frontend architecture differentiates between authenticated dashboard experiences and public-facing websites. The dashboard application prioritizes desktop-first design given the complex data entry tasks involved in planning, while public sites employ mobile-first strategies accommodating guest access from various devices.

Component architecture follows Atomic Design principles establishing clear component hierarchies. Atoms define foundational elements including buttons, inputs, typography, and icons that enforce design system consistency. Molecules combine atoms into functional units such as guest cards, budget line items, and form field groups. Organisms compose molecules into complex interfaces including kanban boards, calendar views, and data tables. Templates establish page layouts arranging organisms into complete page structures, while pages represent specific routes combining templates with real data.

### 6.2 Dashboard Application Structure

The authenticated dashboard organizes into primary navigation sections: the Planning hub providing access to budget, timeline, and checklist tools, the Guests section for list management and RSVP tracking, the Seating Chart editor for floor plan design, the Website Builder for public site creation, the Vendors marketplace for service discovery, and Settings for account and subscription management.

State management leverages React Query for server state synchronization with optimistic update patterns providing responsive user experiences. Local state uses React hooks for component-specific concerns, while global state through Zustand handles cross-cutting concerns like user preferences and theme settings.

### 6.3 Seating Chart Editor Implementation

The seating chart editor represents the most complex frontend component, requiring careful technology selection and performance optimization. The recommended library is Konva.js, selected for its high-performance canvas rendering capable of handling 500 or more objects while maintaining 60 frames per second.

Core editor features include zoom and pan controls for navigating large venue layouts, snap-to-grid functionality aligning tables and elements to configurable grid positions, collision detection preventing overlapping table placements, and drag-and-drop guest assignment from side panels onto seats.

The editor implements optimistic updates for smooth interaction, persisting changes to the server in the background with conflict resolution handling concurrent modifications from multiple users.

### 6.4 Website Builder Implementation

The website builder utilizes a block-based architecture enabling drag-and-drop composition of page content. The recommended approach employs dnd-kit for drag-and-drop interactions with custom block components.

Block registry management maintains available block types with associated renderers and configuration forms. The canvas component renders the current page composition with live preview showing final appearance. The property panel displays editing controls for the currently selected block, contextual to block type. Theme controls manage overall site styling with immediate visual feedback.

Responsive preview enables viewing pages across device breakpoints during editing, ensuring mobile compatibility before publication.

### 6.5 Internationalization Strategy

The platform supports three languages from launch: Swedish, English, and Arabic with full RTL rendering. Implementation uses next-i18next with namespace separation enabling independent translation loading.

RTL support includes CSS logical properties replacing directional properties, horizontal flip transformations for icons requiring reversal, proper text alignment respecting reading direction, and bidirectional text handling for mixed-content scenarios.

Font selection for Arabic employs modern typefaces optimized for screen rendering, specifically IBM Plex Sans Arabic or Cairo depending on brand positioning.

---

## 7. Key Technical Decisions

### 7.1 JSONB for Flexible Data Storage

The architecture stores seating chart layouts, website builder block content, and custom field definitions as JSONB in PostgreSQL rather than creating complex relational tables. This decision recognizes that canvas libraries export and import JSON natively, eliminating serialization overhead. Querying individual seat coordinates or block properties via SQL rarely provides meaningful benefit given the document-oriented access patterns.

The trade-off accepts reduced relational integrity enforcement in exchange for development velocity and reduced object-relational mapping complexity. Application-level validation compensates for database-level constraints.

### 7.2 Optimistic UI Updates

Budget calculations, checklist toggles, and task reordering employ optimistic updates through React Query's mutation hooks. The UI updates immediately upon user interaction, providing spreadsheet-like responsiveness expected from modern applications. Server synchronization occurs in the background with error rollback if persistence fails.

This pattern particularly benefits the Seating Chart editor where users drag guests between seats expecting instant visual feedback without network latency.

### 7.3 WebSocket for Collaborative Features

Real-time synchronization through Socket.io enables collaborative editing when multiple users work simultaneously on guest lists or seating charts. The implementation prevents data overwrites through operational transformation or last-write-wins strategies depending on conflict complexity.

The wedding owner receives real-time notifications when collaborators make changes, maintaining awareness of concurrent activity. Connection state management handles reconnection gracefully without data loss.

### 7.4 Server-Side Rendering for Public Sites

Public wedding websites utilize Next.js server-side rendering for optimal performance and search engine visibility. Server rendering ensures fast first contentful paint on mobile networks and enables search engines to index couple stories, event details, and vendor recommendations.

Caching strategies balance freshness with performance, implementing appropriate TTLs for static content and on-demand invalidation when couples update their sites.

### 7.5 Subscription Tier Feature Gating

Feature availability checks occur at multiple layers: API endpoints verify subscription tier before returning premium features, frontend components conditionally render based on subscription status, and database queries filter marketplace listings by vendor subscription levels.

This defense-in-depth approach ensures consistent behavior regardless of which access point users employ.

---

## 8. Development Roadmap

### 8.1 Phase 1: Core Foundation (Weeks 1-2)

The initial phase establishes infrastructure and authentication capabilities. Development tasks include setting up the Next.js and NestJS monorepo with shared TypeScript configuration, implementing JWT authentication with registration, login, and password reset flows, building the dashboard shell with navigation and layout components, creating the wedding creation wizard guiding couples through initial setup, and establishing database migrations with Prisma and initial schema deployment.

The phase concludes with a functional user registration and wedding creation flow, providing the foundation for subsequent feature development.

### 8.2 Phase 2: Planning Tools (Weeks 3-4)

The second phase implements core planning functionality. Guest list management receives full CRUD operations with CSV import capability. Budget tracking implements category management, line items, and calculation logic with visual charts. Checklist and timeline features provide task management with drag-and-drop reordering and intelligent suggestions based on wedding date.

The phase delivers a functional planning dashboard where couples can manage attendees, track expenses, and organize tasks.

### 8.3 Phase 3: Visual Editor Foundation (Weeks 5-8)

The third phase builds the visual editing capabilities. The Seating Chart editor implements canvas rendering with Konva.js, table creation and positioning, guest assignment through drag-and-drop, and save/load functionality. The Website Builder establishes block architecture with core blocks, drag-and-drop composition, and theme controls. The Invitation Designer provides template selection, customization, and export functionality.

This phase delivers functional visual tools enabling couples to design seating arrangements and create public websites.

### 8.4 Phase 4: Guest Experience (Weeks 9-10)

The fourth phase focuses on guest-facing functionality. Public website rendering provides SEO-optimized pages with server-side rendering. The RSVP form implements conditional logic responding to attendance selection. Email notifications inform couples of new responses. QR Seat Finder enables guest lookup at event entrances.

The phase completes the guest interaction loop from website visit through RSVP submission.

### 8.5 Phase 5: Marketplace and Payments (Weeks 11-12)

The fifth phase introduces revenue-generating features. Vendor marketplace enables discovery, listings, and inquiry submission. Stripe integration processes subscription payments with Swedish payment methods. Subscription management gates features appropriately across tiers. The admin panel provides platform oversight capabilities.

This phase enables the platform's business model with paid subscriptions and marketplace transactions.

### 8.6 Phase 6: Polish and Launch (Weeks 13-14)

The final phase prepares for production release. Performance optimization addresses loading times and responsiveness across all features. Comprehensive testing covers functional scenarios, edge cases, and cross-browser compatibility. Documentation provides developer guides and user documentation. Deployment procedures establish production infrastructure and monitoring.

The platform achieves general availability following this phase.

---

## 9. Performance and Quality Standards

### 9.1 Performance Targets

The platform establishes specific performance benchmarks ensuring acceptable user experiences across all features. The Seating Chart editor maintains 60 frames per second with 500 or more objects on the canvas, ensuring smooth drag-and-drop interactions without visual lag. Public websites achieve Lighthouse scores exceeding 90 in Performance and Accessibility categories, ensuring fast loading and inclusive experiences. API response times for typical operations remain under 200 milliseconds for p95 requests, with database queries optimized through appropriate indexing.

### 9.2 Functional Requirements

Budget calculations maintain exact precision with sub-item totals equaling category totals equaling grand totals. RSVP logic correctly handles Plus-one assignments, ensuring invitations include Plus-one slots only when allocated. Seating constraints prevent assigning the same guest to multiple seats through validation checks at both API and UI layers.

### 9.3 Visual Verification

Responsive design testing covers device compatibility from iPhone SE through iPad and Desktop 4K resolutions. Print exports generate high-resolution PDFs at 300 DPI for professional printing quality. Arabic RTL rendering displays correctly with proper text alignment, icon orientation, and layout mirroring.

---

## 10. Security Considerations

### 10.1 Data Protection

All sensitive data including passwords and payment information receives encryption at rest and in transit. Password storage uses bcrypt with appropriate work factors balancing security and performance. Payment processing delegates to Stripe with PCI compliance, avoiding direct card data handling.

### 10.2 Access Control

Role-based authorization restricts operations appropriately: couples access their own wedding data, planners receive access explicitly granted by owners, guests access only public website content, and vendors see only their marketplace listings. API authorization checks verify permissions on every sensitive endpoint.

### 10.3 Input Validation

All user inputs receive validation at API boundaries using robust libraries preventing injection attacks. File uploads restrict allowed types and sizes, with uploaded content scanned for malicious patterns before storage.

---

## 11. Conclusion

This architecture establishes a comprehensive blueprint for building the VowMatrix wedding planning platform. The Modular Monolith approach balances development velocity with maintainable domain separation, while the selected technology stack provides performance, type safety, and developer productivity.

The eight core modules address all requirements from the specification: identity management, planning tools, guest management, seating chart editing, invitation design, website building, vendor marketplace, and payment processing. Database design using PostgreSQL with strategic JSONB usage accommodates both relational integrity and flexible document storage.

Developers implementing this architecture should refer to companion documents including API specifications, component library documentation, and deployment procedures. This foundational document provides the structural understanding necessary for cohesive feature development across the platform team.

--