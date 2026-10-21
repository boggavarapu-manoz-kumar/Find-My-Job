import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ExternalLink, Sparkles } from 'lucide-react';
import { FEATURED_COMPANIES, Company } from '../data/companies';

interface CompanyCardProps {
  company: Company;
  isDuplicate?: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isDuplicate = false }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.a
      href={`/jobs?keyword=${encodeURIComponent(company.name)}`}
      aria-hidden={isDuplicate ? 'true' : undefined}
      tabIndex={isDuplicate ? -1 : 0}
      aria-label={`View opportunities at ${company.name}`}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex items-center justify-center shrink-0 w-48 sm:w-52 h-22 px-6 py-4 rounded-2xl bg-canvas-card/90 backdrop-blur-sm border border-canvas-border shadow-xs hover:border-brand-500 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 transition-all duration-300"
    >
      {/* Subtle top indicator dot on hover */}
      <div className="absolute top-2.5 left-3 w-1.5 h-1.5 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {imgError ? (
        <span className="font-semibold text-sm text-ink-800 group-hover:text-brand-600 transition-colors">
          {company.name}
        </span>
      ) : (
        <img
          src={company.logoUrl}
          alt={`${company.name} logo`}
          onError={() => setImgError(true)}
          loading="lazy"
          className="max-h-9 max-w-[125px] w-auto h-auto object-contain filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        />
      )}

      <ExternalLink className="absolute top-2.5 right-3 w-3.5 h-3.5 text-ink-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:text-brand-600 transition-all duration-200" />
    </motion.a>
  );
};

export const CompanyLogoMarquee: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="marquee-heading" className="py-12 border-y border-canvas-border bg-gradient-to-b from-canvas-subtle/50 via-canvas to-canvas-subtle/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hiring Partners</span>
            </div>
            <h2 id="marquee-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900">
              Trusted by Top Technology Companies & Startups
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
              Discover verified direct job openings from high-growth tech leaders and innovators.
            </p>
          </div>

          {/* Pause / Resume Accessibility Control for continuous marquee */}
          {!shouldReduceMotion && (
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume company logo animation' : 'Pause company logo animation'}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-600 bg-canvas-card border border-canvas-border rounded-xl hover:bg-canvas-subtle hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors shadow-xs"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-brand-600" />
                  <span>Resume Loop</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-ink-500" />
                  <span>Pause Loop</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Marquee Track Container with smooth fading mask edges */}
      <div
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft edge gradient fades for refined editorial aesthetic */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />

        {shouldReduceMotion ? (
          // Reduced-motion: Static, accessible horizontally scrollable strip
          <div
            className="flex items-center gap-5 overflow-x-auto px-6 py-2 scrollbar-thin focus-visible:ring-2 focus-visible:ring-brand-600"
            role="region"
            aria-label="Featured companies list"
            tabIndex={0}
          >
            {FEATURED_COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          // Continuously moving marquee with seamless duplication and in-place pause/resume
          <div className="flex overflow-hidden select-none py-3">
            <div
              className={`animate-marquee-track flex items-center gap-5 pr-5 ${
                isPaused ? 'animate-marquee-paused' : ''
              }`}
            >
              {/* First Track (Screen-reader focusable) */}
              {FEATURED_COMPANIES.map((company) => (
                <CompanyCard key={`track1-${company.id}`} company={company} />
              ))}
              {/* Duplicate Track for seamless infinite loop (Screen-reader aria-hidden) */}
              {FEATURED_COMPANIES.map((company) => (
                <CompanyCard key={`track2-${company.id}`} company={company} isDuplicate />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
