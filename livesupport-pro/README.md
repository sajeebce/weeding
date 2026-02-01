# LiveSupport Pro

Professional customer support system with live chat, ticketing, and AI assistance.

## Monorepo Structure

```
livesupport-pro/
├── packages/
│   ├── core/          # Business logic, services, Socket.io
│   ├── ui/            # React components and hooks
│   ├── database/      # Prisma schema and client
│   └── ai/            # AI providers and services
├── apps/
│   ├── standalone/    # Standalone Next.js application
│   └── llcpad-plugin/ # LLCPad CMS plugin wrapper
└── turbo.json         # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+

### Installation

```bash
# Clone the repository
cd livesupport-pro

# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @livesupport/database db:generate

# Run database migrations
pnpm --filter @livesupport/database db:migrate

# Build all packages
pnpm build
```

### Development

```bash
# Run standalone app in development mode
pnpm standalone:dev

# Run all packages in watch mode
pnpm dev
```

### Building

```bash
# Build all packages
pnpm build

# Build standalone app only
pnpm standalone:build

# Build plugin only
pnpm plugin:build
```

## Packages

### @livesupport/core

Core business logic including:
- Services: TicketService, MessageService, ChatService, NotificationService
- Socket.io server and event handlers
- Type definitions

### @livesupport/ui

React components and hooks:
- ChatWidget - Embeddable live chat widget
- TicketList - Ticket listing component
- MessageThread - Message display component
- MessageInput - Message input with attachments
- useSocket, useChat, useAgentChat, useTickets hooks

### @livesupport/database

Database layer:
- Prisma schema for all entities
- Database client singleton
- Seed data

### @livesupport/ai

AI integration:
- OpenAI provider
- Knowledge base search
- AI chat service

## Apps

### Standalone App

Full-featured Next.js application for selling on CodeCanyon as a standalone product.

### LLCPad Plugin

Plugin wrapper for integrating LiveSupport Pro into LLCPad CMS.

## Features

- **Ticket Management**: Create, assign, and track support tickets
- **Live Chat**: Real-time chat with Socket.io
- **AI Assistant**: AI-powered responses using knowledge base
- **Multi-agent Support**: Multiple agents with availability status
- **Knowledge Base**: Documentation for AI training
- **Canned Responses**: Quick reply templates
- **SLA Tracking**: Response time monitoring
- **Notifications**: Real-time notifications

## License

Commercial License - All Rights Reserved
