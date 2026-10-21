import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, ChevronRight, ArrowUp } from "lucide-react";
import { PageContainer } from "../../components/ui/PageContainer";
import { SEOHead } from "../../components/seo/SEOHead";
import { fadeInUp, staggerContainer, staggerItem } from "../../utils/motion";

const SECTIONS = [
  { id: "acceptance",      title: "1. Acceptance of Terms" },
  { id: "eligibility",     title: "2. Eligibility" },
  { id: "accounts",        title: "3. User Accounts" },
  { id: "platform-use",    title: "4. Permitted Use" },
  { id: "prohibited",      title: "5. Prohibited Conduct" },
  { id: "content",         title: "6. Content and Listings" },
  { id: "ip",              title: "7. Intellectual Property" },
  { id: "disclaimers",     title: "8. Disclaimers" },
  { id: "liability",       title: "9. Limitation of Liability" },
  { id: "indemnification", title: "10. Indemnification" },
  { id: "termination",     title: "11. Termination" },
  { id: "governing-law",   title: "12. Governing Law" },
  { id: "changes",         title: "13. Changes to Terms" },
  { id: "contact",         title: "14. Contact Us" },
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

export const TermsOfServicePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("acceptance");
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
        title="Terms of Service"
        description="Read the Terms of Service for Find My Job — the rules, rights, and responsibilities governing your use of our job listing platform."
        canonicalPath="/terms"
      />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-400/20 text-brand-300 text-xs font-semibold tracking-wide uppercase">
                <FileText className="w-3 h-3" />
                Legal Document
              </span>
              <span className="text-ink-400 text-xs">Last updated: October 21, 2026</span>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
            >
              Terms of{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                Service
              </span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-ink-300 text-base leading-relaxed max-w-xl">
              These Terms of Service govern your access to and use of the Find My Job platform. By using our
              service, you agree to be bound by these terms. Please read them carefully.
            </motion.p>
          </motion.div>
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
                    id={`toc-terms-${id}`}
                    onClick={() => scrollTo(id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      activeSection === id
                        ? "bg-brand-50 text-brand-700 font-semibold"
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
              className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex gap-3 items-start"
            >
              <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Note:</strong> These are draft terms provided for transparency. Find My Job is currently in
                active development. For legal enquiries contact{" "}
                <a href="mailto:legal@findmyjob.site" className="underline font-medium">legal@findmyjob.site</a>.
              </p>
            </motion.div>

            <Section id="acceptance" title="1. Acceptance of Terms">
              <P>
                Welcome to Find My Job ("Platform", "we", "our", or "us"). By accessing or using our website at
                <strong> findmyjob.site</strong> or any associated service, you ("User", "you") agree to be legally
                bound by these Terms of Service ("Terms"), our Privacy Policy, and any additional policies we publish.
              </P>
              <P>
                If you do not agree to these Terms in their entirety, you must immediately stop using the Platform.
                Your continued use following any amendments constitutes your acceptance of the updated Terms.
              </P>
            </Section>

            <Section id="eligibility" title="2. Eligibility">
              <P>To use Find My Job, you must meet all of the following requirements:</P>
              <Ul items={[
                "Be at least 16 years of age (or the minimum legal age in your jurisdiction)",
                "Have the legal capacity to enter into a binding agreement",
                "Not be prohibited from using our service under applicable law",
                "Not be a previously banned user whose account was terminated for violations",
              ]} />
              <P>
                By registering an account, you represent and warrant that you satisfy these eligibility requirements.
                We reserve the right to verify eligibility at any time.
              </P>
            </Section>

            <Section id="accounts" title="3. User Accounts">
              <P>Certain features of the Platform require you to create an account. When creating an account you agree to:</P>
              <Ul items={[
                "Provide accurate, current, and complete information",
                "Maintain and promptly update your account information",
                "Keep your password confidential and secure",
                "Accept responsibility for all activity that occurs under your account",
                "Notify us immediately at support@findmyjob.site of any unauthorised access",
              ]} />
              <P>
                We reserve the right to suspend or terminate accounts that provide false information or violate these
                Terms without notice or liability.
              </P>
            </Section>

            <Section id="platform-use" title="4. Permitted Use">
              <P>
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable licence
                to access and use the Platform for your personal, non-commercial job-search or recruitment purposes.
              </P>
              <P>Specifically, you may:</P>
              <Ul items={[
                "Browse and search job listings posted on the Platform",
                "Create a candidate account to save jobs and track applications",
                "Share individual job listings via provided share functionality",
                "Contact employers through application links provided in listings",
              ]} />
            </Section>

            <Section id="prohibited" title="5. Prohibited Conduct">
              <P>You agree not to, and will not assist others to:</P>
              <Ul items={[
                "Scrape, crawl, or systematically extract data from the Platform without written permission",
                "Post false, misleading, or fraudulent job listings",
                "Impersonate any person or entity, including Find My Job staff",
                "Upload or transmit viruses, malware, or any malicious code",
                "Circumvent, disable, or interfere with security features of the Platform",
                "Use the Platform for any unlawful purpose or in violation of any regulation",
                "Resell, sublicence, or commercially exploit any part of the Platform",
                "Attempt to gain unauthorised access to any account, system, or network",
                "Send unsolicited commercial messages (spam) to other users or employers",
                "Collect or harvest personally identifiable information of other users",
              ]} />
              <P>
                Violation of these prohibitions may result in immediate account termination and, where applicable,
                referral to law-enforcement authorities.
              </P>
            </Section>

            <Section id="content" title="6. Content and Listings">
              <P>
                <strong>Employer-submitted content:</strong> Job listings are submitted by employers or administrators.
                We moderate listings before publication but do not guarantee their accuracy, completeness, legality, or suitability.
              </P>
              <P>
                <strong>User-generated content:</strong> Where you submit any content to the Platform (including profile
                information), you grant Find My Job a worldwide, royalty-free, non-exclusive licence to use, display, and
                process that content solely to operate and improve the Platform.
              </P>
              <P>
                <strong>Third-party links:</strong> Job listings may link to third-party employer websites. We are not
                responsible for the content, privacy practices, or terms of those external sites.
              </P>
              <P>
                We reserve the right to remove any listing or user content that, in our sole discretion, violates these
                Terms or is otherwise objectionable.
              </P>
            </Section>

            <Section id="ip" title="7. Intellectual Property">
              <P>
                All content on the Platform that is not user-submitted — including but not limited to the logo,
                branding, design, layout, source code, and original text — is owned by or licenced to Find My Job
                and is protected by applicable copyright, trademark, and other intellectual property laws.
              </P>
              <P>
                You may not copy, reproduce, modify, distribute, or create derivative works from any part of the
                Platform without our prior written consent. Your licence to use the Platform does not include any
                rights to our intellectual property beyond what is necessary to access the service.
              </P>
            </Section>

            <Section id="disclaimers" title="8. Disclaimers">
              <P>
                THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </P>
              <Ul items={[
                "We do not guarantee the accuracy or completeness of job listings",
                "We do not guarantee that the Platform will be uninterrupted or error-free",
                "We do not guarantee employment outcomes or application success",
                "We are not responsible for the hiring decisions of employers",
                "Salary figures shown are provided by employers and may not reflect actual offers",
              ]} />
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <P>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, FIND MY JOB AND ITS OFFICERS, DIRECTORS,
                EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES — INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL — ARISING OUT OF OR IN
                CONNECTION WITH YOUR USE OF THE PLATFORM.
              </P>
              <P>
                IN NO EVENT SHALL OUR AGGREGATE LIABILITY TO YOU EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID
                TO USE THE PLATFORM IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED INDIAN RUPEES (₹100).
              </P>
            </Section>

            <Section id="indemnification" title="10. Indemnification">
              <P>
                You agree to defend, indemnify, and hold harmless Find My Job and its affiliates, officers,
                directors, employees, and agents from any claims, liabilities, damages, losses, and expenses
                (including reasonable legal fees) arising from or in any way related to:
              </P>
              <Ul items={[
                "Your access to or use of the Platform",
                "Your violation of these Terms",
                "Your violation of any rights of a third party",
                "Any content you submit to or through the Platform",
              ]} />
            </Section>

            <Section id="termination" title="11. Termination">
              <P>
                We may suspend or terminate your account and access to the Platform at any time, with or without
                cause, with or without notice, and without liability to you. Grounds for termination include, but
                are not limited to, violation of these Terms or conduct we determine to be harmful to other users,
                the Platform, or third parties.
              </P>
              <P>
                Upon termination, your right to use the Platform will immediately cease. Provisions of these Terms
                that by their nature should survive termination (including intellectual property, disclaimers,
                indemnification, and liability limitations) will survive.
              </P>
              <P>You may delete your account at any time from your dashboard settings.</P>
            </Section>

            <Section id="governing-law" title="12. Governing Law">
              <P>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard
                to its conflict-of-law provisions. Any dispute arising out of or relating to these Terms or the
                Platform shall be subject to the exclusive jurisdiction of the courts located in India.
              </P>
              <P>
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions
                will continue in full force and effect.
              </P>
            </Section>

            <Section id="changes" title="13. Changes to Terms">
              <P>
                We reserve the right to modify these Terms at any time. When we make material changes, we will
                update the "Last updated" date at the top of this page and, where appropriate, notify registered
                users via email or in-app notification.
              </P>
              <P>
                Your continued use of the Platform after any changes become effective constitutes your acceptance
                of the revised Terms. If you do not agree to the revised Terms, you must stop using the Platform.
              </P>
            </Section>

            <Section id="contact" title="14. Contact Us">
              <P>If you have any questions about these Terms, please contact us:</P>
              <div className="mt-4 bg-ink-50 border border-ink-100 rounded-xl p-5 space-y-2">
                {[
                  { label: "Platform", value: "Find My Job" },
                  { label: "Website", value: "findmyjob.site", href: "https://findmyjob.site" },
                  { label: "Legal", value: "legal@findmyjob.site", href: "mailto:legal@findmyjob.site" },
                  { label: "Support", value: "support@findmyjob.site", href: "mailto:support@findmyjob.site" },
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
          id="scroll-top-terms"
          className="fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center hover:bg-brand-700 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
};

export default TermsOfServicePage;
