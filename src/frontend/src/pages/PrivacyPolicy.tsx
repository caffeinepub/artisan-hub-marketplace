import { ScrollArea } from '@/components/ui/scroll-area';

export default function PrivacyPolicy() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <ScrollArea className="h-[600px] rounded-lg border p-6">
          <div className="space-y-6 pr-4">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Artisan Hub ("we", "our", or "the Platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform. Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We collect several types of information to provide and improve our services:
              </p>
              <h3 className="text-lg font-semibold mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name and email address provided during registration</li>
                <li>Profile information including bio and artist details</li>
                <li>Payment information processed through secure third-party providers</li>
                <li>Communication records and support inquiries</li>
              </ul>
              <h3 className="text-lg font-semibold mt-4 mb-2">Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Browser type, device information, and IP address</li>
                <li>Pages visited and features used on the Platform</li>
                <li>Transaction history and purchase records</li>
                <li>Interaction with products and artists</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We use collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To create and manage your account</li>
                <li>To process transactions and facilitate payments</li>
                <li>To communicate with you about orders, updates, and support</li>
                <li>To improve and personalize your experience on the Platform</li>
                <li>To detect and prevent fraud or unauthorized activities</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To send promotional materials (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Artisan Hub uses cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Essential cookies for authentication and security</li>
                <li>Functional cookies to remember your preferences</li>
                <li>Analytics cookies to understand how users interact with the Platform</li>
                <li>Marketing cookies for targeted advertising (with consent)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                You can control cookie preferences through your browser settings, though disabling certain cookies may affect Platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We work with trusted third-party service providers to operate the Platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Payment processors (e.g., Stripe) for secure transaction handling</li>
                <li>Cloud storage providers for data hosting</li>
                <li>Analytics services to understand user behavior</li>
                <li>Communication tools for customer support</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                These third parties have access to your information only to perform specific tasks on our behalf and are obligated to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                To exercise these rights, please contact us through the Platform's support channels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When data is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Artisan Hub is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child without parental consent, we will take steps to delete that information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on the Platform and updating the "Last updated" date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the Platform's support channels. We are committed to addressing your privacy concerns promptly and transparently.
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
