import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../features/jobs/LandingPage';
import { JobCard } from '../components/ui/JobCard';
import { jobService } from '../api/jobService';
import { DEV_FEATURED_JOBS, DEV_LATEST_JOBS } from '../features/jobs/fixtures';

describe('LandingPage UI Foundation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders hero title and search elements properly', async () => {
    vi.spyOn(jobService, 'getFeaturedJobs').mockResolvedValue(DEV_FEATURED_JOBS);
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 6,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Find the right job/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Job title, skill, or company/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/City or remote/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Explore Jobs/i })[0]).toBeInTheDocument();

    await screen.findAllByText(/Staff Software Engineer, Platform Infrastructure/i);
  });

  it('renders work mode and category discovery options', async () => {
    vi.spyOn(jobService, 'getFeaturedJobs').mockResolvedValue(DEV_FEATURED_JOBS);
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 6,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Remote').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hybrid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('On-site').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Internships').length).toBeGreaterThan(0);

    await screen.findAllByText(/Staff Software Engineer, Platform Infrastructure/i);
  });

  it('renders featured job cards with correct details on successful API response', async () => {
    vi.spyOn(jobService, 'getFeaturedJobs').mockResolvedValue(DEV_FEATURED_JOBS);
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 6,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const staffCards = await screen.findAllByText(/Staff Software Engineer, Platform Infrastructure/i);
    expect(staffCards.length).toBeGreaterThan(0);

    const fresherCards = await screen.findAllByText(/Graduate Associate Engineer/i);
    expect(fresherCards.length).toBeGreaterThan(0);
  });

  it('displays empty state message when no featured positions are open', async () => {
    vi.spyOn(jobService, 'getFeaturedJobs').mockResolvedValue([]);
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 6,
      totalElements: 0,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/No featured listings at this time/i)).toBeInTheDocument();
  });

  it('displays error message and retry button when featured jobs API fails', async () => {
    const getFeaturedSpy = vi
      .spyOn(jobService, 'getFeaturedJobs')
      .mockRejectedValueOnce(new Error('Connection timed out'));
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 6,
      totalElements: 0,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Could not load featured listings/i)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /Retry/i });
    expect(retryButton).toBeInTheDocument();

    getFeaturedSpy.mockResolvedValueOnce(DEV_FEATURED_JOBS);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByText(/Could not load featured listings/i)).not.toBeInTheDocument();
    });
  });

  it('formats undisclosed salary as  Not disclosed and never displays zero', () => {
    const jobWithHiddenSalary = DEV_FEATURED_JOBS.find((j) => j.hideSalary)!;
    render(<JobCard job={jobWithHiddenSalary} />);

    expect(screen.getByText(/Not disclosed/i)).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders categories and how-it-works sections', async () => {
    vi.spyOn(jobService, 'getFeaturedJobs').mockResolvedValue(DEV_FEATURED_JOBS);
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 6,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Browse by discipline/i)).toBeInTheDocument();
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    expect(screen.getByText(/Search with filters/i)).toBeInTheDocument();

    await screen.findAllByText(/Staff Software Engineer, Platform Infrastructure/i);
  });
});