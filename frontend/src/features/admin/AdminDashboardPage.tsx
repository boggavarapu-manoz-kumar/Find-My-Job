import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import adminJobService from '../../api/adminJobService';
import type { Job, JobStatus } from '../../types/job.types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { JobFormModal } from './components/JobFormModal';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch admin jobs
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminJobService.getAdminJobs({ page, size: pageSize });
      setJobs(response.content);
      setTotalJobs(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load jobs';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedJob(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (job: Job) => {
    setSelectedJob(job);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle Create or Edit Submit
  const handleModalSubmit = async (payload: Record<string, unknown>) => {
    if (modalMode === 'create') {
      await adminJobService.createJob(payload);
      setSuccessMessage('Job position created successfully.');
    } else if (selectedJob) {
      await adminJobService.updateJob(selectedJob.id, payload);
      setSuccessMessage(`Job "${selectedJob.title}" updated successfully.`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
    fetchJobs();
  };

  // Handle status toggle (e.g. DRAFT <-> PUBLISHED)
  const handleToggleStatus = async (job: Job) => {
    const nextStatus: JobStatus = job.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await adminJobService.updateJobStatus(job.id, nextStatus);
      setSuccessMessage(`Job "${job.title}" transitioned to ${nextStatus}`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchJobs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
    }
  };

  // Handle archive
  const handleArchive = async (job: Job) => {
    if (!window.confirm(`Are you sure you want to archive "${job.title}"?`)) {
      return;
    }
    try {
      await adminJobService.archiveJob(job.id);
      setSuccessMessage(`Job "${job.title}" archived successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchJobs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to archive job';
      setError(msg);
    }
  };

  // Filter jobs locally by search and status
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate real summaries from current job dataset
  const publishedCount = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const draftCount = jobs.filter((j) => j.status === 'DRAFT').length;
  const archivedCount = jobs.filter((j) => j.status === 'ARCHIVED').length;

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner / Account Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-canvas-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
            Administration
          </span>
          <h1 className="text-2xl font-bold text-ink-900 mt-1">Platform Operations & Job Management</h1>
          <p className="text-xs text-ink-500">
            Authenticated as <strong className="text-ink-700">{user?.username}</strong> ({user?.email}) with role{' '}
            <strong className="text-ink-700">{user?.role}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            + Post New Job
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Real Metric Summaries */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border shadow-xs">
          <p className="text-xs font-medium text-ink-500">Total In Database</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{totalJobs}</p>
        </div>
        <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border shadow-xs">
          <p className="text-xs font-medium text-emerald-600">Published Active</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{publishedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border shadow-xs">
          <p className="text-xs font-medium text-amber-600">Draft Positions</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{draftCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border shadow-xs">
          <p className="text-xs font-medium text-ink-400">Archived Positions</p>
          <p className="text-2xl font-bold text-ink-600 mt-1">{archivedCount}</p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas-card p-4 rounded-xl border border-canvas-border shadow-xs">
        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-canvas-base border border-canvas-border text-ink-600 hover:bg-canvas-subtle'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or company..."
            className="w-full px-3 py-1.5 text-xs bg-canvas-base border border-canvas-border rounded-lg text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-canvas-card border border-canvas-border rounded-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-ink-500">Loading positions from database...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-ink-900">No positions match the selected criteria.</p>
            <p className="text-xs text-ink-500">Try adjusting your status filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-canvas-border bg-canvas-subtle/50 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <th className="py-3 px-4">Role Title & Company</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Work Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Views / Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border text-xs">
                {filteredJobs.map((job) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-canvas-subtle/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink-900 flex items-center gap-2">
                        <span>{job.title}</span>
                        {job.featured && <Badge variant="neutral">Featured</Badge>}
                      </div>
                      <div className="text-[11px] text-ink-500 flex items-center gap-1.5 mt-0.5">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        {job.slug && (
                          <>
                            <span>•</span>
                            <a
                              href={`/jobs/${job.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:underline"
                            >
                              Public Link ↗
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-600">{job.category}</td>
                    <td className="py-3.5 px-4 text-ink-600">
                      <div>{job.workMode}</div>
                      <div className="text-[10px] text-ink-400">{job.employmentType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {job.status === 'PUBLISHED' && <Badge variant="success">PUBLISHED</Badge>}
                      {job.status === 'DRAFT' && <Badge variant="warning">DRAFT</Badge>}
                      {job.status === 'ARCHIVED' && <Badge variant="neutral">ARCHIVED</Badge>}
                    </td>
                    <td className="py-3.5 px-4 text-ink-500">
                      <span>{job.viewsCount ?? 0} views</span>
                      <span className="mx-1">•</span>
                      <span>{job.clicksCount ?? 0} clicks</span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(job)}
                        className="px-2.5 py-1 text-[11px] font-medium border border-canvas-border rounded hover:bg-canvas-subtle transition-colors text-ink-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="px-2.5 py-1 text-[11px] font-medium border border-canvas-border rounded hover:bg-canvas-subtle transition-colors text-ink-700"
                      >
                        {job.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                      {job.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleArchive(job)}
                          className="px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-canvas-border bg-canvas-subtle/30 text-xs">
            <span className="text-ink-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Job Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedJob}
        mode={modalMode}
      />
    </div>
  );
};

export default AdminDashboardPage;
