export type UserRole = 'JobSeeker' | 'Employer' | 'Admin';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface JobListing {
  id: number;
  title: string;
  description: string;
  location: string;
  salary?: number;
  deadline: string;
  companyName: string;
  postedAt: string;
  isActive: boolean;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateName: string;
  cvUrl?: string;
  coverLetter?: string;
  status: string;
  appliedAt: string;
}
