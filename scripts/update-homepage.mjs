import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const home = await prisma.landingPage.findFirst({ where: { slug: 'home' } });
  if (!home) {
    console.log('No home page found');
    return;
  }

  console.log('Page ID:', home.id);
  const blocks = home.blocks;

  if (Array.isArray(blocks)) {
    blocks.forEach((b, i) => {
      const sections = b.settings || [];
      sections.forEach((s, j) => {
        const widgets = s.columns?.flatMap(c => c.widgets?.map(w => ({ type: w.type, id: w.id })) || []);
        console.log(`Block ${i} Section ${j}:`, JSON.stringify(widgets));
      });
    });
  }
}

main().then(() => prisma.$disconnect());
