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

interface CustomerReplyEmailProps {
  customerName: string;
  ticketNumber: string;
  subject: string;
  agentName: string;
  replyMessage: string;
  ticketUrl?: string;
}

export function CustomerReplyEmail({
  customerName = "John",
  ticketNumber = "TKT-001",
  subject = "Your Support Inquiry",
  agentName = "Support Team",
  replyMessage = "Thank you for contacting us...",
  ticketUrl,
}: CustomerReplyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {agentName} replied to your ticket: {subject}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💬 New Reply from {agentName}</Heading>

          <Section style={greeting}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              {agentName} has replied to your support ticket.
            </Text>
          </Section>

          <Section style={ticketInfo}>
            <Text style={ticketLabel}>Ticket #{ticketNumber}</Text>
            <Text style={ticketSubject}>{subject}</Text>
          </Section>

          <Section style={replyBox}>
            <Heading style={h2}>Reply from {agentName}</Heading>
            <Text style={replyText}>{replyMessage}</Text>
          </Section>

          {ticketUrl && (
            <Section style={buttonContainer}>
              <Link href={ticketUrl} style={button}>
                Reply to Ticket →
              </Link>
            </Section>
          )}

          <Section style={helpBox}>
            <Text style={helpText}>
              <strong>Need more help?</strong>
            </Text>
            <Text style={helpText}>
              Simply reply to this email or click the button above to continue
              the conversation.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Best regards,
              <br />
              LLCPad Support Team
            </Text>
            <Text style={footerDisclaimer}>
              This email was sent regarding your support ticket. If you did not
              request support, please ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default CustomerReplyEmail;

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
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const greeting = {
  padding: "0 40px",
  marginBottom: "24px",
};

const ticketInfo = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 40px 24px",
};

const ticketLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const ticketSubject = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const replyBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "24px",
  margin: "0 40px 30px",
  borderLeft: "4px solid #3b82f6",
};

const replyText = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const buttonContainer = {
  padding: "0 40px",
  marginBottom: "30px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const helpBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 40px 30px",
  borderLeft: "4px solid #f59e0b",
};

const helpText = {
  color: "#78350f",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
};

const footer = {
  padding: "0 40px",
  borderTop: "1px solid #e5e7eb",
  marginTop: "30px",
  paddingTop: "20px",
};

const footerText = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const footerDisclaimer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0",
};
