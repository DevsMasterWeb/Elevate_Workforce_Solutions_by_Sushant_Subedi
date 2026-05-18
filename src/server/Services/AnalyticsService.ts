import prisma from '../Data/AppDbContext';

export class AnalyticsService {
  static async getEmployerAnalytics(userId: number) {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new Error('Company not found');

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.isActive).length;
    const totalApplications = jobs.reduce((acc, job) => acc + job._count.applications, 0);

    // Get applications over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applications = await prisma.jobApplication.findMany({
      where: {
        job: { companyId: company.id },
        appliedAt: { gte: sevenDaysAgo }
      },
      select: { appliedAt: true }
    });

    const dailyApplications = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const count = applications.filter(app => app.appliedAt.toISOString().split('T')[0] === dateString).length;
      return { date: dateString, count };
    }).reverse();

    // Application status breakdown
    const statusBreakdown = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: {
        job: { companyId: company.id }
      },
      _count: {
        status: true
      }
    });

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      dailyApplications,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status }))
    };
  }

  static async getJobSeekerAnalytics(userId: number) {
    const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const applications = await prisma.jobApplication.findMany({
      where: { jobSeekerProfileId: profile.id },
      include: { job: true }
    });

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'Pending').length;
    const acceptedApplications = applications.filter(a => a.status === 'Accepted').length;
    const rejectedApplications = applications.filter(a => a.status === 'Rejected').length;

    // Status breakdown for chart
    const statusBreakdown = [
      { status: 'Pending', count: pendingApplications },
      { status: 'Accepted', count: acceptedApplications },
      { status: 'Rejected', count: rejectedApplications },
      { status: 'Other', count: totalApplications - (pendingApplications + acceptedApplications + rejectedApplications) }
    ];

    return {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      statusBreakdown
    };
  }
}
