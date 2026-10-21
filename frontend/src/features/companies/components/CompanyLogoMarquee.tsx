import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { FEATURED_COMPANIES, Company } from '../data/companies';

interface CompanyCardProps {
  company: Company;
  isDuplicate?: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isDuplicate = false }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={company.companyUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={isDuplicate ? 'true' : undefined}
      tabIndex={isDuplicate ? -1 : 0}
      aria-label={`View opportunities at ${company.name} (opens in a new tab)`}
      className="group relative flex items-center justify-center shrink-0 w-44 sm:w-48 h-20 px-6 py-3 rounded-card bg-canvas-card border border-canvas-border shadow-subtle hover:border-brand-400 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 transition-all duration-200"
    >
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
          className="max-h-10 max-w-[120px] w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105"
        />
      )}
      <span className="sr-only">, opens external discovery page in a new window</span>
      <ExternalLink className="absolute top-2 right-2 w-3 h-3 text-ink-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
    </a>
  );
};

export const CompanyLogoMarquee: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="marquee-heading" className="py-12 border-b border-canvas-border bg-canvas-subtle/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 block mb-1">
              Industry Leaders
            </span>
            <h2 id="marquee-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900">
              Explore opportunities at leading companies
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
              Discover opportunities across technology, product, engineering and other professional fields.
            </p>
          </div>

          {/* Pause / Resume Accessibility Control for continuous marquee */}
          {!shouldReduceMotion && (
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume company logo animation' : 'Pause company logo animation'}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-600 bg-canvas-card border border-canvas-border rounded-button hover:bg-canvas-subtle hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors shadow-xs"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-brand-600" />
                  <span>Resume Animation</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-ink-500" />
                  <span>Pause Animation</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Marquee Track Container */}
      <div
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft edge gradient fades for refined editorial aesthetic */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />

        {shouldReduceMotion ? (
          // Reduced-motion: Static, accessible horizontally scrollable strip
          <div
            className="flex items-center gap-6 overflow-x-auto px-6 py-2 scrollbar-thin focus-visible:ring-2 focus-visible:ring-brand-600"
            role="region"
            aria-label="Featured companies list"
            tabIndex={0}
          >
            {FEATURED_COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          // Continuously moving marquee with seamless duplication
          <div className="flex overflow-hidden select-none py-2">
            <motion.div
              className="flex items-center gap-6 shrink-0 pr-6"
              animate={{
                x: isPaused ? undefined : ['0%', '-50%'],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 34,
                  ease: 'linear',
                },
              }}
            >
              {/* First Track (Screen-reader focusable) */}
              {FEATURED_COMPANIES.map((company) => (
                <CompanyCard key={`track1-${company.id}`} company={company} />
              ))}
              {/* Duplicate Track for seamless infinite loop (Screen-reader aria-hidden) */}
              {FEATURED_COMPANIES.map((company) => (
                <CompanyCard key={`track2-${company.id}`} company={company} isDuplicate />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};
