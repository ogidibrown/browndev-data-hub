"use client";
import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import clsx from "clsx";

const FAQS = [
  {
    q: "How quickly will I receive my data bundle after payment?",
    a: "Delivery is automatic and typically happens within 30 seconds of a successful payment. In rare cases, network congestion on the provider's side can cause a short delay, but bundles almost always land before you leave the payment confirmation page.",
  },
  {
    q: "Which networks do you support?",
    a: "We currently support MTN, Telecel (formerly Vodafone), and AirtelTigo. We cover all major mobile networks in Ghana. More networks may be added in future.",
  },
  {
    q: "Can I buy data for someone else's number?",
    a: "Yes. During checkout you enter the recipient's phone number — it does not have to be your own. Simply type in the number you want to top up and we will send the bundle there.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We use Paystack as our payment processor, which accepts all major debit and credit cards (Visa, Mastercard) as well as Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money) where supported by Paystack in Ghana.",
  },
  {
    q: "I paid but my data has not arrived. What should I do?",
    a: "First, check your order status on the Order Status page using the reference number from your payment. If the status shows Completed, please allow up to 5 minutes and check your phone's data balance by dialling your network's data balance code. If you still have not received data after 15 minutes, contact us at support@browndevdatahub.com with your payment reference and we will investigate immediately.",
  },
  {
    q: "Do I need to create an account to buy data?",
    a: "Yes, you need a free account to place an order. Registration takes under a minute — just your name, email, and a password. Your account lets you track orders and view purchase history.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. All payments are processed by Paystack, which is PCI-DSS Level 1 certified — the highest security standard for payment processing. BrownDev Data Hub never sees or stores your card number. Our website also runs over HTTPS (SSL) at all times.",
  },
  {
    q: "What is your refund policy?",
    a: "If your payment is successful but the data bundle fails to deliver, you are entitled to a full refund. Contact us within 48 hours with your Paystack reference and we will process the refund. Refunds appear within 3–7 business days depending on your bank. We do not offer refunds for bundles that have already been delivered and activated.",
  },
  {
    q: "What data bundle sizes are available?",
    a: "We offer a wide range of bundles from 1GB up to 100GB depending on the network. MTN goes from 1GB to 50GB, AirtelTigo from 1GB to 100GB, and Telecel from 10GB to 100GB. Visit our Pricing page for the full list.",
  },
  {
    q: "Are there any extra charges or hidden fees?",
    a: "No. The price you see on our Pricing page and checkout screen is the exact amount you pay. There are no booking fees, service charges, or hidden extras.",
  },
  {
    q: "What are your customer support hours?",
    a: "Our platform operates 24/7 and orders are fulfilled automatically at any time. For support queries, we respond to emails within 24 hours on business days. You can also reach us via the Contact page.",
  },
  {
    q: "Can I cancel an order after placing it?",
    a: "Once a data bundle has been successfully delivered to the recipient's number, it cannot be recalled or cancelled. If there is a problem before delivery (e.g., the bundle failed to process), contact us immediately and we will help resolve it.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-[#1E293B] leading-snug">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-[#2B4EC8] flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        }
      </button>
      <div className={clsx("px-5 overflow-hidden transition-all duration-200", open ? "pb-5 max-h-96" : "max-h-0")}>
        <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2FF]">
      <SiteHeader />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#2B4EC8] py-14 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-blue-200 text-base leading-relaxed">
              Everything you need to know about buying data through BrownDev Data Hub.
            </p>
          </div>
        </section>

        {/* FAQ list */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </section>

        {/* Still need help */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-14">
          <div className="bg-[#2B4EC8] rounded-2xl p-7 text-center">
            <h2 className="text-lg font-black text-white mb-2">Still have a question?</h2>
            <p className="text-blue-200 text-sm mb-5">
              Our support team is happy to help. Reach out and we will respond within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#FFBB00] text-[#1E293B] font-black text-sm px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
