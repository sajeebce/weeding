import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AdminNotificationEmailProps {
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  message: string;
  ticketUrl: string;
  priority?: string;
  category?: string;
}

export function AdminNotificationEmail({
  ticketNumber = "TKT-001",
  subject = "New Support Inquiry",
  customerName = "John Doe",
  customerEmail = "john@example.com",
  message = "I need help with my order...",
  ticketUrl = "https://llcpad.com/admin/tickets/1",
  priority = "MEDIUM",
  category = "General",
}: AdminNotificationEmailProps) {
  const priorityColors: Record<string, string> = {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
    URGENT: "#dc2626",
  };

  const priorityColor = priorityColors[priority] || "#f59e0b";

  return (
    <Html>
      <Head />
      <Preview>New support ticket: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎫 New Support Ticket</Heading>

          <Section style={infoBox}>
            <Text style={infoLabel}>Ticket Number</Text>
            <Text style={infoValue}>{ticketNumber}</Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoLabel}>Subject</Text>
            <Text style={infoValue}>{subject}</Text>
          </Section>

          <Section style={flexRow}>
            <div style={halfBox}>
              <Text style={infoLabel}>Priority</Text>
              <Text
                style={{
                  ...badge,
                  backgroundColor: priorityColor,
                }}
              >
                {priority}
              </Text>
            </div>
            <div style={halfBox}>
              <Text style={infoLabel}>Category</Text>
              <Text style={infoValue}>{category || "Uncategorized"}</Text>
            </div>
          </Section>

          <Section style={customerBox}>
            <Heading style={h2}>Customer Information</Heading>
            <Text style={text}>
              <strong>Name:</strong> {customerName}
            </Text>
            <Text style={text}>
              <strong>Email:</strong>{" "}
              <Link href={`mailto:${customerEmail}`} style={link}>
                {customerEmail}
              </Link>
            </Text>
          </Section>

          <Section style={messageBox}>
            <Heading style={h2}>Message</Heading>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Link href={ticketUrl} style={button}>
              View Ticket →
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification from your LLCPad support system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default AdminNotificationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "700",
  margin: "40px 0 20px",
  padding: "0 40px",
};

const h2 = {
  color: "#374151",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 15px",
};

const text = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};

const infoBox = {
  padding: "0 40px",
  marginBottom: "20px",
};

const infoLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "500",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const infoValue = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const flexRow = {
  display: "flex" as const,
  padding: "0 40px",
  marginBottom: "20px",
};

const halfBox = {
  flex: "1",
  marginRight: "10px",
};

const badge = {
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0",
};

const customerBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 40px 20px",
};

const messageBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 40px 30px",
  borderLeft: "4px solid #3b82f6",
};

const messageText = {
  ...text,
  color: "#1f2937",
  whiteSpace: "pre-wrap" as const,
};

const buttonContainer = {
  padding: "0 40px",
  marginBottom: "30px",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

const footer = {
  padding: "0 40px",
  borderTop: "1px solid #e5e7eb",
  marginTop: "30px",
  paddingTop: "20px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0",
};
