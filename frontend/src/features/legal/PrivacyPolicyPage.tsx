import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight, ArrowUp } from "lucide-react";
import { PageContainer } from "../../components/ui/PageContainer";
import { SEOHead } from "../../components/seo/SEOHead";
import { fadeInUp, staggerContainer, staggerItem } from "../../utils/motion";

const SECTIONS = [
  { id: "overview",       title: "1. Overview" },
  { id: "data-collected", title: "2. Data We Collect" },
  { id: "how-we-use",     title: "3. How We Use Your Data" },
  { id: "legal-basis",    title: "4. Legal Basis for Processing" },
  { id: "sharing",        title: "5. Data Sharing" },
  { id: "cookies",        title: "6. Cookies and Tracking" },
  { id: "retention",      title: "7. Data Retention" },
  { id: "security",       title: "8. Security" },
  { id: "your-rights",    title: "9. Your Rights" },
  { id: "children",       title: "10. Children's Privacy" },
  { id: "transfers",      title: "11. International Transfers" },
  { id: "third-parties",  title: "12. Third-Party Services" },
  { id: "changes",        title: "13. Policy Changes" },
  { id: "contact",        title: "14. Contact Us" },
];

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({
  id, title, children,
}) => (
  <motion.section
    id={id}
    variants={staggerItem}
    className="scroll-mt-24 pb-10 border-b border-ink-100 last:border-0 last:pb-0"
  >
    <h2 className="text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold shrink-0">
        §
      </span>
      {title}
    </h2>
    <div className="space-y-3 text-ink-600 text-sm leading-relaxed">{children}</div>
  </motion.section>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm leading-relaxed text-ink-600">{children}</p>
);

const Ul: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2 pl-1">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
        <ChevronRight className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-white border border-ink-100 rounded-xl shadow-xs">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-semibold text-ink-800">{value}</p>
    </div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: "-20% 0px -75% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Learn how Find My Job collects, uses, and protects your personal data. Read our full Privacy Policy here."
        canonicalPath="/privacy"
      />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-950 via-ink-900 to-ink-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-400/8 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <PageContainer className="relative py-16 md:py-20">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-3 h-3" />
                Privacy First
              </span>
              <span className="text-ink-400 text-xs">Last updated: October 21, 2026</span>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
            >
              Privacy{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Policy
              </span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-ink-300 text-base leading-relaxed max-w-xl">
              Your privacy matters to us. This Policy explains what data we collect, why we collect it,
              how we protect it, and the rights you have over your personal information.
            </motion.p>
          </motion.div>
        </PageContainer>
      </div>

      {/* At-a-glance summary */}
      <div className="bg-ink-50 border-b border-ink-100">
        <PageContainer className="py-8">
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-4">At a glance</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard icon="🔒" label="Data Controller" value="Find My Job" />
            <InfoCard icon="🌍" label="Jurisdiction" value="India" />
            <InfoCard icon="📅" label="Retention" value="Account lifetime + 90 days" />
            <InfoCard icon="✉️" label="Privacy Contact" value="privacy@findmyjob.site" />
          </div>
        </PageContainer>
      </div>

      {/* Body */}
      <PageContainer className="py-12">
        <div className="flex gap-10 items-start">
          {/* Sticky TOC */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-4">Contents</p>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ id, title }) => (
                  <button
                    key={id}
                    id={`toc-privacy-${id}`}
                    onClick={() => scrollTo(id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      activeSection === id
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-ink-500 hover:text-ink-900 hover:bg-ink-50"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <motion.main
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0 space-y-10"
          >
            {/* Draft Notice */}
            <motion.div
              variants={fadeInUp}
              className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-4 flex gap-3 items-start"
            >
              <span className="text-blue-500 text-lg mt-0.5">ℹ️</span>
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>Note:</strong> This is a draft privacy policy provided for transparency. Find My Job is
                currently in active development. For privacy enquiries, email{" "}
                <a href="mailto:privacy@findmyjob.site" className="underline font-medium">privacy@findmyjob.site</a>.
              </p>
            </motion.div>

            <Section id="overview" title="1. Overview">
              <P>
                Find My Job ("Platform", "we", "our", or "us") is committed to protecting your personal
                information. This Privacy Policy ("Policy") explains how we collect, use, store, share, and
                protect data about you when you use our website at <strong>findmyjob.site</strong> and any
                related services.
              </P>
              <P>
                By accessing or using the Platform, you acknowledge that you have read and understood this
                Policy. If you do not agree with our practices, you should not use the Platform.
              </P>
            </Section>

            <Section id="data-collected" title="2. Data We Collect">
              <P>We collect information in the following ways:</P>
              <P><strong>2.1 Information you provide directly:</strong></P>
              <Ul items={[
                "Registration data: name, email address, and password (stored as a bcrypt hash)",
                "Profile information: skills, preferences, or resume data you choose to add",
                "Communications: messages or feedback you send to our support team",
              ]} />
              <P><strong>2.2 Data collected automatically:</strong></P>
              <Ul items={[
                "Log data: IP address, browser type, pages visited, timestamps, and referring URLs",
                "Device information: operating system, screen resolution, and language settings",
                "Usage analytics: clicks, searches performed, jobs viewed, and session duration",
                "Cookies and similar tracking technologies (see Section 6)",
              ]} />
              <P><strong>2.3 Data from third parties:</strong></P>
              <Ul items={[
                "Job listings information submitted by employers or administrators",
                "Analytics data from services we use to understand Platform performance",
              ]} />
            </Section>

            <Section id="how-we-use" title="3. How We Use Your Data">
              <P>We use the personal data we collect to:</P>
              <Ul items={[
                "Create and manage your account and authenticate your identity",
                "Enable you to save jobs, track applications, and personalise your experience",
                "Display job listings relevant to your searches and preferences",
                "Send transactional emails (e.g., password reset, application confirmations)",
                "Send optional product updates and newsletters (only with your consent)",
                "Monitor Platform health, detect bugs, and prevent fraud or abuse",
                "Comply with applicable legal obligations",
                "Improve and develop new features of the Platform based on usage patterns",
              ]} />
              <P>
                We do not sell, rent, or trade your personal data to any third party for their own
                marketing purposes.
              </P>
            </Section>

            <Section id="legal-basis" title="4. Legal Basis for Processing">
              <P>
                Where applicable law requires a legal basis for processing your personal data, we rely on
                the following grounds:
              </P>
              <Ul items={[
                "Contract performance: to provide the services you request when you create an account",
                "Legitimate interests: to operate, secure, and improve the Platform and prevent abuse",
                "Legal obligation: to comply with applicable laws and respond to lawful requests",
                "Consent: for optional features such as marketing emails (you can withdraw consent at any time)",
              ]} />
            </Section>

            <Section id="sharing" title="5. Data Sharing">
              <P>We do not sell your personal data. We may share data with:</P>
              <Ul items={[
                "Service providers: hosting, email delivery, analytics, and security vendors who process data on our behalf under strict data-processing agreements",
                "Law enforcement: where required by law, court order, or to protect the safety of users or the public",
                "Business transfers: in the event of a merger, acquisition, or sale of assets, with notice provided to affected users",
              ]} />
              <P>
                All third-party processors are contractually required to handle your data in accordance with
                applicable data protection laws and only for the purposes we specify.
              </P>
            </Section>

            <Section id="cookies" title="6. Cookies and Tracking">
              <P>
                We use cookies and similar technologies (such as localStorage) to operate the Platform and
                improve your experience. The types of cookies we use are:
              </P>
              <Ul items={[
                "Essential cookies: required for authentication, session management, and security. These cannot be disabled.",
                "Analytics cookies: help us understand how users interact with the Platform (e.g., page views, search queries). You can opt out.",
                "Preference cookies: remember your settings such as sort order and filter preferences.",
              ]} />
              <P>
                You can control cookies through your browser settings. Note that disabling essential cookies
                may prevent some parts of the Platform from functioning correctly.
              </P>
            </Section>

            <Section id="retention" title="7. Data Retention">
              <P>
                We retain your personal data for as long as your account is active or as needed to provide
                services. Specifically:
              </P>
              <Ul items={[
                "Account data is retained for the lifetime of your account",
                "Upon account deletion, personal data is removed within 90 days",
                "Server logs are retained for up to 30 days for security monitoring",
                "Anonymised analytics data may be retained indefinitely",
                "Data required by law may be retained for longer periods",
              ]} />
            </Section>

            <Section id="security" title="8. Security">
              <P>
                We implement industry-standard technical and organisational measures to protect your personal
                data, including:
              </P>
              <Ul items={[
                "Passwords are hashed using bcrypt with an appropriate cost factor — we never store plain-text passwords",
                "All data in transit is encrypted using TLS/HTTPS",
                "Database access is restricted to authorised services only",
                "Rate limiting and anomaly detection protect against brute-force attacks",
                "Regular dependency and security audits",
              ]} />
              <P>
                No method of transmission over the internet or electronic storage is 100% secure. While we
                strive to use commercially acceptable means to protect your data, we cannot guarantee absolute
                security.
              </P>
            </Section>

            <Section id="your-rights" title="9. Your Rights">
              <P>
                Depending on your jurisdiction, you may have the following rights regarding your personal data:
              </P>
              <Ul items={[
                "Access: request a copy of the personal data we hold about you",
                "Rectification: request correction of inaccurate or incomplete data",
                "Erasure: request deletion of your personal data ('right to be forgotten')",
                "Restriction: request that we limit how we process your data",
                "Portability: receive your data in a structured, machine-readable format",
                "Objection: object to processing based on legitimate interests",
                "Withdraw consent: withdraw previously given consent at any time without affecting prior processing",
              ]} />
              <P>
                To exercise any of these rights, email us at{" "}
                <a href="mailto:privacy@findmyjob.site" className="text-brand-600 hover:underline font-medium">
                  privacy@findmyjob.site
                </a>. We will respond within 30 days.
              </P>
            </Section>

            <Section id="children" title="10. Children's Privacy">
              <P>
                The Platform is not directed to individuals under 16 years of age. We do not knowingly
                collect personal information from children under 16. If you believe we have inadvertently
                collected such information, please contact us immediately at{" "}
                <a href="mailto:privacy@findmyjob.site" className="text-brand-600 hover:underline font-medium">
                  privacy@findmyjob.site
                </a>{" "}
                and we will promptly delete it.
              </P>
            </Section>

            <Section id="transfers" title="11. International Data Transfers">
              <P>
                Find My Job is operated from India. If you are accessing the Platform from outside India,
                your personal data will be transferred to, stored, and processed in India. By using the
                Platform, you consent to this transfer.
              </P>
              <P>
                Our third-party service providers (e.g., cloud hosting and email platforms) may process data
                in other countries. We ensure that appropriate safeguards are in place for such transfers,
                consistent with applicable data protection laws.
              </P>
            </Section>

            <Section id="third-parties" title="12. Third-Party Services">
              <P>The Platform may integrate with or link to third-party services, including:</P>
              <Ul items={[
                "Employer websites linked within job listings — governed by their own privacy policies",
                "Analytics providers (e.g., Vercel Analytics) — governed by their privacy policies",
                "Email delivery services used to send transactional notifications",
              ]} />
              <P>
                We are not responsible for the privacy practices or content of third-party sites. We encourage
                you to review their privacy policies before submitting personal information to them.
              </P>
            </Section>

            <Section id="changes" title="13. Policy Changes">
              <P>
                We may update this Privacy Policy from time to time to reflect changes in our practices or
                applicable law. We will notify you of material changes by:
              </P>
              <Ul items={[
                "Updating the \"Last updated\" date at the top of this page",
                "Sending an email to registered users where required by law",
                "Displaying an in-app notification for significant changes",
              ]} />
              <P>
                Your continued use of the Platform after the effective date of any updated Policy constitutes
                your acceptance of the changes.
              </P>
            </Section>

            <Section id="contact" title="14. Contact Us">
              <P>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data
                practices, please contact us:
              </P>
              <div className="mt-4 bg-ink-50 border border-ink-100 rounded-xl p-5 space-y-2">
                {[
                  { label: "Platform",  value: "Find My Job" },
                  { label: "Website",   value: "findmyjob.site",          href: "https://findmyjob.site" },
                  { label: "Privacy",   value: "privacy@findmyjob.site",  href: "mailto:privacy@findmyjob.site" },
                  { label: "Support",   value: "support@findmyjob.site",  href: "mailto:support@findmyjob.site" },
                ].map(({ label, value, href }) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="font-semibold text-ink-700 w-20 shrink-0">{label}:</span>
                    {href ? (
                      <a href={href} className="text-brand-600 hover:underline">{value}</a>
                    ) : (
                      <span className="text-ink-600">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </motion.main>
        </div>
      </PageContainer>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          id="scroll-top-privacy"
          className="fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
};

export default PrivacyPolicyPage;
