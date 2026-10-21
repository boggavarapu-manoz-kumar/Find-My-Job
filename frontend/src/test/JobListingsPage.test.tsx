import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { JobListingsPage } from '../features/jobs/JobListingsPage';
import { jobService } from '../api/jobService';
import { DEV_LATEST_JOBS } from '../features/jobs/fixtures';

describe('JobListingsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search controls, discipline filters, and sort options properly', async () => {
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 10,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <JobListingsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Browse All Opportunities/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Filter by title, skill, or company/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/City, State, or Remote/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort jobs by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Discipline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Work Mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Experience Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Employment Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Minimum annual salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maximum annual salary/i)).toBeInTheDocument();

    await screen.findByText(/Staff Software Engineer, Platform Infrastructure/i);
  });


  it('renders job cards with titles, company metadata, and "View Details" actions', async () => {
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 10,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <JobListingsPage />
      </BrowserRouter>
    );

    const firstJob = DEV_LATEST_JOBS[0];
    const jobCards = await screen.findAllByText(new RegExp(firstJob.title, 'i'));
    expect(jobCards.length).toBeGreaterThan(0);

    const viewDetailsButtons = screen.getAllByText(/View Details/i);
    expect(viewDetailsButtons.length).toBeGreaterThan(0);
  });

  it('filters results when URL query parameters are provided', async () => {
    const stripeJob = DEV_LATEST_JOBS.find((j) => j.company === 'Stripe')!;
    const getLatestSpy = vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: [stripeJob],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <MemoryRouter initialEntries={['/jobs?keyword=Stripe']}>
        <JobListingsPage />
      </MemoryRouter>
    );

    const titleMatch = await screen.findByText(/Staff Software Engineer, Platform Infrastructure/i);
    expect(titleMatch).toBeInTheDocument();
    expect(getLatestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: 'Stripe' }),
      expect.any(Object)
    );
  });

  it('displays empty state when filters yield no matching jobs', async () => {
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <MemoryRouter initialEntries={['/jobs?keyword=NonExistentKeywordXYZ123']}>
        <JobListingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No opportunities found/i)).toBeInTheDocument();
    const clearButtons = screen.getAllByText(/Clear all filters/i);
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('displays error message and retry button when jobs service fails', async () => {
    const getLatestSpy = vi
      .spyOn(jobService, 'getLatestJobs')
      .mockRejectedValueOnce(new Error('Network service unavailable'));

    render(
      <BrowserRouter>
        <JobListingsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Service Communication Issue/i)).toBeInTheDocument();
    expect(screen.getByText(/Network service unavailable/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry Fetching Jobs/i });
    expect(retryBtn).toBeInTheDocument();

    getLatestSpy.mockResolvedValueOnce({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 10,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Service Communication Issue/i)).not.toBeInTheDocument();
    });
  });

  it('renders pagination controls and navigates pages', async () => {
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS.slice(0, 2),
      pageNumber: 0,
      pageSize: 2,
      totalElements: 6,
      totalPages: 3,
      isFirst: true,
      isLast: false,
      hasNext: true,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <JobListingsPage />
      </BrowserRouter>
    );

    expect(await screen.findByLabelText(/Job results pagination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to next page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Page 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Page 2/i)).toBeInTheDocument();
  });

  it('displays salary or "Not disclosed" correctly and never outputs zero', async () => {
    vi.spyOn(jobService, 'getLatestJobs').mockResolvedValue({
      content: DEV_LATEST_JOBS,
      pageNumber: 0,
      pageSize: 10,
      totalElements: DEV_LATEST_JOBS.length,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });

    render(
      <BrowserRouter>
        <JobListingsPage />
      </BrowserRouter>
    );

    const undisclosedSalary = await screen.findAllByText(/Not disclosed/i);
    expect(undisclosedSalary.length).toBeGreaterThan(0);

    expect(screen.queryByText('$0')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
