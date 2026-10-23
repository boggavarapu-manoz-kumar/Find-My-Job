import type { User } from './auth.types';

export interface SavedJob {
  id: number;
  jobId: number;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  fresherEligible: boolean;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: string;
  hideSalary: boolean;
  savedAt: string;
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobSlug: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationRequest {
  jobId: number;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface CandidateRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CandidateRegisterResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}
