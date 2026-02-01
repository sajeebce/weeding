import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default support settings
  const settings = await prisma.supportSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessHoursEnabled: true,
      businessHoursStart: '09:00',
      businessHoursEnd: '18:00',
      businessDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      timezone: 'UTC',
      autoAssignEnabled: false,
      autoReplyEnabled: false,
      chatWidgetEnabled: true,
      chatWidgetPosition: 'bottom-right',
      chatWidgetColor: '#2563eb',
      chatWidgetTitle: 'Live Support',
      chatWidgetSubtitle: 'We typically reply within minutes',
      slaEnabled: false,
    },
  });
  console.log('✅ Created default support settings');

  // Create default departments
  const departments = [
    { name: 'General Support', description: 'General customer inquiries' },
    { name: 'Technical Support', description: 'Technical issues and troubleshooting' },
    { name: 'Billing', description: 'Payment and subscription inquiries' },
    { name: 'Sales', description: 'Pre-sales questions and quotes' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: dept.name.toLowerCase().replace(/\s+/g, '-'),
        name: dept.name,
        description: dept.description,
        isActive: true,
      },
    });
  }
  console.log('✅ Created default departments');

  // Create sample canned responses
  const cannedResponses = [
    {
      title: 'Greeting',
      shortcut: '/hello',
      content: 'Hello! Thank you for contacting us. How can I help you today?',
      category: 'General',
      isGlobal: true,
    },
    {
      title: 'Request More Info',
      shortcut: '/moreinfo',
      content: 'Thank you for reaching out. Could you please provide more details about your issue so I can better assist you?',
      category: 'General',
      isGlobal: true,
    },
    {
      title: 'Ticket Escalation',
      shortcut: '/escalate',
      content: 'I understand this is an important issue. I am escalating this to our senior support team who will follow up with you shortly.',
      category: 'General',
      isGlobal: true,
    },
    {
      title: 'Closing - Resolved',
      shortcut: '/resolved',
      content: 'I am glad I could help resolve your issue. If you have any other questions, please do not hesitate to reach out. Have a great day!',
      category: 'Closing',
      isGlobal: true,
    },
  ];

  for (const response of cannedResponses) {
    await prisma.cannedResponse.upsert({
      where: { id: response.shortcut },
      update: {},
      create: {
        id: response.shortcut,
        ...response,
      },
    });
  }
  console.log('✅ Created sample canned responses');

  // Create sample knowledge base articles
  const articles = [
    {
      title: 'Getting Started',
      content: `# Getting Started with LiveSupport Pro

Welcome to LiveSupport Pro! This guide will help you get up and running quickly.

## Key Features

- Real-time live chat with customers
- Ticket management system
- AI-powered responses
- Knowledge base integration
- Multi-agent support

## Quick Setup

1. Configure your chat widget settings
2. Add agents to your team
3. Set up departments
4. Create canned responses for common questions

For more detailed information, please refer to our documentation.`,
      category: 'Documentation',
      tags: ['getting-started', 'setup', 'guide'],
      isPublished: true,
    },
    {
      title: 'Chat Widget Configuration',
      content: `# Chat Widget Configuration

Customize the chat widget to match your brand.

## Available Options

- **Position**: Bottom-right or bottom-left
- **Primary Color**: Hex color code
- **Title**: Widget header text
- **Subtitle**: Subheader text

## Embedding the Widget

Add the following script to your website:

\`\`\`html
<script src="https://your-domain.com/livesupport-widget.js"></script>
<script>
  LiveSupport.init({
    socketUrl: 'wss://your-domain.com',
    widgetId: 'your-widget-id'
  });
</script>
\`\`\``,
      category: 'Documentation',
      tags: ['widget', 'configuration', 'embedding'],
      isPublished: true,
    },
  ];

  for (const article of articles) {
    await prisma.knowledgeDocument.upsert({
      where: { id: article.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: article.title.toLowerCase().replace(/\s+/g, '-'),
        ...article,
      },
    });
  }
  console.log('✅ Created sample knowledge base articles');

  console.log('🎉 Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
