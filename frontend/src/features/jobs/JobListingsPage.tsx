import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  RefreshCw,
  X,
  AlertCircle,
  MapPin,
  Sparkles,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { JobCard } from '../../components/ui/JobCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SecondaryButton } from '../../components/ui/Button';
import { jobService } from '../../api/jobService';
import { SEOHead } from '../../components/seo/SEOHead';
import type { Job, PaginatedResponse } from '../../types/job.types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEBOUNCE_MS = 400;

// Sort options aligned with backend whitelist
const SORT_OPTIONS = [
  { value: 'publishedAt,desc', label: 'Most Recent' },
  { value: 'publishedAt,asc', label: 'Oldest First' },
  { value: 'title,asc', label: 'Title A → Z' },
  { value: 'title,desc', label: 'Title Z → A' },
  { value: 'company,asc', label: 'Company A → Z' },
  { value: 'salaryMax,desc', label: 'Highest Salary' },
  { value: 'salaryMax,asc', label: 'Lowest Salary' },
];

export const JobListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── URL state extraction ─────────────────────────────────────────────────────
  const keywordParam = searchParams.get('keyword') || '';
  const locationParam = searchParams.get('location') || '';
  const categoryParam = searchParams.get('category') || '';
  const workModeParam = searchParams.get('workMode') || '';
  const employmentTypeParam =
    searchParams.get('employmentType') || searchParams.get('type') || '';
  const experienceLevelParam = searchParams.get('experienceLevel') || '';
  const fresherParam = searchParams.get('fresher') === 'true';
  const sortParam = searchParams.get('sort') || 'publishedAt,desc';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const sizeParam = parseInt(searchParams.get('size') || '10', 10);
  const salaryMinParam = searchParams.get('salaryMin')
    ? parseInt(searchParams.get('salaryMin')!, 10)
    : undefined;
  const salaryMaxParam = searchParams.get('salaryMax')
    ? parseInt(searchParams.get('salaryMax')!, 10)
    : undefined;
  const dateFilterParam = searchParams.get('dateFilter') || '';
  const dateFromParam = searchParams.get('dateFrom') || '';
  const dateToParam = searchParams.get('dateTo') || '';

  // ── Local draft state (debounced before URL commit) ──────────────────────────
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [locationInput, setLocationInput] = useState(locationParam);
  const [salaryMinInput, setSalaryMinInput] = useState(
    salaryMinParam !== undefined ? String(salaryMinParam) : ''
  );
  const [salaryMaxInput, setSalaryMaxInput] = useState(
    salaryMaxParam !== undefined ? String(salaryMaxParam) : ''
  );
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(dateFilterParam === 'custom');

  // ── Data fetching state ──────────────────────────────────────────────────────
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Job>>(() => {
    return (
      jobService.getCachedLatestJobs({
        keyword: keywordParam || undefined,
        location: locationParam || undefined,
        category: categoryParam || undefined,
        workMode: workModeParam || undefined,
        employmentType: employmentTypeParam || undefined,
        experienceLevel: experienceLevelParam || undefined,
        fresher: fresherParam ? true : undefined,
        salaryMin: salaryMinParam,
        salaryMax: salaryMaxParam,
        dateFilter: dateFilterParam || undefined,
        dateFrom: dateFromParam || undefined,
        dateTo: dateToParam || undefined,
        sort: sortParam,
        page: pageParam,
        size: sizeParam,
      }) || {
        content: [],
        pageNumber: 0,
        pageSize: sizeParam,
        totalElements: 0,
        totalPages: 1,
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
      }
    );
  });
  const [isLoading, setIsLoading] = useState(() => paginatedData.content.length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Synchronize local draft inputs with URL params ────────────────────────────
  useEffect(() => {
    setKeywordInput(keywordParam);
    setLocationInput(locationParam);
    setSalaryMinInput(salaryMinParam !== undefined ? String(salaryMinParam) : '');
    setSalaryMaxInput(salaryMaxParam !== undefined ? String(salaryMaxParam) : '');
  }, [keywordParam, locationParam, salaryMinParam, salaryMaxParam]);

  // ── URL filter update helper ──────────────────────────────────────────────────
  const updateFilters = useCallback(
    (newParams: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          next.set(k, v);
        } else {
          next.delete(k);
        }
      });
      // Always reset page to 0 unless the caller explicitly sets a page
      if (!('page' in newParams)) {
        next.delete('page');
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const clearAllFilters = () => {
    setKeywordInput('');
    setLocationInput('');
    setSalaryMinInput('');
    setSalaryMaxInput('');
    setShowCustomDatePicker(false);
    setSearchParams(new URLSearchParams());
  };

  // ── Date filter helpers ───────────────────────────────────────────────────────
  const DATE_FILTER_OPTIONS = [
    { value: 'today',     label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'past3days', label: 'Last 3 Days' },
    { value: 'pastweek',  label: 'Past Week' },
    { value: 'pastmonth', label: 'Past Month' },
    { value: 'custom',    label: 'Custom Range' },
  ];

  const handleDateFilterClick = (value: string) => {
    if (value === 'custom') {
      setShowCustomDatePicker(true);
      updateFilters({ dateFilter: 'custom', dateFrom: null, dateTo: null });
    } else {
      setShowCustomDatePicker(false);
      if (dateFilterParam === value) {
        updateFilters({ dateFilter: null, dateFrom: null, dateTo: null });
      } else {
        updateFilters({ dateFilter: value, dateFrom: null, dateTo: null });
      }
    }
  };

  // ── Debounced keyword search ───────────────────────────────────────────────────
  const keywordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeywordInput(val);
    if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current);
    keywordDebounceRef.current = setTimeout(() => {
      updateFilters({ keyword: val.trim() || null });
    }, DEBOUNCE_MS);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationInput(val);
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(() => {
      updateFilters({ location: val.trim() || null });
    }, DEBOUNCE_MS);
  };

  // Clear debounce timers on unmount
  useEffect(() => {
    return () => {
      if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current);
      if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    };
  }, []);

  // ── Salary range application (applied on blur or Enter) ─────────────────────
  const applySalaryFilters = () => {
    const min = salaryMinInput.trim();
    const max = salaryMaxInput.trim();
    updateFilters({
      salaryMin: min ? min : null,
      salaryMax: max ? max : null,
    });
  };

  const handleSalaryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applySalaryFilters();
  };

  // ── Fetch jobs ────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(
    async (signal?: AbortSignal) => {
      // Only show full blocking skeleton on very first initial load when there is zero content
      if (paginatedData.content.length === 0) {
        setIsLoading(true);
      }
      setErrorMessage(null);
      try {
        const response = await jobService.getLatestJobs(
          {
            keyword: keywordParam || undefined,
            location: locationParam || undefined,
            category: categoryParam || undefined,
            workMode: workModeParam || undefined,
            employmentType: employmentTypeParam || undefined,
            experienceLevel: experienceLevelParam || undefined,
            fresher: fresherParam ? true : undefined,
            salaryMin: salaryMinParam,
            salaryMax: salaryMaxParam,
            dateFilter: dateFilterParam || undefined,
            dateFrom: dateFromParam || undefined,
            dateTo: dateToParam || undefined,
            sort: sortParam,
            page: pageParam,
            size: sizeParam,
          },
          signal
        );

        setPaginatedData(response);
        setErrorMessage(null);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        setPaginatedData((current) => {
          if (current.content.length === 0) {
            setErrorMessage(
              err instanceof Error
                ? err.message
                : 'Unable to communicate with the jobs service. Please check your connection or retry.'
            );
          } else {
            console.warn('Background job refresh delayed:', err);
          }
          return current;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      keywordParam,
      locationParam,
      categoryParam,
      workModeParam,
      employmentTypeParam,
      experienceLevelParam,
      fresherParam,
      salaryMinParam,
      salaryMaxParam,
      dateFilterParam,
      dateFromParam,
      dateToParam,
      sortParam,
      pageParam,
      sizeParam,
    ]
  );

  useEffect(() => {
    document.title = 'Browse Jobs | Find My Job';
    const controller = new AbortController();
    fetchJobs(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchJobs]);

  // ── Active filter detection ──────────────────────────────────────────────────
  const hasActiveFilters = Boolean(
    keywordParam ||
      locationParam ||
      categoryParam ||
      workModeParam ||
      employmentTypeParam ||
      experienceLevelParam ||
      fresherParam ||
      salaryMinParam !== undefined ||
      salaryMaxParam !== undefined ||
      dateFilterParam
  );

  const dateFilterLabel = (v: string) => {
    const map: Record<string, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      past3days: 'Last 3 Days',
      pastweek: 'Past Week',
      pastmonth: 'Past Month',
      custom: 'Custom Range',
    };
    return map[v] || v;
  };

  // ── Active filter badge labels for quick-dismiss chips ───────────────────────
  const activeFilterChips: { label: string; paramKey: string | string[] }[] = [
    ...(keywordParam ? [{ label: `"${keywordParam}"`, paramKey: 'keyword' }] : []),
    ...(locationParam ? [{ label: `📍 ${locationParam}`, paramKey: 'location' }] : []),
    ...(categoryParam ? [{ label: categoryParam, paramKey: 'category' }] : []),
    ...(workModeParam ? [{ label: workModeParam.replace('_', ' '), paramKey: 'workMode' }] : []),
    ...(employmentTypeParam
      ? [{ label: employmentTypeParam.replace('_', ' '), paramKey: 'employmentType' }]
      : []),
    ...(experienceLevelParam
      ? [{ label: `${experienceLevelParam} Level`, paramKey: 'experienceLevel' }]
      : []),
    ...(fresherParam ? [{ label: '🌟 Fresher Eligible', paramKey: 'fresher' }] : []),
    ...(salaryMinParam !== undefined
      ? [{ label: `Min $${salaryMinParam.toLocaleString()}`, paramKey: 'salaryMin' }]
      : []),
    ...(salaryMaxParam !== undefined
      ? [{ label: `Max $${salaryMaxParam.toLocaleString()}`, paramKey: 'salaryMax' }]
      : []),
    ...(dateFilterParam
      ? [{ label: `📅 ${dateFilterLabel(dateFilterParam)}`, paramKey: ['dateFilter', 'dateFrom', 'dateTo'] }]
      : []),
  ];

  const removeChip = (paramKey: string | string[]) => {
    const keys = Array.isArray(paramKey) ? paramKey : [paramKey];
    const updates: Record<string, null> = {};
    keys.forEach((k) => (updates[k] = null));
    updateFilters(updates);
  };

  return (
    <PageContainer size="wide" className="py-8 space-y-6 pb-20">
      {/* ── SEO Metadata ── */}
      <SEOHead
        title={categoryParam ? `${categoryParam} Jobs` : keywordParam ? `Search Jobs: ${keywordParam}` : 'Explore Jobs & Career Opportunities'}
        description={categoryParam ? `Explore verified ${categoryParam} job openings with direct employer applications and transparent salaries.` : 'Browse verified technology, engineering, remote, fresher, and internship positions on Find My Job.'}
        canonicalPath="/jobs"
      />

      {/* ── 1. Page Header ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionHeading
            title="Browse All Opportunities"
            subtitle="Explore verified technology, engineering, and design positions from reputable employers."
            tag="Jobs Directory"
          />

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-ink-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              aria-label="Sort jobs by"
              id="jobs-sort-select"
              className="text-xs font-medium px-3 py-1.5 rounded-button bg-canvas-card border border-canvas-border text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Filter Panel ────────────────────────────────────── */}
      <div className="bg-canvas-card border border-canvas-border rounded-card p-4 sm:p-5 shadow-card space-y-4">

        {/* Keyword + Location (auto-debounce, no submit needed) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6">
            <SearchInput
              value={keywordInput}
              onChange={handleKeywordChange}
              onClear={() => {
                setKeywordInput('');
                if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current);
                updateFilters({ keyword: null });
              }}
              placeholder="Filter by title, skill, or company..."
              aria-label="Search by job title, skill, or company"
              id="jobs-keyword-search"
            />
          </div>

          <div className="md:col-span-4 relative flex items-center">
            <div className="absolute left-3 text-ink-400 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="jobs-location-filter"
              type="text"
              value={locationInput}
              onChange={handleLocationChange}
              placeholder="City, State, or Remote..."
              aria-label="Filter by location"
              className="w-full h-10 pl-9 pr-3 rounded-button bg-canvas-subtle border border-canvas-border text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsFilterOpenMobile(!isFilterOpenMobile)}
              className="md:hidden px-3 h-10 rounded-button border border-canvas-border bg-canvas-subtle text-ink-700 flex items-center justify-center gap-1.5 text-xs font-medium"
              aria-label="Toggle filter options"
              aria-expanded={isFilterOpenMobile}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Structured Filters */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-canvas-border ${
            isFilterOpenMobile ? 'block sm:grid' : 'hidden md:grid'
          }`}
        >
          {/* Category */}
          <div className="space-y-1">
            <label
              htmlFor="filter-category"
              className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block"
            >
              Discipline
            </label>
            <FilterSelect
              value={categoryParam}
              onChange={(e) => updateFilters({ category: e.target.value || null })}
              placeholder="All Disciplines"
              aria-label="Filter by Discipline"
              id="filter-category"
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Design', label: 'Design & Creative' },
                { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
                { value: 'Data Science & AI', label: 'Data Science & AI' },
                { value: 'Product & Marketing', label: 'Product & Marketing' },
              ]}
              className="w-full"
            />
          </div>

          {/* Work Mode */}
          <div className="space-y-1">
            <label
              htmlFor="filter-work-mode"
              className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block"
            >
              Work Mode
            </label>
            <FilterSelect
              value={workModeParam}
              onChange={(e) => updateFilters({ workMode: e.target.value || null })}
              placeholder="All Work Modes"
              aria-label="Filter by Work Mode"
              id="filter-work-mode"
              options={[
                { value: 'REMOTE', label: '🌐 Remote' },
                { value: 'HYBRID', label: '🏢 Hybrid' },
                { value: 'ONSITE', label: '📍 Onsite' },
              ]}
              className="w-full"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-1">
            <label
              htmlFor="filter-experience"
              className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block"
            >
              Experience Level
            </label>
            <FilterSelect
              value={experienceLevelParam}
              onChange={(e) => updateFilters({ experienceLevel: e.target.value || null })}
              placeholder="All Experience Levels"
              aria-label="Filter by Experience Level"
              id="filter-experience"
              options={[
                { value: 'ENTRY', label: 'Entry Level (0-2 yrs)' },
                { value: 'MID', label: 'Mid Level (2-5 yrs)' },
                { value: 'SENIOR', label: 'Senior Level (5+ yrs)' },
                { value: 'LEAD', label: 'Lead / Principal' },
                { value: 'EXECUTIVE', label: 'Executive / C-Level' },
              ]}
              className="w-full"
            />
          </div>

          {/* Employment Type */}
          <div className="space-y-1">
            <label
              htmlFor="filter-employment"
              className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block"
            >
              Employment Type
            </label>
            <FilterSelect
              value={employmentTypeParam}
              onChange={(e) =>
                updateFilters({ employmentType: e.target.value || null, type: null })
              }
              placeholder="All Employment Types"
              aria-label="Filter by Employment Type"
              id="filter-employment"
              options={[
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'INTERNSHIP', label: 'Internship' },
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* Salary Range Row */}
        <div
          className={`pt-3 border-t border-canvas-border ${
            isFilterOpenMobile ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="space-y-1 flex-1">
              <label
                htmlFor="filter-salary-min"
                className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block"
              >
                Min Salary
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-ink-400 pointer-events-none">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <input
                  id="filter-salary-min"
                  type="number"
                  min={0}
                  value={salaryMinInput}
                  onChange={(e) => setSalaryMinInput(e.target.value)}
                  onBlur={applySalaryFilters}
                  onKeyDown={handleSalaryKeyDown}
                  placeholder="e.g. 50000"
                  aria-label="Minimum annual salary"
                  className="w-full h-9 pl-8 pr-3 rounded-button bg-canvas-subtle border border-canvas-border text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center pb-1.5">
              <span className="text-xs text-ink-400 font-medium">—</span>
            </div>

            <div className="space-y-1 flex-1">
              <label
                htmlFor="filter-salary-max"
                className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block"
              >
                Max Salary
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-ink-400 pointer-events-none">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <input
                  id="filter-salary-max"
                  type="number"
                  min={0}
                  value={salaryMaxInput}
                  onChange={(e) => setSalaryMaxInput(e.target.value)}
                  onBlur={applySalaryFilters}
                  onKeyDown={handleSalaryKeyDown}
                  placeholder="e.g. 150000"
                  aria-label="Maximum annual salary"
                  className="w-full h-9 pl-8 pr-3 rounded-button bg-canvas-subtle border border-canvas-border text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                />
              </div>
            </div>

            <div className="hidden sm:block flex-shrink-0 pb-0.5">
              <SecondaryButton
                size="sm"
                onClick={applySalaryFilters}
                className="h-9 text-xs"
                aria-label="Apply salary range filter"
              >
                Apply Range
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Date Posted Filter */}
        <div
          className={`pt-3 border-t border-canvas-border ${
            isFilterOpenMobile ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              Date Posted
            </label>
            <div className="flex flex-wrap gap-2">
              {[{ value: 'today', label: 'Today' }, { value: 'yesterday', label: 'Yesterday' }, { value: 'past3days', label: 'Last 3 Days' }, { value: 'pastweek', label: 'Past Week' }, { value: 'pastmonth', label: 'Past Month' }, { value: 'custom', label: '📅 Custom' }].map((opt) => {
                const isActive = dateFilterParam === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    id={`date-filter-${opt.value}`}
                    onClick={() => handleDateFilterClick(opt.value)}
                    aria-pressed={isActive}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-canvas-subtle text-ink-600 border-canvas-border hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Custom date range picker — only shown when 'Custom' is active */}
            {showCustomDatePicker && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 flex-1">
                  <label htmlFor="date-from" className="text-[11px] font-semibold text-ink-500 whitespace-nowrap">
                    From
                  </label>
                  <input
                    id="date-from"
                    type="date"
                    value={dateFromParam}
                    max={dateToParam || undefined}
                    onChange={(e) => updateFilters({ dateFilter: 'custom', dateFrom: e.target.value || null })}
                    aria-label="Posted from date"
                    className="flex-1 h-8 px-2 rounded-button bg-canvas-subtle border border-canvas-border text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label htmlFor="date-to" className="text-[11px] font-semibold text-ink-500 whitespace-nowrap">
                    To
                  </label>
                  <input
                    id="date-to"
                    type="date"
                    value={dateToParam}
                    min={dateFromParam || undefined}
                    onChange={(e) => updateFilters({ dateFilter: 'custom', dateTo: e.target.value || null })}
                    aria-label="Posted to date"
                    className="flex-1 h-8 px-2 rounded-button bg-canvas-subtle border border-canvas-border text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                  />
                </div>
                {(dateFromParam || dateToParam) && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ dateFrom: null, dateTo: null })}
                    className="text-[11px] text-ink-400 hover:text-ink-700 transition-colors whitespace-nowrap"
                    aria-label="Clear custom date range"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter Footer: Fresher toggle & Clear all */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-canvas-border text-xs">
          <label className="flex items-center gap-2 text-ink-700 cursor-pointer font-medium select-none">
            <input
              id="filter-fresher"
              type="checkbox"
              checked={fresherParam}
              onChange={(e) => updateFilters({ fresher: e.target.checked ? 'true' : null })}
              className="rounded border-canvas-border text-brand-600 focus:ring-brand-600"
              aria-label="Show only fresher eligible opportunities"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Show only Fresher / Campus Graduate eligible roles
            </span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              id="clear-all-filters-btn"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
              aria-label="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Active Filter Chips ──────────────────────────────────────── */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {activeFilterChips.map((chip) => (
            <span
              key={String(chip.paramKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => removeChip(chip.paramKey)}
                aria-label={`Remove ${chip.label} filter`}
                className="text-brand-500 hover:text-brand-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── 4. Results Header & Count ───────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-ink-500 px-1">
        <div>
          {isLoading ? (
            <span>Loading verified opportunities...</span>
          ) : (
            <span>
              Showing{' '}
              <strong className="text-ink-900 font-semibold">
                {paginatedData.totalElements === 0
                  ? 0
                  : paginatedData.pageNumber * paginatedData.pageSize + 1}
                -
                {Math.min(
                  (paginatedData.pageNumber + 1) * paginatedData.pageSize,
                  paginatedData.totalElements
                )}
              </strong>{' '}
              of <strong className="text-ink-900 font-semibold">{paginatedData.totalElements}</strong>{' '}
              positions
            </span>
          )}
        </div>

        {/* Items per page */}
        <div className="hidden sm:flex items-center gap-2">
          <span>Items per page:</span>
          <div className="flex items-center gap-1">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateFilters({ size: size.toString(), page: '0' })}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  paginatedData.pageSize === size
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-600 hover:bg-canvas-subtle'
                }`}
                aria-label={`Show ${size} items per page`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Results Area ─────────────────────────────────────────────── */}
      {errorMessage ? (
        <div className="p-8 bg-canvas-card border border-rose-200 rounded-card text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-900">Service Communication Issue</h3>
            <p className="text-xs text-ink-500 mt-1 leading-relaxed">{errorMessage}</p>
          </div>
          <SecondaryButton size="sm" onClick={() => fetchJobs()} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Fetching Jobs
          </SecondaryButton>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton count={4} />
      ) : paginatedData.content.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {paginatedData.content.map((job) => (
              <div key={job.id} className="flex h-full">
                <JobCard
                  job={job}
                  className="w-full"
                  onClick={() => navigate(`/jobs/${job.slug}`, { state: { initialJob: job } })}
                />
              </div>
            ))}
          </div>

          {/* ── 6. Pagination Controls ──────────────────────────────────── */}
          {paginatedData.totalPages > 1 && (
            <div className="pt-8 border-t border-canvas-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-ink-500 order-2 sm:order-1">
                Page{' '}
                <strong className="text-ink-900 font-semibold">
                  {paginatedData.pageNumber + 1}
                </strong>{' '}
                of{' '}
                <strong className="text-ink-900 font-semibold">{paginatedData.totalPages}</strong>
              </span>

              <nav aria-label="Job results pagination" className="flex items-center gap-1 order-1 sm:order-2">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => updateFilters({ page: '0' })}
                  disabled={paginatedData.isFirst}
                  aria-label="Go to first page"
                  className="p-2 rounded-button border border-canvas-border bg-canvas-card text-ink-700 hover:bg-canvas-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ page: (paginatedData.pageNumber - 1).toString() })
                  }
                  disabled={!paginatedData.hasPrevious}
                  aria-label="Go to previous page"
                  className="p-2 rounded-button border border-canvas-border bg-canvas-card text-ink-700 hover:bg-canvas-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page number buttons with ellipsis */}
                {Array.from({ length: paginatedData.totalPages }).map((_, idx) => {
                  const isCurrent = idx === paginatedData.pageNumber;
                  const isNearby = Math.abs(idx - paginatedData.pageNumber) <= 1;
                  const isEdge = idx === 0 || idx === paginatedData.totalPages - 1;

                  if (!isNearby && !isEdge) {
                    if (idx === 1 || idx === paginatedData.totalPages - 2) {
                      return (
                        <span key={idx} className="px-2 text-ink-400 text-xs">
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateFilters({ page: idx.toString() })}
                      aria-current={isCurrent ? 'page' : undefined}
                      aria-label={`Page ${idx + 1}`}
                      className={`min-w-[36px] h-9 px-2 rounded-button text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-subtle'
                          : 'bg-canvas-card border border-canvas-border text-ink-700 hover:bg-canvas-subtle'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ page: (paginatedData.pageNumber + 1).toString() })
                  }
                  disabled={!paginatedData.hasNext}
                  aria-label="Go to next page"
                  className="p-2 rounded-button border border-canvas-border bg-canvas-card text-ink-700 hover:bg-canvas-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ page: (paginatedData.totalPages - 1).toString() })
                  }
                  disabled={paginatedData.isLast}
                  aria-label="Go to last page"
                  className="p-2 rounded-button border border-canvas-border bg-canvas-card text-ink-700 hover:bg-canvas-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No opportunities found"
          description={
            hasActiveFilters
              ? 'No positions match your specific filter criteria. Try adjusting or clearing your filters to see more openings.'
              : 'There are currently no open positions listed on the directory.'
          }
          actionText={hasActiveFilters ? 'Clear all filters' : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
        />
      )}
    </PageContainer>
  );
};
