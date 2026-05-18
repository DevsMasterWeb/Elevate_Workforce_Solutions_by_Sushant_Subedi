export interface AuthResponseDto {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

export interface JobCreateDto {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  category?: string;
  jobType?: string;
  companyName?: string;
  isFeatured?: boolean;
  deadline: string;
}

export interface JobResponseDto {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  category?: string;
  jobType?: string;
  companyName: string;
  isFeatured: boolean;
  deadline: string;
  postedAt: string;
  isActive: boolean;
}

export interface JobSeekerProfileDto {
  skills?: string;
  education?: string;
  phone?: string;
  address?: string;
  bio?: string;
  cvUrl?: string;
}

export interface CompanyApplicationDto {
  id: number;
  applicantName: string;
  applicantEmail: string;
  skills?: string;
  education?: string;
  phone?: string;
  address?: string;
  bio?: string;
  coverLetter?: string;
  jobTitle: string;
  appliedAt: string;
  status: string;
  atsScore?: number;
  aiFeedback?: string;
  cvUrl?: string;
  jobSeekerUserId: number;
}
