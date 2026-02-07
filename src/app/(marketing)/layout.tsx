import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PluginWidgetLoader } from "@/components/plugins/plugin-widget-loader";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Plugin widgets are loaded dynamically based on active plugins */}
      <PluginWidgetLoader position="body-end" />
    </div>
  );
}
