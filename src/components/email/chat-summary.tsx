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
import { format } from "date-fns";

interface Message {
  senderName: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  content: string;
  createdAt: string;
}

interface ChatSummaryEmailProps {
  customerName: string;
  ticketNumber: string;
  subject: string;
  messages: Message[];
  resolvedAt?: string;
  satisfactionSurveyUrl?: string;
}

export function ChatSummaryEmail({
  customerName = "John",
  ticketNumber = "TKT-001",
  subject = "Your Support Inquiry",
  messages = [],
  resolvedAt,
  satisfactionSurveyUrl,
}: ChatSummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your support ticket {ticketNumber} has been resolved</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Ticket Resolved</Heading>

          <Section style={greeting}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Your support ticket has been resolved. Here's a summary of your
              conversation with our team.
            </Text>
          </Section>

          <Section style={ticketInfo}>
            <div style={ticketRow}>
              <span style={ticketLabel}>Ticket Number:</span>
              <span style={ticketValue}>{ticketNumber}</span>
            </div>
            <div style={ticketRow}>
              <span style={ticketLabel}>Subject:</span>
              <span style={ticketValue}>{subject}</span>
            </div>
            {resolvedAt && (
              <div style={ticketRow}>
                <span style={ticketLabel}>Resolved:</span>
                <span style={ticketValue}>
                  {format(new Date(resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            )}
          </Section>

          <Section style={conversationBox}>
            <Heading style={h2}>Conversation Summary</Heading>

            {messages.map((message, index) => (
              <div
                key={index}
                style={
                  message.senderType === "CUSTOMER"
                    ? customerMessage
                    : agentMessage
                }
              >
                <div style={messageHeader}>
                  <strong>{message.senderName}</strong>
                  <span style={messageTime}>
                    {format(
                      new Date(message.createdAt),
                      "MMM d 'at' h:mm a"
                    )}
                  </span>
                </div>
                <Text style={messageContent}>{message.content}</Text>
              </div>
            ))}
          </Section>

          {satisfactionSurveyUrl && (
            <Section style={surveyBox}>
              <Heading style={surveyHeading}>How was your experience?</Heading>
              <Text style={surveyText}>
                We'd love to hear your feedback! It only takes a minute.
              </Text>
              <div style={ratingContainer}>
                <Link
                  href={`${satisfactionSurveyUrl}?rating=5`}
                  style={emojiLink}
                >
                  😍
                </Link>
                <Link
                  href={`${satisfactionSurveyUrl}?rating=4`}
                  style={emojiLink}
                >
                  😊
                </Link>
                <Link
                  href={`${satisfactionSurveyUrl}?rating=3`}
                  style={emojiLink}
                >
                  😐
                </Link>
                <Link
                  href={`${satisfactionSurveyUrl}?rating=2`}
                  style={emojiLink}
                >
                  😕
                </Link>
                <Link
                  href={`${satisfactionSurveyUrl}?rating=1`}
                  style={emojiLink}
                >
                  😞
                </Link>
              </div>
            </Section>
          )}

          <Section style={helpBox}>
            <Text style={helpTitle}>Need More Help?</Text>
            <Text style={helpText}>
              If you have any other questions or if this issue isn't fully
              resolved, feel free to reply to this email or create a new support
              ticket.
            </Text>
            <Link href="https://llcpad.com/contact" style={helpLink}>
              Contact Support →
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing LLCPad!
              <br />
              Support Team
            </Text>
            <Text style={footerDisclaimer}>
              This is a conversation summary for ticket #{ticketNumber}. You can
              safely archive this email for your records.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ChatSummaryEmail;

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
  margin: "0 0 20px",
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
  padding: "20px",
  margin: "0 40px 24px",
};

const ticketRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
};

const ticketLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
};

const ticketValue = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "600",
};

const conversationBox = {
  padding: "0 40px",
  marginBottom: "30px",
};

const customerMessage = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
  borderLeft: "4px solid #9ca3af",
};

const agentMessage = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
  borderLeft: "4px solid #3b82f6",
};

const messageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
  color: "#374151",
  fontSize: "14px",
};

const messageTime = {
  color: "#9ca3af",
  fontSize: "12px",
  marginLeft: "8px",
};

const messageContent = {
  color: "#1f2937",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const surveyBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "24px",
  margin: "0 40px 30px",
  textAlign: "center" as const,
};

const surveyHeading = {
  color: "#78350f",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const surveyText = {
  color: "#92400e",
  fontSize: "14px",
  margin: "0 0 20px",
};

const ratingContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
};

const emojiLink = {
  fontSize: "40px",
  textDecoration: "none",
  transition: "transform 0.2s",
};

const helpBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 40px 30px",
};

const helpTitle = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const helpText = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const helpLink = {
  color: "#3b82f6",
  textDecoration: "underline",
  fontSize: "14px",
  fontWeight: "500",
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
