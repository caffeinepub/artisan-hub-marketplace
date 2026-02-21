import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsAndConditions() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <ScrollArea className="h-[600px] rounded-lg border p-6">
          <div className="space-y-6 pr-4">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Artisan Hub ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                As a user of Artisan Hub, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or deceptive practices</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not upload malicious content or engage in harmful activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Intellectual Property Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Artists retain full ownership of their original work uploaded to the Platform. By listing products on Artisan Hub, artists grant the Platform a non-exclusive license to display, promote, and facilitate the sale of their work.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Users agree not to reproduce, distribute, or create derivative works from content on the Platform without explicit permission from the copyright holder.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                All transactions on Artisan Hub are processed through secure payment providers. The Platform operates on a commission-based model:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Artists receive the majority share of each sale (typically 90%)</li>
                <li>The Platform retains a commission to cover operational costs</li>
                <li>Payment processing fees may apply as determined by payment providers</li>
                <li>Refunds are handled on a case-by-case basis in accordance with our refund policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Artist Obligations</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Artists using the Platform agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Only upload original work or content they have rights to sell</li>
                <li>Provide accurate descriptions and pricing for their products</li>
                <li>Fulfill orders in a timely manner for physical products</li>
                <li>Maintain professional communication with buyers</li>
                <li>Configure valid payment details to receive earnings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Users are strictly prohibited from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Uploading content that infringes on intellectual property rights</li>
                <li>Engaging in fraudulent transactions or money laundering</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Attempting to circumvent platform fees or payment systems</li>
                <li>Using automated systems to scrape or collect data from the Platform</li>
                <li>Uploading malware, viruses, or other harmful code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                In the event of disputes between buyers and artists, Artisan Hub will make reasonable efforts to facilitate resolution. However, the Platform is not responsible for disputes arising from transactions. Users agree to first attempt to resolve disputes directly before seeking legal remedies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Artisan Hub provides the Platform "as is" without warranties of any kind. The Platform is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability shall not exceed the amount of fees paid by you to the Platform in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Account Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                Artisan Hub reserves the right to suspend or terminate accounts that violate these Terms and Conditions. Users may also request account deletion at any time, subject to the completion of pending transactions and obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Artisan Hub reserves the right to modify these Terms and Conditions at any time. Users will be notified of significant changes, and continued use of the Platform constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms and Conditions are governed by and construed in accordance with applicable international laws. Any disputes shall be resolved in the appropriate jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions or concerns regarding these Terms and Conditions, please contact us through the Platform's support channels.
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
