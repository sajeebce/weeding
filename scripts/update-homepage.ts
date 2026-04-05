import "dotenv/config";
import prisma from "../src/lib/db";

async function main() {
  const home = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!home) {
    console.log("No home page found");
    return;
  }

  const block = home.blocks[0];
  const settings = block.settings as any[];

  // Find the section with hero-content widget
  for (let i = 0; i < settings.length; i++) {
    const section = settings[i];
    for (const col of section.columns || []) {
      for (const widget of col.widgets || []) {
        if (widget.type === "hero-content") {
          console.log("Found hero-content widget:", widget.id);

          // Update to wedding theme
          widget.settings = {
            ...widget.settings,
            badge: {
              show: true,
              icon: "Heart",
              text: "Wedding Planning Made Simple",
              style: "pill",
              bgColor: "#9333ea33",
              textColor: "#9333ea",
              borderColor: "#9333ea80",
            },
            headline: {
              ...widget.settings.headline,
              text: "Plan Your Dream Wedding",
              highlightWords: "Dream Wedding",
              highlightColor: "#9333ea",
            },
            subheadline: {
              show: true,
              text: "Your all-in-one wedding planning website with every tool you need to bring your dream celebration to life. No hidden fees! No sign-up required!",
              size: "lg",
              color: "#94a3b8",
            },
            features: {
              show: false,
              items: [],
            },
            // Fix primary button
            primaryButton: {
              show: true,
              text: "Create new wedding project",
              link: "/planner/create",
              openInNewTab: false,
              style: {
                bgColor: "#9333ea",
                hoverBgColor: "#7e22ce",
                textColor: "#ffffff",
                borderRadius: 12,
                paddingX: 32,
                paddingY: 16,
                fontSize: 16,
                fontWeight: "semibold",
                bgGradient: {
                  enabled: true,
                  from: "#9333ea",
                  to: "#ec4899",
                  angle: 90,
                },
              },
            },
            // Also set buttons.primary for the widget format
            buttons: {
              primary: {
                show: true,
                text: "Create new wedding project",
                link: "/planner/create",
                openInNewTab: false,
                style: {
                  bgColor: "#9333ea",
                  hoverBgColor: "#7e22ce",
                  textColor: "#ffffff",
                  borderRadius: 12,
                  paddingX: 32,
                  paddingY: 16,
                  fontSize: 16,
                  fontWeight: "semibold",
                  bgGradient: {
                    enabled: true,
                    from: "#9333ea",
                    to: "#ec4899",
                    angle: 90,
                  },
                },
              },
              secondary: {
                show: false,
              },
            },
            secondaryButton: {
              show: false,
            },
            trustText: {
              show: false,
            },
          };

          console.log("Updated hero-content widget to wedding theme");
        }
      }
    }
  }

  // Save back to DB
  await prisma.landingPageBlock.update({
    where: { id: block.id },
    data: { settings },
  });

  console.log("Homepage updated successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
