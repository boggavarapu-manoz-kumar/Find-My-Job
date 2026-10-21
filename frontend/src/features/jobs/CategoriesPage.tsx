import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Palette,
  Cloud,
  Brain,
  TrendingUp,
  BarChart3,
  Shield,
  Headphones,
  PenTool,
  Layers,
  Search,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { PageContainer } from '../../components/ui/PageContainer';
import { jobService } from '../../api/jobService';
import { SEOHead } from '../../components/seo/SEOHead';
import { staggerContainer, staggerItem, fadeInUp } from '../../utils/motion';
import type { PaginatedResponse, Job } from '../../types/job.types';

// ─── Category definitions with icons ─────────────────────────────────────────
interface CategoryDef {
  name: string;
  key: string;
  description: string;
  icon: React.ReactNode;
}

const CATEGORY_DEFS: CategoryDef[] = [
  {
    name: 'Software Engineering',
    key: 'Engineering',
    description: 'Full-stack, backend, web systems, APIs, and distributed platforms.',
    icon: <Code2 className="w-5 h-5" />,
  },
  {
    name: 'Design & Creative',
    key: 'Design',
    description: 'Product UI/UX, design systems, interaction and visual design.',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    name: 'DevOps & Cloud',
    key: 'DevOps & Cloud',
    description: 'Site reliability, Kubernetes, CI/CD pipelines, and infrastructure.',
    icon: <Cloud className="w-5 h-5" />,
  },
  {
    name: 'Data Science & AI',
    key: 'Data Science & AI',
    description: 'Machine learning, data engineering, analytics, and AI research.',
    icon: <Brain className="w-5 h-5" />,
  },
  {
    name: 'Product & Marketing',
    key: 'Product & Marketing',
    description: 'Product strategy, growth, developer relations, and GTM.',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    name: 'Analytics & BI',
    key: 'Analytics',
    description: 'Business intelligence, data visualization, and reporting.',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    name: 'Cybersecurity',
    key: 'Security',
    description: 'Security engineering, penetration testing, and compliance.',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: 'Customer Success',
    key: 'Customer Success',
    description: 'Customer support, success management, and technical onboarding.',
    icon: <Headphones className="w-5 h-5" />,
  },
  {
    name: 'Content & Writing',
    key: 'Content',
    description: 'Technical writing, content strategy, copywriting, and documentation.',
    icon: <PenTool className="w-5 h-5" />,
  },
  {
    name: 'Other',
    key: 'Other',
    description: 'Roles spanning multiple disciplines and emerging specialties.',
    icon: <Layers className="w-5 h-5" />,
  },
];

// ─── Fetch job count per category ─────────────────────────────────────────────
async function fetchCategoryCount(
  key: string,
  signal: AbortSignal
): Promise<number> {
  try {
    const result: PaginatedResponse<Job> = await jobService.getLatestJobs(
      { category: key, size: 1, page: 0 },
      signal
    );
    return result.totalElements ?? 0;
  } catch {
    return 0;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCounts = useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        CATEGORY_DEFS.map((cat) =>
          fetchCategoryCount(cat.key, controller.signal).then((count) => ({
            key: cat.key,
            count,
          }))
        )
      );

      const countsMap: Record<string, number> = {};
      for (const r of results) {
        countsMap[r.key] = r.count;
      }
      setCounts(countsMap);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Unable to load category data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = loadCounts();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [loadCounts]);

  const handleCategoryClick = (key: string) => {
    navigate(`/jobs?category=${encodeURIComponent(key)}`);
  };

  const filtered = CATEGORY_DEFS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer size="wide" className="py-12 pb-24">
      {/* ── SEO Metadata ── */}
      <SEOHead
        title="Job Categories & Technical Disciplines"
        description="Explore verified job opportunities across engineering, product design, data science, cloud DevOps, and tech disciplines on Find My Job."
        canonicalPath="/categories"
      />

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-12"
      >
        <motion.div variants={fadeInUp} className="mb-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">
            Browse by Category
          </span>
        </motion.div>
        <motion.h1
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight mb-3"
        >
          Find your field
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-ink-500 text-base max-w-xl leading-relaxed"
        >
          Explore verified opportunities organised by discipline. Each category
          links directly to the relevant job listings.
        </motion.p>

        {/* Search within categories */}
        <motion.div variants={fadeInUp} className="mt-6 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="search"
              placeholder="Filter categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-canvas-card border border-canvas-border rounded-button text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-8 flex items-center gap-3 p-4 rounded-card bg-rose-soft border border-rose-text/20 text-sm text-rose-text">
          <span className="flex-1">{error}</span>
          <button
            onClick={loadCounts}
            className="flex items-center gap-1.5 text-rose-text font-medium hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Category grid ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-400 text-sm">
            No categories match "<span className="font-medium text-ink-600">{searchQuery}</span>".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-brand-600 text-sm font-medium hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch"
        >
          {filtered.map((cat) => {
            const count = counts[cat.key];
            const hasJobs = count !== undefined && count > 0;

            return (
              <motion.button
                key={cat.key}
                variants={staggerItem}
                onClick={() => handleCategoryClick(cat.key)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                disabled={!hasJobs && !isLoading}
                className={`group flex flex-col justify-between w-full h-full text-left p-5 sm:p-6 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                  hasJobs || isLoading
                    ? 'bg-canvas-card border-canvas-border hover:border-brand-500 hover:shadow-lg cursor-pointer'
                    : 'bg-canvas-subtle border-canvas-border opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                      hasJobs
                        ? 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'
                        : 'bg-canvas-subtle text-ink-400'
                    }`}
                  >
                    {cat.icon}
                  </div>

                  {/* Name */}
                  <h2
                    className={`text-base font-semibold mb-1.5 transition-colors duration-150 ${
                      hasJobs
                        ? 'text-ink-900 group-hover:text-brand-600'
                        : 'text-ink-500'
                    }`}
                  >
                    {cat.name}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                {/* Count / loading */}
                <div className="pt-3 border-t border-canvas-border/50 flex items-center justify-between mt-auto">
                  {isLoading ? (
                    <span className="h-4 w-16 rounded bg-canvas-subtle shimmer block" />
                  ) : hasJobs ? (
                    <span className="text-xs font-semibold text-brand-600">
                      {count} {count === 1 ? 'position' : 'positions'}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400">No open roles</span>
                  )}

                  {hasJobs && (
                    <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <div className="mt-16 pt-8 border-t border-canvas-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-ink-500">
          Looking for something specific?{' '}
          <a href="/jobs" className="text-brand-600 font-medium hover:underline">
            Search all jobs
          </a>{' '}
          with keyword and location filters.
        </p>
        <button
          onClick={() => navigate('/jobs')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-button bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 transition-colors"
        >
          Browse All Jobs
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </PageContainer>
  );
};

export default CategoriesPage;
