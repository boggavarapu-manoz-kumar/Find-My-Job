import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  FileCheck,
  Building,
  Clock,
  MapPin,
  ExternalLink,
  Trash2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { CompanyLogo } from '../../components/ui/CompanyLogo';
import candidateService from '../../api/candidateService';
import type { SavedJob, JobApplication, ApplicationStatus } from '../../types/candidate.types';
import { useAuth } from '../../hooks/useAuth';

export const CandidateDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [unsavingId, setUnsavingId] = useState<number | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [savedRes, appsRes] = await Promise.all([
        candidateService.getSavedJobs(0, 50, signal),
        candidateService.getApplications(0, 50, signal),
      ]);

      setSavedJobs(savedRes.content);
      setApplications(appsRes.content);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to load candidate portal data. Please retry.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const handleUnsave = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnsavingId(jobId);
    const previous = [...savedJobs];
    // 0ms instant optimistic removal
    setSavedJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    try {
      await candidateService.unsaveJob(jobId);
    } catch {
      // Revert if API fails
      setSavedJobs(previous);
    } finally {
      setUnsavingId(null);
    }
  };

  const handleWithdraw = async (appId: number) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawingId(appId);
    try {
      const updated = await candidateService.withdrawApplication(appId);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: updated.status } : app))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'OFFER':
      case 'INTERVIEW':
        return 'success';
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return 'brand';
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <PageContainer size="wide" className="py-8 sm:py-12 space-y-8">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-canvas-card border border-canvas-border rounded-card shadow-card">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-1">
            Candidate Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Manage your saved listings, track application milestones, and discover opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/jobs">
            <PrimaryButton size="md" icon={<Briefcase className="w-4 h-4" />}>
              Explore More Jobs
            </PrimaryButton>
          </Link>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-canvas-border pb-1">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'applications'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Submitted Applications ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <LoadingSkeleton count={3} />
        </div>
      )}

      {/* Error state */}
      {!isLoading && errorMessage && (
        <div className="p-8 text-center bg-canvas-card border border-canvas-border rounded-card space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-ink-900">Unable to load dashboard data</h2>
          <p className="text-xs text-ink-500 max-w-sm mx-auto">{errorMessage}</p>
          <SecondaryButton size="sm" onClick={() => fetchData()} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Loading
          </SecondaryButton>
        </div>
      )}

      {/* Applications Tab Content */}
      {!isLoading && !errorMessage && activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="py-16 text-center bg-canvas-card border border-canvas-border rounded-card space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-ink-900">No applications submitted yet</h2>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">
                Ready to take the next step in your career? Browse open positions and apply directly.
              </p>
              <div className="pt-2">
                <Link to="/jobs">
                  <PrimaryButton size="sm">Search Open Opportunities</PrimaryButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-canvas-border bg-canvas-card border border-canvas-border rounded-card shadow-card overflow-hidden">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas-subtle transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <CompanyLogo
                      companyName={app.company}
                      logoUrl={app.companyLogo}
                      size="md"
                      className="mt-0.5"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                          {app.company}
                        </span>
                        <Badge variant={getStatusBadgeVariant(app.status)} size="sm">
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <Link
                        to={`/jobs/${app.jobSlug}`}
                        className="text-base sm:text-lg font-bold text-ink-900 hover:text-brand-600 transition-colors block truncate"
                      >
                        {app.jobTitle}
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-ink-400" />
                          {app.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-ink-400" />
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Submitted Resume
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to={`/jobs/${app.jobSlug}`}>
                      <SecondaryButton size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                        Job Details
                      </SecondaryButton>
                    </Link>

                    {app.status !== 'OFFER' && app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && (
                      <SecondaryButton
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                      >
                        {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Jobs Tab Content */}
      {!isLoading && !errorMessage && activeTab === 'saved' && (
        <div className="space-y-4">
          {savedJobs.length === 0 ? (
            <div className="py-16 text-center bg-canvas-card border border-canvas-border rounded-card space-y-4">
              <div className="w-12 h-12 rounded-full bg-canvas-subtle text-ink-400 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-ink-900">No saved jobs yet</h2>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">
                Bookmark exciting roles from the jobs directory to review and apply to later.
              </p>
              <div className="pt-2">
                <Link to="/jobs">
                  <SecondaryButton size="sm">Browse Directory</SecondaryButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map((saved) => (
                <div
                  key={saved.id}
                  onClick={() => navigate(`/jobs/${saved.slug}`)}
                  className="p-5 bg-canvas-card border border-canvas-border rounded-card shadow-xs hover:shadow-card hover:border-brand-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                        {saved.company}
                      </span>
                      <button
                        onClick={(e) => handleUnsave(saved.jobId, e)}
                        disabled={unsavingId === saved.jobId}
                        className="p-1.5 rounded-button text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                      {saved.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-ink-400" />
                        {saved.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-ink-400" />
                        {saved.category}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-canvas-border flex items-center justify-between text-xs">
                    <span className="text-ink-400">
                      Saved {new Date(saved.savedAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-brand-600 flex items-center gap-1">
                      View Opportunity <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};
