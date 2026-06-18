import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Mail, Clock, MapPin, MessageCircle, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — BrownDev Data Hub",
  description: "Contact BrownDev Data Hub for support, questions, or feedback. We respond within 24 hours.",
};

const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: "Email",
    value: "gideonanokyebrown@gmail.com",
    sub: "We reply within 24 hours on business days",
    href: "mailto:gideonanokyebrown@gmail.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+233 26 149 3136",
    sub: "Chat with us on WhatsApp for faster support",
    href: "https://wa.me/233261493136",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+233 54 578 7073",
    sub: "Available Mon–Sat, 8 am – 8 pm",
    href: "tel:+233545787073",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "24 / 7",
    sub: "Platform runs around the clock. WhatsApp & email support Mon–Sat",
    href: null,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Ghana",
    sub: "We serve all networks nationwide",
    href: null,
  },
];

const TOPICS = [
  "My data bundle did not arrive",
  "I was charged but got no bundle",
  "I need a refund",
  "I entered the wrong phone number",
  "I have a question about pricing",
  "Other",
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2FF]">
      <SiteHeader />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#2B4EC8] py-14 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Contact Us
            </h1>
            <p className="text-blue-200 text-base leading-relaxed">
              Have a question, a problem with your order, or just want to say hello? We are here to help.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Contact info */}
            <div>
              <p className="text-[10px] font-black text-[#2B4EC8] uppercase tracking-[0.2em] mb-3">Get in Touch</p>
              <h2 className="text-2xl font-black text-[#1E293B] tracking-tight mb-6">
                We typically respond<br />within 24 hours
              </h2>

              <div className="space-y-4 mb-8">
                {CONTACT_ITEMS.map(({ icon: Icon, label, value, sub, href }) => (
                  <div key={label} className="flex gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-[#2B4EC8]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-black text-[#1E293B] hover:text-[#2B4EC8] transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-black text-[#1E293B]">{value}</p>
                      )}
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ link */}
              <div className="bg-[#EEF2FF] border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-[#2B4EC8] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-[#1E293B] mb-1">Check our FAQ first</p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      Most questions about delivery, refunds, and payments are answered there instantly.
                    </p>
                    <Link
                      href="/faq"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#2B4EC8] hover:underline"
                    >
                      View FAQ <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Email guide */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
              <h3 className="text-lg font-black text-[#1E293B] mb-1">Send us an email</h3>
              <p className="text-sm text-slate-500 mb-6">
                Email us at{" "}
                <a href="mailto:gideonanokyebrown@gmail.com" className="text-[#2B4EC8] font-bold hover:underline">
                  gideonanokyebrown@gmail.com
                </a>{" "}
                and include the following details so we can help you faster:
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { num: "01", label: "Your Paystack payment reference" },
                  { num: "02", label: "The recipient phone number you entered" },
                  { num: "03", label: "The bundle you purchased (network and size)" },
                  { num: "04", label: "A brief description of the issue" },
                ].map(({ num, label }) => (
                  <div key={num} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#2B4EC8] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {num}
                    </span>
                    <p className="text-sm text-[#1E293B] font-semibold leading-snug">{label}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Common topics</p>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <span key={t} className="text-xs bg-[#EEF2FF] text-[#2B4EC8] font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href="mailto:gideonanokyebrown@gmail.com"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#2B4EC8] hover:bg-[#1D40B0] text-white font-black rounded-xl py-3.5 transition-colors text-sm shadow-lg shadow-blue-500/20"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </a>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
