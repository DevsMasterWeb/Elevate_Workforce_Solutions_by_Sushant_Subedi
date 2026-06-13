import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Briefcase, 
  FileText, 
  Users, 
  User,
  PlusCircle, 
  Clock, 
  BarChart3, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Search,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import AIRecommendations from '../components/AIRecommendations';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [deletingJob, setDeletingJob] = useState<number | null>(null);

  const fetchData = async (includeProfile = false) => {
    try {
      if (user.role === 'Employer') {
        const requests: any[] = [
          api.get('/jobs/mine'),
          api.get('/applications/company'),
          api.get('/analytics/employer')
        ];
        if (includeProfile) requests.push(api.get('/company/me'));
        
        const results = await Promise.all(requests);
        setJobs(results[0].data);
        setApplications(results[1].data);
        setAnalytics(results[2].data);
        if (includeProfile) setProfile(results[3].data);
      } else {
        const requests: any[] = [
          api.get('/applications/my'),
          api.get('/analytics/jobseeker')
        ];
        if (includeProfile) requests.push(api.get('/jobseeker-profile/me'));

        const results = await Promise.all(requests);
        setApplications(results[0].data);
        setAnalytics(results[1].data);
        if (includeProfile) setProfile(results[2].data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData(true); // Initial load includes profile

    // Real-time polling for analytics and applications ONLY
    const interval = setInterval(() => {
      fetchData(false); // Polling does NOT include profile
    }, 60000); // Increased to 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    setUpdatingStatus(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      toast.success(`Application marked as ${newStatus}`);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) return;
    
    setDeletingJob(jobId);
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeletingJob(null);
    }
  };

  const generateReport = () => {
    if (!analytics || !jobs || !applications) return;

    const reportData = {
      summary: {
        totalJobs: jobs.length,
        totalApplications: applications.length,
        activeJobs: analytics.activeJobs,
      },
      jobs: jobs.map(j => ({
        title: j.title,
        location: j.location,
        postedAt: new Date(j.postedAt).toLocaleDateString(),
        status: j.isActive ? 'Active' : 'Inactive'
      })),
      applications: applications.map(a => ({
        applicant: a.applicantName,
        job: a.jobTitle,
        status: a.status,
        appliedAt: new Date(a.appliedAt).toLocaleDateString()
      }))
    };

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Report Summary\n"
      + `Total Jobs,${reportData.summary.totalJobs}\n`
      + `Total Applications,${reportData.summary.totalApplications}\n`
      + `Active Jobs,${reportData.summary.activeJobs}\n\n`
      + "Job Listings\n"
      + "Title,Location,Posted At,Status\n"
      + reportData.jobs.map(j => `${j.title},${j.location},${j.postedAt},${j.status}`).join("\n")
      + "\n\nApplications\n"
      + "Applicant,Job,Status,Applied At\n"
      + reportData.applications.map(a => `${a.applicant},${a.job},${a.status},${a.appliedAt}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employer_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report generated and downloaded');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      if (user.role === 'Employer') {
        await api.put('/company/me', profile);
      } else {
        await api.put('/jobseeker-profile/me', profile);
      }
      toast.success('Settings updated successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pending</Badge>;
      case 'reviewed': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Reviewed</Badge>;
      case 'shortlisted': return <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Shortlisted</Badge>;
      case 'interviewing': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Interviewing</Badge>;
      case 'accepted': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Accepted</Badge>;
      case 'rejected': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const COLORS = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-950">Welcome, {user?.fullName || 'User'}</h1>
            <p className="text-neutral-600">
              {user?.role === 'Employer' 
                ? 'Admin Dashboard: Manage your company, jobs, and track applicants.' 
                : 'JobSeeker Dashboard: Track your applications and manage your profile.'}
            </p>
          </div>
          {user?.role === 'Employer' && (
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/post-job')}>
              <PlusCircle className="mr-2 h-5 w-5" /> Post New Job
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white border border-neutral-200 p-1 h-14 rounded-2xl overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="rounded-xl px-6 h-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BarChart3 className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl px-6 h-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" /> {user.role === 'Employer' ? 'Applicants' : 'My Applications'}
            </TabsTrigger>
            {user.role === 'JobSeeker' && (
              <TabsTrigger value="recommendations" className="rounded-xl px-6 h-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Sparkles className="mr-2 h-4 w-4" /> AI Matches
              </TabsTrigger>
            )}
            {user.role === 'Employer' && (
              <TabsTrigger value="jobs" className="rounded-xl px-6 h-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Briefcase className="mr-2 h-4 w-4" /> My Jobs
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="rounded-xl px-6 h-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {user.role === 'Employer' ? 'Total Applications' : 'Applications Sent'}
                  </CardTitle>
                  <Users className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-950">{analytics?.totalApplications || 0}</div>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {user.role === 'Employer' ? 'Active Jobs' : 'Pending Review'}
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-950">
                    {user.role === 'Employer' ? analytics?.activeJobs : analytics?.pendingApplications || 0}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Currently live on platform</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {user.role === 'Employer' ? 'Hired' : 'Accepted'}
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-950">
                    {user.role === 'Employer' 
                      ? analytics?.statusBreakdown?.find((s: any) => s.status === 'Accepted')?.count || 0
                      : analytics?.acceptedApplications || 0}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 text-green-600 font-medium">Success Rate: 15%</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {user.role === 'Employer' ? 'Rejected' : 'Rejected'}
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-950">
                    {user.role === 'Employer' 
                      ? analytics?.statusBreakdown?.find((s: any) => s.status === 'Rejected')?.count || 0
                      : analytics?.rejectedApplications || 0}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Closed applications</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-indigo-950">
                    {user.role === 'Employer' ? 'Application Trends' : 'Application Status'}
                  </CardTitle>
                  <CardDescription>Visual overview of your activity</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {user.role === 'Employer' && (
                    <div className="mb-4">
                      <Button onClick={generateReport} variant="outline" className="w-full rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                        <FileText className="mr-2 h-4 w-4" /> Generate Detailed Report (CSV)
                      </Button>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    {user.role === 'Employer' ? (
                      <LineChart data={analytics?.dailyApplications || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
                      </LineChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={analytics?.statusBreakdown || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {(analytics?.statusBreakdown || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-indigo-950">Recent Activity</CardTitle>
                  <CardDescription>Latest updates on your applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {applications.slice(0, 5).map((app: any) => (
                      <div key={app.id} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {user.role === 'Employer' ? app.applicantName?.charAt(0) : app.jobTitle?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-indigo-950 truncate">
                            {user.role === 'Employer' ? app.applicantName : app.jobTitle}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {user.role === 'Employer' ? `Applied for ${app.jobTitle}` : `Status: ${app.status}`}
                          </p>
                        </div>
                        <div className="text-xs text-neutral-400">
                          {formatDistanceToNow(new Date(app.appliedAt))} ago
                        </div>
                      </div>
                    ))}
                    {applications.length === 0 && (
                      <p className="text-center text-neutral-500 py-8">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-950">
                {user.role === 'Employer' ? 'Track Applicants' : 'Application History'}
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input placeholder="Search applications..." className="pl-10 h-10 rounded-xl" />
              </div>
            </div>
            
            <div className="grid gap-4">
              {applications.length > 0 ? applications.map(app => (
                <Card key={app.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                        {user.role === 'Employer' ? app.applicantName?.charAt(0) : app.jobTitle?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-indigo-950 text-lg">
                          {user.role === 'Employer' ? app.applicantName : app.jobTitle}
                        </h3>
                        {user.role === 'Employer' ? (
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm text-neutral-600">Applied for: <span className="font-medium text-indigo-600">{app.jobTitle}</span></p>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                              <span className="flex items-center gap-1"><Mail size={12} /> {app.applicantEmail}</span>
                              {app.phone && <span className="flex items-center gap-1"><Phone size={12} /> {app.phone}</span>}
                            </div>
                            {app.atsScore !== undefined && app.atsScore !== null && (
                              <div className="mt-2 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${app.atsScore >= 80 ? 'bg-green-100 text-green-700' : app.atsScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} border-none font-bold`}>
                                    ATS Score: {app.atsScore}%
                                  </Badge>
                                  <span className="text-[10px] text-neutral-400 flex items-center gap-1"><Sparkles size={10} /> AI Analyzed</span>
                                </div>
                                {app.aiFeedback && (
                                  <p className="text-xs text-neutral-500 italic max-w-md">"{app.aiFeedback}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500 mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(app.status)}
                      {user.role === 'Employer' && !['accepted', 'rejected'].includes(app.status.toLowerCase()) && (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg h-9 text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                            onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                            disabled={updatingStatus === app.id}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg h-9 text-green-600 border-green-100 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(app.id, 'Accepted')}
                            disabled={updatingStatus === app.id}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg h-9 text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                            disabled={updatingStatus === app.id}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {user.role === 'Employer' && (
                        <Button variant="ghost" size="sm" className="h-9 rounded-lg text-indigo-600 hover:bg-indigo-50" asChild>
                          <Link to={`/applicant/${app.jobSeekerUserId}`}>
                            <User size={18} className="mr-2" /> Profile
                          </Link>
                        </Button>
                      )}
                      {user.role === 'Employer' && app.cvUrl && (
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-indigo-600 hover:bg-indigo-50" asChild>
                          <a href={app.cvUrl} target="_blank" rel="noreferrer" title="View CV">
                            <FileText size={18} />
                          </a>
                        </Button>
                      )}
                      {user.role === 'JobSeeker' && (
                        <Button variant="outline" size="sm" className="rounded-lg" asChild>
                          <Link to={`/jobs/${app.jobId}`}>View Job</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200">
                  <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-neutral-300" size={32} />
                  </div>
                  <p className="text-neutral-500 font-medium">No applications found.</p>
                  {user.role === 'JobSeeker' && (
                    <Button className="mt-4 bg-indigo-600" asChild>
                      <Link to="/jobs">Browse Jobs</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {user.role === 'Employer' && (
            <TabsContent value="jobs" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-indigo-950">My Job Listings</h2>
                <Button className="bg-indigo-600" onClick={() => navigate('/post-job')}>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Job
                </Button>
              </div>
              <div className="grid gap-4">
                {jobs.length > 0 ? jobs.map(job => (
                  <Card key={job.id} className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Briefcase size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-indigo-950">{job.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {formatDistanceToNow(new Date(job.postedAt))} ago</span>
                            <Badge variant={job.isActive ? 'default' : 'secondary'} className={job.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg" asChild>
                          <Link to={`/jobs/${job.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg text-indigo-600 border-indigo-100 hover:bg-indigo-50" onClick={() => navigate(`/edit-job/${job.id}`)}>
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-lg text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingJob === job.id}
                        >
                          {deletingJob === job.id ? '...' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200">
                    <p className="text-neutral-500">You haven't posted any jobs yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {user.role === 'JobSeeker' && (
            <TabsContent value="recommendations">
              <AIRecommendations userProfile={profile} />
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-none shadow-sm bg-white max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-indigo-950">Account Settings</CardTitle>
                <CardDescription>Update your {user.role === 'Employer' ? 'company' : 'personal'} information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {user.role === 'Employer' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          value={profile?.companyName || ''} 
                          onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail" 
                          type="email"
                          value={profile?.contactEmail || ''} 
                          onChange={(e) => setProfile({...profile, contactEmail: e.target.value})}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address" 
                          value={profile?.address || ''} 
                          onChange={(e) => setProfile({...profile, address: e.target.value})}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea 
                          id="description" 
                          value={profile?.description || ''} 
                          onChange={(e) => setProfile({...profile, description: e.target.value})}
                          className="rounded-xl min-h-[120px]"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={profile?.phone || ''} 
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="rounded-xl h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            value={profile?.address || ''} 
                            onChange={(e) => setProfile({...profile, address: e.target.value})}
                            className="rounded-xl h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (Comma separated)</Label>
                        <Input 
                          id="skills" 
                          value={profile?.skills || ''} 
                          onChange={(e) => setProfile({...profile, skills: e.target.value})}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input 
                          id="education" 
                          value={profile?.education || ''} 
                          onChange={(e) => setProfile({...profile, education: e.target.value})}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={profile?.bio || ''} 
                          onChange={(e) => setProfile({...profile, bio: e.target.value})}
                          className="rounded-xl min-h-[120px]"
                        />
                      </div>
                    </>
                  )}
                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-indigo-600 h-11 rounded-xl" disabled={savingSettings}>
                      {savingSettings ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
