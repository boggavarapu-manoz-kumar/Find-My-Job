export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export interface Job {
  id: number;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  companyId?: number | null;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  fresherEligible: boolean;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  hideSalary: boolean;
  description: string;
  responsibilities?: string | null;
  qualifications?: string | null;
  skills?: string | null;
  applicationUrl: string;
  applicationDeadline?: string | null;
  featured?: boolean;
  status: JobStatus;
  viewsCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  isFirst?: boolean;
  last?: boolean;
  isLast?: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: string[];
}

export interface JobFilterParams {
  keyword?: string;
  location?: string;
  category?: string;
  workMode?: WorkMode | string;
  employmentType?: EmploymentType | string;
  experienceLevel?: ExperienceLevel | string;
  fresher?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  dateFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}
