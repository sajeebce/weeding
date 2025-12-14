import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LLCPad",
  description: "Learn how LLCPad collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
          <p className="text-center text-muted-foreground mb-10">
            Last updated: December 15, 2025
          </p>

          <div className="bg-card rounded-xl border p-6 md:p-10 shadow-sm space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information you provide directly to us, such as when you create an account,
                place an order, contact us for support, or communicate with us via live chat.
              </p>
              <p className="text-muted-foreground mb-3">This information may include:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name, email address, and phone number</li>
                <li>Billing and payment information</li>
                <li>Business information (LLC name, state of formation, etc.)</li>
                <li>Communications you send to us</li>
                <li>Any other information you choose to provide</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and services</li>
                <li>Provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-3">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Service providers who assist in our operations (payment processors, registered agents, etc.)</li>
                <li>Government agencies as required for business formation services</li>
                <li>Professional advisors (lawyers, accountants) when necessary</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. This includes
                encryption of sensitive data and secure server infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, analyze site usage,
                and assist in our marketing efforts. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Opt out of marketing communications</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as necessary to provide our services and comply with
                legal obligations. Business formation records may be retained for extended periods as required
                by state and federal regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. International Users</h2>
              <p className="text-muted-foreground">
                Our services are primarily intended for users forming US businesses. If you are accessing
                our services from outside the United States, please be aware that your information may be
                transferred to, stored, and processed in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground mb-3">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Email: <a href="mailto:support@llcpad.com" className="text-primary hover:underline">support@llcpad.com</a></li>
                <li>Or use our live chat feature</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Disclaimer:</strong> LLCPad is not a law firm and does not provide legal advice.
                The information provided on our website and through our services is for general informational
                purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
