import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service — BrownDev Data Hub",
  description: "Read the Terms of Service for BrownDev Data Hub. Learn about our policies for payments, refunds, and use of the platform.",
};

const LAST_UPDATED = "18 June 2025";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2FF]">
      <SiteHeader />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#2B4EC8] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Terms of Service
            </h1>
            <p className="text-blue-200 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 prose prose-sm max-w-none text-slate-600 space-y-8">

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to BrownDev Data Hub (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By accessing or using our website and services at browndevdatahub.com (the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully before making a purchase. If you do not agree with any part of these Terms, do not use the Platform.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">2. About Our Service</h2>
              <p className="leading-relaxed">
                BrownDev Data Hub is an online platform that allows customers in Ghana to purchase mobile data bundles for MTN, Telecel, and AirtelTigo networks. Bundles are delivered automatically to the specified phone number upon successful payment. We operate as a reseller and facilitate delivery through licensed data providers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">3. Eligibility</h2>
              <p className="leading-relaxed">
                You must be at least 18 years of age and resident in Ghana to use this Platform. By placing an order, you confirm that the information you provide — including your email address and the recipient&apos;s phone number — is accurate and complete.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">4. Account Registration</h2>
              <p className="leading-relaxed">
                You are required to create an account before purchasing. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately if you believe your account has been compromised.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">5. Pricing</h2>
              <p className="leading-relaxed">
                All prices are displayed in Ghana Cedis (GHS) and are inclusive of all charges. Prices shown on the Platform are final — there are no hidden fees or service charges. Prices may be updated from time to time; the price at the time of checkout is the price you pay.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">6. Payments</h2>
              <p className="leading-relaxed">
                All payments are processed securely by Paystack, a PCI-DSS Level 1 certified payment processor. We accept all payment methods supported by Paystack, including debit/credit cards and Mobile Money. BrownDev Data Hub does not store or have access to your payment card details at any time. Payment is taken at the time of checkout. Your order is only processed once payment is confirmed.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">7. Delivery</h2>
              <p className="leading-relaxed">
                Data bundles are delivered automatically to the recipient&apos;s phone number within seconds of payment confirmation under normal conditions. Delivery times may occasionally be longer due to factors outside our control, including network congestion or temporary provider outages. We are not liable for delays caused by third-party networks. If a bundle has not been received within 30 minutes of a confirmed payment, please contact our support team immediately.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">8. Refund Policy</h2>
              <p className="leading-relaxed mb-3">
                We want every customer to be satisfied. Refunds are issued in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>Your payment was successful but the data bundle was not delivered within a reasonable time (30 minutes).</li>
                <li>You were charged more than once for the same order due to a technical error.</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Refunds are <strong>not</strong> issued in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed mt-2">
                <li>The bundle was successfully delivered and activated on the recipient&apos;s number.</li>
                <li>You entered an incorrect phone number — always double-check before completing payment.</li>
                <li>The refund request is made more than 48 hours after the original transaction.</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To request a refund, contact us at gideonanokyebrown@gmail.com with your Paystack payment reference. Approved refunds are processed within 3–7 business days and will be returned to the original payment method.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">9. Acceptable Use</h2>
              <p className="leading-relaxed">
                You agree not to use this Platform for any fraudulent, unlawful, or abusive purpose. This includes attempting to manipulate prices, submitting false payment information, repeatedly initiating and cancelling payments, or using automated tools to abuse the service. We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">10. Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                The Platform is provided &quot;as is&quot; without warranties of any kind. While we strive for 100% uptime and reliable delivery, we do not guarantee uninterrupted or error-free service. We are not responsible for the policies, pricing, or service quality of third-party network providers (MTN, Telecel, AirtelTigo).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">11. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by Ghanaian law, BrownDev Data Hub shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability for any claim relating to a specific transaction shall not exceed the amount you paid for that transaction.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">12. Privacy</h2>
              <p className="leading-relaxed">
                We collect your name, email address, and the recipient phone number you provide during checkout. This information is used solely to process your order and provide customer support. We do not sell or share your personal data with any third party for marketing purposes. Payment information is handled entirely by Paystack and is never stored on our servers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">13. Changes to These Terms</h2>
              <p className="leading-relaxed">
                We may update these Terms from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">14. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms are governed by the laws of the Republic of Ghana. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Ghana.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B] mb-3">15. Contact</h2>
              <p className="leading-relaxed">
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:gideonanokyebrown@gmail.com" className="text-[#2B4EC8] font-bold hover:underline">
                  gideonanokyebrown@gmail.com
                </a>.
              </p>
            </div>

          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
