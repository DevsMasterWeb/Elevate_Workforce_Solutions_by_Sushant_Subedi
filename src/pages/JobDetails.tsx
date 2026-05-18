import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  ArrowLeft, 
  Bookmark, 
  Users, 
  Calendar,
  Layers,
  Globe,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  deadline: string;
  companyName: string;
  postedAt: string;
  isActive: boolean;
  jobType?: string;
  category?: string;
  isFeatured: boolean;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    setApplying(true);
    try {
      await api.post('/applications', {
        jobId: job.id,
        coverLetter,
      });

      toast.success('Application submitted successfully!');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  );

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 overflow-hidden shrink-0">
                <Briefcase size={32} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-indigo-950">{job.title}</h1>
                  {job.isFeatured && (
                    <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500 font-medium">
                  <span className="flex items-center gap-2">
                    <Building2 size={18} className="text-indigo-600" /> {job.companyName}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-600" /> {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={18} className="text-indigo-600" /> {formatDistanceToNow(new Date(job.postedAt))} ago
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> 12 Applicants
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 border-neutral-200 text-neutral-400 hover:text-indigo-600 hover:border-indigo-200">
                <Bookmark size={24} />
              </Button>
              <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 border-neutral-200 text-neutral-400 hover:text-indigo-600 hover:border-indigo-200">
                <Share2 size={24} />
              </Button>
              
              {user ? (
                user.role === 'JobSeeker' ? (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-14 px-10 text-sm font-bold shadow-lg shadow-indigo-100">
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none p-8">
                      <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-bold text-indigo-950">Submit Application</DialogTitle>
                        <DialogDescription className="text-neutral-500">
                          You are applying for the <span className="font-bold text-indigo-600">{job.title}</span> position at {job.companyName}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleApply} className="grid gap-6 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="coverLetter" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Cover Letter (Optional)</Label>
                          <Textarea 
                            id="coverLetter" 
                            placeholder="Why are you a good fit for this role? Highlight your relevant experience..." 
                            className="min-h-[150px] rounded-2xl border-neutral-200 focus:ring-indigo-500 p-4"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                          />
                        </div>
                        <Button type="submit" className="h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100" disabled={applying}>
                          {applying ? 'Submitting...' : 'Send Application'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button disabled className="bg-neutral-100 text-neutral-400 rounded-2xl h-14 px-10 text-sm font-bold">
                    Employer Account
                  </Button>
                )
              ) : (
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-14 px-10 text-sm font-bold shadow-lg shadow-indigo-100" asChild>
                  <Link to="/login">Login to Apply</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Job Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none bg-white rounded-[32px] p-10 shadow-sm">
                <div className="space-y-10">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-indigo-950">Job Description</h2>
                    <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </div>
                  </section>

                  {job.requirements && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold text-indigo-950">Key Requirements</h2>
                      <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                        {job.requirements}
                      </div>
                    </section>
                  )}

                  {job.benefits && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold text-indigo-950">Benefits & Perks</h2>
                      <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                        {job.benefits}
                      </div>
                    </section>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column: Overview & Company */}
            <div className="space-y-8">
              <Card className="border-none bg-white rounded-[32px] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-950 mb-6">Job Overview</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Offered Salary</p>
                      <p className="text-sm font-bold text-indigo-950">{job.salaryRange || `$${job.salary || '0'}k / year`}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Job Category</p>
                      <p className="text-sm font-bold text-indigo-950">{job.category || 'Executive'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Employment Type</p>
                      <p className="text-sm font-bold text-indigo-950">{job.jobType || 'Full-time'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Application Deadline</p>
                      <p className="text-sm font-bold text-indigo-950">{new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-none bg-indigo-950 text-white rounded-[32px] p-8 shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{job.companyName}</h4>
                      <p className="text-indigo-300 text-xs">Premium Recruitment Partner</p>
                    </div>
                  </div>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">
                    Elevate Workforce Solutions partners with elite organizations to connect top-tier talent with transformative career opportunities.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-indigo-200">
                      <Globe size={14} />
                      <span>www.{job.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-indigo-200">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full bg-white hover:bg-indigo-50 text-indigo-950 font-bold rounded-2xl h-12 mt-4" asChild>
                    <Link to="/jobs">View Company Profile</Link>
                  </Button>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetails;
