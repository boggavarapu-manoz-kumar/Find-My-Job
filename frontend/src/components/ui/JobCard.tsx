import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, ArrowUpRight, Clock, Building2 } from 'lucide-react';
import { Badge, Tag } from '../ui/Badge';
import { cardInteractiveHover } from '../../utils/motion';
import { formatPostedDate } from '../../utils/dateUtils';
import type { Job } from '../../types/job.types';

export interface JobCardProps {
  job: Job;
  onClick?: () => void;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const formatSalary = (): string | null => {
    if (job.hideSalary || (!job.salaryMin && !job.salaryMax)) return null;
    const currency =
      job.salaryCurrency === 'USD' ? '$' : job.salaryCurrency === 'EUR' ? '€' : '£';
    const period = job.salaryPeriod ? ` / ${job.salaryPeriod.toLowerCase()}` : '';
    if (job.salaryMin && job.salaryMax) {
      return `${currency}${Math.round(job.salaryMin / 1000)}k – ${currency}${Math.round(job.salaryMax / 1000)}k${period}`;
    }
    if (job.salaryMin) return `From ${currency}${Math.round(job.salaryMin / 1000)}k${period}`;
    return `Up to ${currency}${Math.round(job.salaryMax! / 1000)}k${period}`;
  };

  const salary = formatSalary();
  const postedDateLabel = formatPostedDate(job.publishedAt || job.createdAt);

  const skillList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : cardInteractiveHover}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      /* h-full ensures the card fills its grid cell so all cards in a row are equal height */
      className={`group flex flex-col h-full p-5 bg-canvas-card border border-canvas-border rounded-card hover:border-brand-400/70 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer ${className}`}
    >
      {/* ── Header row: company · category · entry-level badge · timestamp ── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Company logo placeholder / icon */}
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-brand-50 border border-brand-100 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-brand-500" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-ink-800 uppercase tracking-wide leading-none truncate max-w-[160px]">
              {job.company}
            </span>
            <span className="text-[11px] text-ink-400 leading-none mt-0.5 truncate max-w-[160px]">
              {job.category}
            </span>
          </div>
          {job.fresherEligible && (
            <Badge variant="success" size="sm">
              Entry-level
            </Badge>
          )}
        </div>

        {/* Timestamp — always pinned to the right, never wraps */}
        <span
          className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400 bg-canvas-subtle px-2 py-0.5 rounded-full border border-canvas-border shrink-0"
          title={`Posted on ${new Date(job.publishedAt || job.createdAt).toLocaleDateString()}`}
        >
          <Clock className="w-3 h-3 text-brand-500 shrink-0" />
          <span>{postedDateLabel}</span>
        </span>
      </div>

      {/* ── Title ── */}
      <h3 className="text-[15px] font-semibold text-ink-900 group-hover:text-brand-600 transition-colors leading-snug mb-3 flex items-start gap-1.5">
        <span className="line-clamp-2">{job.title}</span>
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-brand-500" />
      </h3>

      {/* ── Meta row: location · work mode · type · salary ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 mb-3">
        <span className="inline-flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-ink-400 shrink-0" />
          <span className="truncate max-w-[130px]">{job.location}</span>
          <span className="text-ink-300 mx-0.5">·</span>
          <span className="capitalize">{job.workMode.toLowerCase()}</span>
        </span>
        <span className="inline-flex items-center gap-1 shrink-0">
          <Briefcase className="w-3 h-3 text-ink-400 shrink-0" />
          <span className="capitalize">{job.employmentType.replace(/_/g, ' ').toLowerCase()}</span>
        </span>
        <span className="inline-flex items-center gap-1 shrink-0">
          <DollarSign className="w-3 h-3 text-ink-400 shrink-0" />
          <span>{salary ?? 'Not disclosed'}</span>
        </span>
      </div>

      {/* ── Skills ── */}
      {skillList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skillList.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      )}

      {/* ── Spacer pushes footer to the bottom regardless of content height ── */}
      <div className="grow" />

      {/* ── Footer: deadline + CTA ── */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-canvas-border mt-2">
        {job.applicationDeadline ? (
          <span className="text-[11px] text-ink-400 truncate">
            Closes{' '}
            {new Date(job.applicationDeadline).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        ) : (
          /* Keep footer height stable even without a deadline */
          <span />
        )}
        <span className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-button bg-canvas-subtle border border-canvas-border text-ink-700 text-xs font-semibold group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-all shrink-0">
          View details
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
};
