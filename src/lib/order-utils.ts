import { prisma } from "@/lib/db";

export async function generateOrderNumber(): Promise<string> {
  // Get business name from settings for prefix
  const businessNameSetting = await prisma.setting.findUnique({
    where: { key: "business.name" },
  });
  const businessName = (businessNameSetting?.value as string) || "BIZ";
  const prefix = businessName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "BIZ";

  // Today's date as YYYYMMDD
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  // Count today's orders for serial number
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayCount = await prisma.order.count({
    where: {
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
  });

  const serial = String(todayCount + 1).padStart(3, "0");
  return `${prefix}-${dateStr}${serial}`;
}
