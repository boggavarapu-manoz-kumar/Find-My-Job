import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Briefcase, Clock, ArrowUpRight } from 'lucide-react';
import { Badge, Tag } from '../ui/Badge';
import { cardInteractiveHover } from '../../utils/motion';
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

  // Format salary display cleanly without hardcoding 0
  const formatSalary = () => {
    if (job.hideSalary || (!job.salaryMin && !job.salaryMax)) {
      return 'Not disclosed';
    }
    const currency = job.salaryCurrency === 'USD' ? '$' : job.salaryCurrency === 'EUR' ? '€' : '£';
    const period = job.salaryPeriod ? ` / ${job.salaryPeriod.toLowerCase()}` : '';

    if (job.salaryMin && job.salaryMax) {
      return `${currency}${Math.round(job.salaryMin / 1000)}k - ${currency}${Math.round(job.salaryMax / 1000)}k${period}`;
    }
    if (job.salaryMin) {
      return `From ${currency}${Math.round(job.salaryMin / 1000)}k${period}`;
    }
    return `Up to ${currency}${Math.round(job.salaryMax! / 1000)}k${period}`;
  };

  const skillList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4)
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
      className={`group relative p-6 bg-canvas-card border border-canvas-border rounded-card hover:border-brand-400/80 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left column: Title, Company, Metadata */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-ink-600 uppercase tracking-wider">
              {job.company}
            </span>
            <span className="text-ink-300">•</span>
            <span className="text-xs text-ink-500 font-medium">{job.category}</span>
            {job.fresherEligible ? (
              <Badge variant="success" size="sm">
                Fresher Eligible
              </Badge>
            ) : null}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-ink-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5 truncate">
            {job.title}
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-brand-600" />
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-ink-400" />
              {job.location} ({job.workMode.toLowerCase()})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-ink-400" />
              {job.employmentType.replace('_', ' ').toLowerCase()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-ink-400" />
              {formatSalary()}
            </span>
          </div>

          {skillList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skillList.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right column: Action */}
        <div className="sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-button bg-canvas-subtle border border-canvas-border text-ink-800 text-xs font-semibold group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-all shadow-xs">
            View Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
