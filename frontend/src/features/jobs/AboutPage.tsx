import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  FileText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { SEOHead } from '../../components/seo/SEOHead';
import { staggerContainer, staggerItem, fadeInUp, fadeInLeft, fadeInRight } from '../../utils/motion';

// ─── How it works steps ───────────────────────────────────────────────────────
const steps = [
  {
    number: '01',
    icon: <Search className="w-5 h-5" />,
    title: 'Search & filter',
    body:
      'Enter a keyword, location, or browse by category. Use filters for employment type, work mode, experience level, and salary range to narrow down results quickly.',
  },
  {
    number: '02',
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: 'Review job details',
    body:
      'Each listing shows the role, company, location, employment type, and salary information where disclosed. Responsibilities and required qualifications are included where provided by the employer.',
  },
  {
    number: '03',
    icon: <Bookmark className="w-5 h-5" />,
    title: 'Save opportunities',
    body:
      'Create a free candidate account and save roles you want to revisit. Your saved jobs and application history are available from your dashboard.',
  },
  {
    number: '04',
    icon: <FileText className="w-5 h-5" />,
    title: 'Apply directly',
    body:
      'Applications go directly to the employer through the link provided in the listing. We do not act as an intermediary or collect your application documents.',
  },
];

// ─── Platform principles ──────────────────────────────────────────────────────
const principles = [
  'Job counts and categories reflect real, currently published listings.',
  'Salary information is shown only when provided by the employer.',
  'We do not fabricate statistics or endorsements.',
  'Job listings are moderated before publication.',
  'Candidate data is used only for saved jobs and application tracking.',
];

// ─── Component ────────────────────────────────────────────────────────────────
export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer size="wide" className="py-12 pb-24">
      {/* ── SEO Metadata ── */}
      <SEOHead
        title="About Our Mission & Platform"
        description="Learn about Find My Job and our mission to provide high-integrity, verified job discovery for software engineers, designers, and tech professionals across India."
        canonicalPath="/about"
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-16 max-w-2xl"
      >
        <motion.span
          variants={fadeInUp}
          className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-3"
        >
          About the Platform
        </motion.span>
        <motion.h1
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight mb-4 leading-tight"
        >
          A straightforward place to find technology jobs
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-ink-500 text-base leading-relaxed"
        >
          Find My Job is a job discovery portal for technology roles. We
          aggregate verified listings and present them in a clean, searchable
          interface designed around the job seeker — not the recruiter.
        </motion.p>
      </motion.div>

      {/* ── Purpose ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-canvas-card border border-canvas-border rounded-card p-8"
        >
          <h2 className="text-xl font-bold text-ink-900 mb-3">What this is</h2>
          <p className="text-ink-500 text-sm leading-relaxed mb-4">
            A job listing portal. We publish technology and adjacent roles from
            employers who submit listings for review. Candidates can search,
            filter, and apply to roles that match their experience and
            preferences.
          </p>
          <p className="text-ink-500 text-sm leading-relaxed">
            The platform is not a recruiter, a staffing agency, or an ATS. We
            do not have visibility into the employer's hiring process once you
            apply through their link.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-canvas-card border border-canvas-border rounded-card p-8"
        >
          <h2 className="text-xl font-bold text-ink-900 mb-3">What this is not</h2>
          <ul className="space-y-2.5">
            {[
              'A placement agency or staffing firm',
              'A freelance marketplace',
              'An endorsement of any employer',
              'A guarantee of employment',
              'A source of salary benchmarks beyond disclosed ranges',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-500">
                <span className="mt-0.5 w-4 h-4 rounded-full border border-canvas-border shrink-0 flex items-center justify-center text-ink-300 text-[10px]">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mb-6"
      >
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-600 block mb-2">
          Process
        </span>
        <h2 className="text-2xl font-bold text-ink-900">How it works</h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20"
      >
        {steps.map((step) => (
          <motion.div
            key={step.number}
            variants={staggerItem}
            className="bg-canvas-card border border-canvas-border rounded-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                {step.icon}
              </div>
              <span className="text-2xl font-bold text-ink-100 tabular-nums">
                {step.number}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-ink-900 mb-2">{step.title}</h3>
            <p className="text-xs text-ink-500 leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Principles ────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mb-16 bg-canvas-subtle border border-canvas-border rounded-card p-8"
      >
        <h2 className="text-xl font-bold text-ink-900 mb-5">
          Our commitments
        </h2>
        <ul className="space-y-3">
          {principles.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-ink-600">
              <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-4"
      >
        <div>
          <h2 className="text-xl font-bold text-ink-900 mb-1">
            Ready to find your next role?
          </h2>
          <p className="text-sm text-ink-500">
            Browse current openings or explore jobs by category.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 transition-colors"
          >
            Browse Jobs
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-canvas-card border border-canvas-border text-ink-700 text-sm font-medium hover:bg-canvas-subtle transition-colors"
          >
            View Categories
          </button>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default AboutPage;
