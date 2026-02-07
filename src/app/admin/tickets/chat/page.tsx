import { verifyPluginAccess } from "@/lib/plugin-guard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LiveChatDashboardClient } from "./live-chat-client";

export const metadata = {
  title: "Live Chat Dashboard",
  description: "Real-time customer chat support",
};

export default async function LiveChatPage() {
  // Server-side plugin access check (5-layer protection)
  const access = await verifyPluginAccess("livesupport-pro");

  if (!access.allowed) {
    redirect("/admin/settings/plugins?activate=livesupport-pro");
  }

  // Get current user session
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if chat feature is enabled in license tier
  const hasChatFeature = access.features.includes("chat");

  return (
    <LiveChatDashboardClient
      pluginName={access.pluginName}
      tier={access.tier}
      features={access.features}
      hasChatFeature={hasChatFeature}
      currentUser={{
        id: session.user.id,
        name: session.user.name || "Agent",
        role: session.user.role || "ADMIN",
      }}
    />
  );
}
