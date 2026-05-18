import prisma from '../Data/AppDbContext';
import { CompanyApplicationDto } from '../DTOs';
import { AIService } from './AIService';

export class ApplicationService {
  static async apply(userId: number, data: { jobId: number; coverLetter?: string }) {
    const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');
    if (!profile.cvPath) throw new Error('Please upload your CV first');

    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job || !job.isActive) throw new Error('Job not found or inactive');

    const existingApp = await prisma.jobApplication.findFirst({
      where: {
        jobId: data.jobId,
        jobSeekerProfileId: profile.id,
      },
    });
    if (existingApp) throw new Error('You have already applied for this job');

    // Run ATS Analysis using the new AIService
    const atsResult = await AIService.analyzeApplication(job.description, job.requirements || '', profile);

    return await prisma.jobApplication.create({
      data: {
        jobId: data.jobId,
        jobSeekerProfileId: profile.id,
        coverLetter: data.coverLetter,
        atsScore: atsResult.score,
        aiFeedback: atsResult.feedback,
      },
    });
  }

  static async getCompanyApplications(userId: number): Promise<CompanyApplicationDto[]> {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new Error('Company not found');

    const applications = await prisma.jobApplication.findMany({
      where: {
        job: { companyId: company.id },
      },
      include: {
        job: true,
        jobSeekerProfile: {
          include: { user: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      applicantName: app.jobSeekerProfile.user.fullName,
      applicantEmail: app.jobSeekerProfile.user.email,
      skills: app.jobSeekerProfile.skills || undefined,
      education: app.jobSeekerProfile.education || undefined,
      phone: app.jobSeekerProfile.phone || undefined,
      address: app.jobSeekerProfile.address || undefined,
      bio: app.jobSeekerProfile.bio || undefined,
      coverLetter: app.coverLetter || undefined,
      jobTitle: app.job.title,
      appliedAt: app.appliedAt.toISOString(),
      status: app.status,
      atsScore: app.atsScore || undefined,
      aiFeedback: app.aiFeedback || undefined,
      cvUrl: app.jobSeekerProfile.cvPath ? `/uploads/cvs/${app.jobSeekerProfile.cvPath}` : undefined,
      jobSeekerUserId: app.jobSeekerProfile.userId,
    }));
  }

  static async updateStatus(userId: number, applicationId: number, status: string) {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new Error('Company not found');

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) throw new Error('Application not found');
    if (application.job.companyId !== company.id) throw new Error('Unauthorized');

    return await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  static async getMyApplications(userId: number) {
    const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const applications = await prisma.jobApplication.findMany({
      where: { jobSeekerProfileId: profile.id },
      include: { job: true },
      orderBy: { appliedAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
    }));
  }
}
