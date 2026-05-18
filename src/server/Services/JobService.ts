import prisma from '../Data/AppDbContext';
import { JobCreateDto, JobResponseDto } from '../DTOs';

export class JobService {
  static async getAllJobs(page: number, pageSize: number, filters?: any) {
    const skip = (page - 1) * pageSize;
    const where: any = { isActive: true };

    if (filters?.category && filters.category !== 'All') {
      where.category = filters.category;
    }
    if (filters?.jobType && filters.jobType.length > 0) {
      where.jobType = { in: filters.jobType };
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { companyName: { contains: filters.search } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      total,
      page,
      pageSize,
      jobs: jobs.map(j => this.mapToDto(j)),
    };
  }

  static async getJobById(id: number): Promise<JobResponseDto> {
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job || !job.isActive) throw new Error('Job not found');

    return this.mapToDto(job);
  }

  static async getMyJobs(userId: number) {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new Error('Company not found');

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map(j => this.mapToDto(j));
  }

  static async createJob(userId: number, data: JobCreateDto) {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new Error('Company not found');

    const job = await prisma.job.create({
      data: {
        ...data,
        companyId: company.id,
        deadline: new Date(data.deadline),
        companyName: data.companyName || company.companyName,
      },
      include: { company: true },
    });

    return this.mapToDto(job);
  }

  static async updateJob(userId: number, id: number, data: any) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job || job.company.userId !== userId) throw new Error('Unauthorized');

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: { company: true },
    });

    return this.mapToDto(updatedJob);
  }

  static async deleteJob(userId: number, id: number) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job || job.company.userId !== userId) throw new Error('Unauthorized');

    await prisma.job.delete({ where: { id } });
  }

  private static mapToDto(job: any): JobResponseDto {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      location: job.location,
      salary: job.salary ? Number(job.salary) : undefined,
      salaryRange: job.salaryRange,
      category: job.category,
      jobType: job.jobType,
      companyName: job.companyName || job.company.companyName,
      isFeatured: job.isFeatured,
      deadline: job.deadline.toISOString(),
      postedAt: job.createdAt.toISOString(),
      isActive: job.isActive,
    };
  }
}
