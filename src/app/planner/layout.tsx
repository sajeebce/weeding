import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "My Event Projects | LLCPad Event Planner",
};

export default function PlannerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
