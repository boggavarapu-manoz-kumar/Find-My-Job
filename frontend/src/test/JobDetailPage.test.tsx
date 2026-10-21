import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { JobDetailPage } from '../features/jobs/JobDetailPage';
import { jobService } from '../api/jobService';
import { DEV_FEATURED_JOBS } from '../features/jobs/fixtures';

describe('JobDetailPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('renders complete job details from slug on direct navigation or page refresh', async () => {
    const targetJob = DEV_FEATURED_JOBS[0]; // Stripe job
    vi.spyOn(jobService, 'getJobBySlug').mockResolvedValue(targetJob);
    vi.spyOn(jobService, 'getRelatedJobs').mockResolvedValue(DEV_FEATURED_JOBS.slice(1, 3));

    render(
      <MemoryRouter initialEntries={[`/jobs/${targetJob.slug}`]}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Job title and company
    expect(await screen.findByRole('heading', { name: targetJob.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(targetJob.company)).toBeInTheDocument();

    // Work mode and location
    expect(screen.getByText(/San Francisco, CA/i)).toBeInTheDocument();

    // Descriptions and responsibilities
    expect(screen.getByText(targetJob.description)).toBeInTheDocument();
    expect(screen.getByText(/Core Responsibilities/i)).toBeInTheDocument();

    // Prominent Apply Now and share actions
    expect(await screen.findByRole('button', { name: /Apply Now/i })).toBeInTheDocument();
    expect(await screen.findByLabelText(/Copy canonical job link/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Share/i })).toBeInTheDocument();
  });

  it('renders "Opportunity Not Found" state for invalid slugs', async () => {
    vi.spyOn(jobService, 'getJobBySlug').mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/jobs/non-existent-slug-xyz-999']}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /Opportunity Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/Browse active directory/i)).toBeInTheDocument();
  });

  it('renders error state and retry action when detail API fails', async () => {
    const getJobSpy = vi
      .spyOn(jobService, 'getJobBySlug')
      .mockRejectedValueOnce(new Error('Backend connection refused'));

    render(
      <MemoryRouter initialEntries={['/jobs/stripe-job-slug']}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /Communication Error/i })).toBeInTheDocument();
    expect(screen.getByText(/Backend connection refused/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry Loading Job/i });
    expect(retryBtn).toBeInTheDocument();

    getJobSpy.mockResolvedValueOnce(DEV_FEATURED_JOBS[0]);
    vi.spyOn(jobService, 'getRelatedJobs').mockResolvedValue([]);
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Communication Error/i })).not.toBeInTheDocument();
    });
  });

  it('dispatches external application URL on Apply Now action', async () => {
    const targetJob = DEV_FEATURED_JOBS[0];
    vi.spyOn(jobService, 'getJobBySlug').mockResolvedValue(targetJob);
    vi.spyOn(jobService, 'getRelatedJobs').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={[`/jobs/${targetJob.slug}`]}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const applyBtn = await screen.findByRole('button', { name: /Apply Now/i });
    fireEvent.click(applyBtn);

    expect(window.open).toHaveBeenCalledWith(
      targetJob.applicationUrl,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('correctly formats undisclosed salary as "Not disclosed" and avoids zero', async () => {
    const jobWithHiddenSalary = DEV_FEATURED_JOBS.find((j) => j.hideSalary)!;
    vi.spyOn(jobService, 'getJobBySlug').mockResolvedValue(jobWithHiddenSalary);
    vi.spyOn(jobService, 'getRelatedJobs').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={[`/jobs/${jobWithHiddenSalary.slug}`]}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: jobWithHiddenSalary.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Not disclosed/i)).toBeInTheDocument();
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('copies canonical URL to clipboard on Copy Link action', async () => {
    const targetJob = DEV_FEATURED_JOBS[0];
    vi.spyOn(jobService, 'getJobBySlug').mockResolvedValue(targetJob);
    vi.spyOn(jobService, 'getRelatedJobs').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={[`/jobs/${targetJob.slug}`]}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const copyBtn = await screen.findByLabelText(/Copy canonical job link/i);
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('renders real related opportunities when matching category records exist', async () => {
    const targetJob = DEV_FEATURED_JOBS[0]; // Engineering category
    const relatedJob = DEV_FEATURED_JOBS[1];
    vi.spyOn(jobService, 'getJobBySlug').mockResolvedValue(targetJob);
    vi.spyOn(jobService, 'getRelatedJobs').mockResolvedValue([relatedJob]);

    render(
      <MemoryRouter initialEntries={[`/jobs/${targetJob.slug}`]}>
        <Routes>
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: targetJob.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Similar Positions in ${targetJob.category}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(relatedJob.title)).toBeInTheDocument();
  });
});
