import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, Check, Sparkles } from 'lucide-react';
import type { Job, EmploymentType, WorkMode, ExperienceLevel } from '../../../types/job.types';
import { Button } from '../../../components/ui/Button';
import { companyService, type CompanyResponse } from '../../../api/companyService';
import { CompanyLogo } from '../../../components/ui/CompanyLogo';
import { CompanyLogoUpload } from './CompanyLogoUpload';

export interface JobFormData {
  title: string;
  company: string;
  companyLogo: string;
  companyId?: number | null;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  fresherEligible: boolean;
  location: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  hideSalary: boolean;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string;
  applicationUrl: string;
  applicationDeadline: string;
  publishImmediately: boolean;
  featured: boolean;
}

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  initialData?: Job | null;
  mode: 'create' | 'edit';
}

export const CATEGORIES = [
  'Engineering',
  'Design',
  'Product & Marketing',
  'DevOps & Cloud',
  'Data Science & AI',
  'Finance & Operations',
  'Human Resources',
  'Hackathons',
  'Apprenticeships',
  'Events & Conferences',
  'Meetups & Networking',
  'Other',
];

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    companyLogo: '',
    category: 'Engineering',
    employmentType: 'FULL_TIME',
    workMode: 'REMOTE',
    experienceLevel: 'MID',
    fresherEligible: false,
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    salaryPeriod: 'YEAR',
    hideSalary: false,
    description: '',
    responsibilities: '',
    qualifications: '',
    skills: '',
    applicationUrl: '',
    applicationDeadline: '',
    publishImmediately: false,
    featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Company management & autocomplete state
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companySuggestions, setCompanySuggestions] = useState<CompanyResponse[]>([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyInputWrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyInputWrapperRef.current && !companyInputWrapperRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced company search
  useEffect(() => {
    if (!formData.company || formData.company.trim().length < 2 || !showCompanyDropdown) {
      setCompanySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCompany(true);
      try {
        const results = await companyService.searchCompanies(formData.company.trim(), 5);
        setCompanySuggestions(results);
      } catch {
        setCompanySuggestions([]);
      } finally {
        setIsSearchingCompany(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [formData.company, showCompanyDropdown]);

  // Populate data when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        companyLogo: initialData.companyLogo || '',
        companyId: initialData.companyId || null,
        category: initialData.category || 'Engineering',
        employmentType: initialData.employmentType || 'FULL_TIME',
        workMode: initialData.workMode || 'REMOTE',
        experienceLevel: initialData.experienceLevel || 'MID',
        fresherEligible: initialData.fresherEligible || false,
        location: initialData.location || '',
        salaryMin: initialData.salaryMin !== null && initialData.salaryMin !== undefined ? String(initialData.salaryMin) : '',
        salaryMax: initialData.salaryMax !== null && initialData.salaryMax !== undefined ? String(initialData.salaryMax) : '',
        salaryCurrency: initialData.salaryCurrency || 'USD',
        salaryPeriod: initialData.salaryPeriod || 'YEAR',
        hideSalary: initialData.hideSalary || false,
        description: initialData.description || '',
        responsibilities: initialData.responsibilities || '',
        qualifications: initialData.qualifications || '',
        skills: initialData.skills || '',
        applicationUrl: initialData.applicationUrl || '',
        applicationDeadline: initialData.applicationDeadline ? initialData.applicationDeadline.substring(0, 10) : '',
        publishImmediately: initialData.status === 'PUBLISHED',
        featured: initialData.featured || false,
      });
      setSelectedCompanyId(initialData.companyId || null);
    } else if (mode === 'create') {
      setFormData({
        title: '',
        company: '',
        companyLogo: '',
        companyId: null,
        category: 'Engineering',
        employmentType: 'FULL_TIME',
        workMode: 'REMOTE',
        experienceLevel: 'MID',
        fresherEligible: false,
        location: '',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD',
        salaryPeriod: 'YEAR',
        hideSalary: false,
        description: '',
        responsibilities: '',
        qualifications: '',
        skills: '',
        applicationUrl: '',
        applicationDeadline: '',
        publishImmediately: false,
        featured: false,
      });
      setSelectedCompanyId(null);
    }
    setErrors({});
    setServerError(null);
    setShowCompanyDropdown(false);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = 'Job title is required (up to 160 characters)';
    } else if (formData.title.length > 160) {
      errs.title = 'Job title must not exceed 160 characters';
    }

    if (!formData.company.trim()) {
      errs.company = 'Company name is required';
    } else if (formData.company.length > 120) {
      errs.company = 'Company name must not exceed 120 characters';
    }

    if (!formData.location.trim()) {
      errs.location = 'Location is required';
    }

    if (!formData.description.trim()) {
      errs.description = 'Job description is required';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Job description must be at least 20 characters';
    }

    if (!formData.applicationUrl.trim()) {
      errs.applicationUrl = 'External application URL is required';
    } else if (!/^https?:\/\/.+/i.test(formData.applicationUrl.trim())) {
      errs.applicationUrl = 'Application URL must start with http:// or https://';
    }

    if (formData.companyLogo.trim() && !/^(https?:\/\/|blob:).+/i.test(formData.companyLogo.trim())) {
      errs.companyLogo = 'Company logo must be a valid HTTP, HTTPS, or preview image URL';
    }

    const minSalary = formData.salaryMin ? Number(formData.salaryMin) : null;
    const maxSalary = formData.salaryMax ? Number(formData.salaryMax) : null;

    if (minSalary !== null && minSalary < 0) {
      errs.salaryMin = 'Minimum salary cannot be negative';
    }
    if (minSalary !== null && maxSalary !== null && maxSalary < minSalary) {
      errs.salaryMax = 'Maximum salary cannot be less than minimum salary';
    }
    if (formData.applicationDeadline) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.applicationDeadline < today) {
        errs.applicationDeadline = 'Application deadline must be today or in the future';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        companyLogo: formData.companyLogo.trim() || null,
        category: formData.category,
        employmentType: formData.employmentType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        fresherEligible: formData.fresherEligible,
        location: formData.location.trim(),
        salaryCurrency: formData.salaryCurrency,
        salaryPeriod: formData.salaryPeriod,
        hideSalary: formData.hideSalary,
        description: formData.description.trim(),
        responsibilities: formData.responsibilities.trim() || null,
        qualifications: formData.qualifications.trim() || null,
        skills: formData.skills.trim() || null,
        applicationUrl: formData.applicationUrl.trim(),
        applicationDeadline: formData.applicationDeadline ? formData.applicationDeadline : null,
        featured: formData.featured,
      };

      if (selectedCompanyId) {
        payload.companyId = selectedCompanyId;
      }

      if (formData.salaryMin) payload.salaryMin = Number(formData.salaryMin);
      else payload.salaryMin = null;

      if (formData.salaryMax) payload.salaryMax = Number(formData.salaryMax);
      else payload.salaryMax = null;

      if (mode === 'create') {
        payload.publishImmediately = formData.publishImmediately;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      let msg = 'Operation failed';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string; errors?: Record<string, string> };
        if (data.errors && typeof data.errors === 'object') {
          // Map backend field errors directly to form inputs
          setErrors((prev) => ({ ...prev, ...data.errors }));
          const firstFieldMessage = Object.values(data.errors)[0];
          msg = firstFieldMessage || data.message || 'Validation failed for one or more fields.';
        } else if (data.message) {
          msg = data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-3xl bg-canvas-card border border-canvas-border rounded-2xl shadow-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-border bg-canvas-subtle/40">
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                {mode === 'create' ? 'Create New Position' : `Edit Position: ${initialData?.title}`}
              </h2>
              <p className="text-xs text-ink-500">
                {mode === 'create'
                  ? 'Fill out all position parameters to save as draft or publish to live listings.'
                  : 'Update role details. Slugs and external links will be safely preserved.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700 p-1.5 rounded-lg hover:bg-canvas-subtle transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {serverError}
              </div>
            )}

            {/* Section 1: Core Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                1. Core Role Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.title && <p className="text-[11px] text-rose-500 mt-0.5">{errors.title}</p>}
                </div>

                <div ref={companyInputWrapperRef} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-ink-700">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    {selectedCompanyId ? (
                      <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Linked to verified company
                      </span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => {
                        setFormData({ ...formData, company: e.target.value });
                        setSelectedCompanyId(null);
                        setShowCompanyDropdown(true);
                      }}
                      onFocus={() => {
                        if (formData.company.trim().length >= 2) {
                          setShowCompanyDropdown(true);
                        }
                      }}
                      placeholder="e.g. Stripe, Google, Acme Corp"
                      className="w-full pl-9 pr-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Building2 className="w-4 h-4 text-ink-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                  {errors.company && <p className="text-[11px] text-rose-500 mt-0.5">{errors.company}</p>}

                  {/* Autocomplete Suggestions Dropdown */}
                  <AnimatePresence>
                    {showCompanyDropdown && (companySuggestions.length > 0 || isSearchingCompany) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-30 left-0 right-0 mt-1 bg-canvas-card border border-canvas-border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {isSearchingCompany && (
                          <div className="px-3 py-2 text-xs text-ink-400">Searching directory...</div>
                        )}
                        {companySuggestions.map((comp) => (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                company: comp.name,
                                companyLogo: comp.logoUrl || prev.companyLogo,
                              }));
                              setSelectedCompanyId(comp.id);
                              setShowCompanyDropdown(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-canvas-subtle transition-colors text-left border-b border-canvas-border/50 last:border-b-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CompanyLogo companyName={comp.name} logoUrl={comp.logoUrl} size="sm" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-ink-900 truncate">{comp.name}</p>
                                {comp.websiteUrl && (
                                  <p className="text-[10px] text-ink-400 truncate">{comp.websiteUrl}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-medium text-brand-600 shrink-0 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                              Select & Reuse Logo
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Company Logo Management */}
                <div className="sm:col-span-2 pt-1">
                  <CompanyLogoUpload
                    companyName={formData.company}
                    companyId={selectedCompanyId}
                    currentLogoUrl={formData.companyLogo}
                    onLogoUpdated={(newLogoUrl) => {
                      setFormData((prev) => ({ ...prev, companyLogo: newLogoUrl || '' }));
                    }}
                  />
                  {errors.companyLogo && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.companyLogo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.location && <p className="text-[11px] text-rose-500 mt-0.5">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Work Arrangements & Classification */}
            <div className="space-y-4 pt-4 border-t border-canvas-border">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                2. Classification & Eligibility
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value as WorkMode })}
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior Level</option>
                    <option value="LEAD">Lead / Staff</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-700">
                  <input
                    type="checkbox"
                    checked={formData.fresherEligible}
                    onChange={(e) => setFormData({ ...formData, fresherEligible: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Fresher / Graduate Eligible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Featured Opportunity</span>
                </label>
              </div>
            </div>

            {/* Section 3: Compensation */}
            <div className="space-y-4 pt-4 border-t border-canvas-border">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                3. Compensation (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="e.g. 120000"
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.salaryMin && <p className="text-[11px] text-rose-500 mt-0.5">{errors.salaryMin}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="e.g. 160000"
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.salaryMax && <p className="text-[11px] text-rose-500 mt-0.5">{errors.salaryMax}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={formData.salaryCurrency}
                    onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                    placeholder="USD"
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Period</label>
                  <select
                    value={formData.salaryPeriod}
                    onChange={(e) => setFormData({ ...formData, salaryPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="YEAR">Yearly</option>
                    <option value="MONTH">Monthly</option>
                    <option value="HOUR">Hourly</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-700">
                <input
                  type="checkbox"
                  checked={formData.hideSalary}
                  onChange={(e) => setFormData({ ...formData, hideSalary: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Hide salary from public display (Show &quot;Not disclosed&quot;)</span>
              </label>
            </div>

            {/* Section 4: Description & Content */}
            <div className="space-y-4 pt-4 border-t border-canvas-border">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                4. Job Content & Qualifications
              </h3>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Full Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of the position, team mission, and project responsibilities (min 20 characters)..."
                  className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.description && <p className="text-[11px] text-rose-500 mt-0.5">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Key Responsibilities</label>
                  <textarea
                    rows={3}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    placeholder="List core responsibilities..."
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Qualifications</label>
                  <textarea
                    rows={3}
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="Required skills and background..."
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Skills (Comma-separated tags)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Java, Spring Boot, MySQL, Docker, Kubernetes"
                  className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Section 5: Application & Publication */}
            <div className="space-y-4 pt-4 border-t border-canvas-border">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                5. Application Destination & Publishing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    External Application URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                    placeholder="https://company.com/careers/apply/123"
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.applicationUrl && <p className="text-[11px] text-rose-500 mt-0.5">{errors.applicationUrl}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas-base border border-canvas-border rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {mode === 'create' && (
                <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-900">Publish Immediately</p>
                    <p className="text-[11px] text-brand-700">
                      When enabled, this position will immediately appear on the public listings page. Otherwise saved as DRAFT.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.publishImmediately}
                    onChange={(e) => setFormData({ ...formData, publishImmediately: e.target.checked })}
                    className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-canvas-border">
              <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : mode === 'create' ? (
                  'Create Position'
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JobFormModal;
