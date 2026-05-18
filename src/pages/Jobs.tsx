import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Filter, 
  LayoutDashboard, 
  MessageSquare, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  deadline: string;
  companyName: string;
  postedAt: string;
  isActive: boolean;
  category?: string;
  jobType?: string;
  isFeatured: boolean;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Design & Creative');
  const [jobTypes, setJobTypes] = useState<string[]>(['Full-time']);
  const [salaryRange, setSalaryRange] = useState([80, 250]);
  const [activeTab, setActiveTab] = useState('Relevant');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // Using 6 for a better grid look (2x3)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryFilter !== 'All') params.append('category', categoryFilter);
        if (jobTypes.length > 0) params.append('jobType', jobTypes.join(','));
        if (searchTerm) params.append('search', searchTerm);
        params.append('page', currentPage.toString());
        params.append('pageSize', pageSize.toString());
        
        const response = await api.get(`/jobs?${params.toString()}`);
        setJobs(response.data.jobs);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [categoryFilter, jobTypes, searchTerm, currentPage]);

  const handleJobTypeChange = (type: string) => {
    setJobTypes(prev => {
      const next = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      setCurrentPage(1); // Reset to first page on filter change
      return next;
    });
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Navigation</p>
            <nav className="space-y-1">
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-white hover:text-indigo-600 transition-all">
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link to="/jobs" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                <Briefcase size={20} />
                <span className="font-medium">Jobs</span>
              </Link>
              <Link to="/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-white hover:text-indigo-600 transition-all">
                <MessageSquare size={20} />
                <span className="font-medium">Messages</span>
              </Link>
            </nav>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Filter Results</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-950">Job Category</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border-none bg-white shadow-sm text-sm focus:ring-2 focus:ring-indigo-500"
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option>All</option>
                  <option>Design & Creative</option>
                  <option>Technology</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-indigo-950">Job Type</label>
                <div className="space-y-2">
                  {['Full-time', 'Contract', 'Remote'].map(type => (
                    <div key={type} className="flex items-center gap-3">
                      <Checkbox 
                        id={type} 
                        checked={jobTypes.includes(type)}
                        onCheckedChange={() => handleJobTypeChange(type)}
                        className="rounded-md border-neutral-300 data-[state=checked]:bg-indigo-600"
                      />
                      <label htmlFor={type} className="text-sm text-neutral-600 font-medium cursor-pointer">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-indigo-950">Salary Range</label>
                </div>
                <Slider 
                  defaultValue={[80, 250]} 
                  max={500} 
                  step={10} 
                  value={salaryRange}
                  onValueChange={(value) => setSalaryRange(value as number[])}
                  className="py-4"
                />
                <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                  <span>${salaryRange[0]}k</span>
                  <span>${salaryRange[1]}k+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          <Card className="mt-auto border-none bg-indigo-50 rounded-3xl p-6 overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <h4 className="text-sm font-bold text-indigo-950">Executive Portal</h4>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Access curated elite listings and direct headhunter messaging.
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs h-10">
                Upgrade Plan
              </Button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50" />
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-indigo-950">Curated Roles</h1>
              <p className="text-neutral-500 mt-2">Discover {jobs.length} executive opportunities tailored for your expertise.</p>
              <div className="mt-4 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input 
                  placeholder="Search by job title or company..." 
                  className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-neutral-100">
              {['Relevant', 'Newest', 'High Salary'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-[#F8F9FB] text-indigo-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="h-64 rounded-3xl border-none shadow-sm animate-pulse bg-white" />
              ))
            ) : jobs.length > 0 ? (
              jobs.map(job => (
                <Card key={job.id} className="group border-none bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all relative">
                  <button className="absolute top-8 right-8 text-neutral-300 hover:text-indigo-600 transition-colors">
                    <Bookmark size={20} />
                  </button>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 overflow-hidden">
                        {/* Placeholder for logo */}
                        <Briefcase size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                          {job.title}
                        </h3>
                        <p className="text-sm text-neutral-500 font-medium">{job.companyName} • {job.location}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.category && (
                        <Badge variant="secondary" className="bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1 rounded-lg border-none">
                          {job.category}
                        </Badge>
                      )}
                      {job.jobType && (
                        <Badge variant="secondary" className="bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1 rounded-lg border-none">
                          {job.jobType}
                        </Badge>
                      )}
                      {job.jobType === 'Remote' && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border-none">
                          Remote Optional
                        </Badge>
                      )}
                    </div>

                    <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-indigo-950">{job.salaryRange || `$${job.salary || '0'}k`}</span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">/ year</span>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="bg-[#F8F9FB] hover:bg-indigo-50 text-indigo-950 font-bold text-xs px-6 rounded-xl h-10"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-dashed border-neutral-200">
                <Search size={48} className="mx-auto text-neutral-300 mb-4" />
                <h3 className="text-xl font-bold text-indigo-950">No curated roles found</h3>
                <p className="text-neutral-500">Try adjusting your filters to discover more opportunities.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-8">
              <button 
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  currentPage === 1 ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-400 hover:text-indigo-600'
                }`}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                      currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  currentPage === totalPages ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-400 hover:text-indigo-600'
                }`}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white mt-20 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            © 2024 ELEVATE WORKFORCE SOLUTIONS. CURATING EXCELLENCE IN RECRUITMENT.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-indigo-600 transition-colors">Cookie Settings</Link>
            <Link to="/accessibility" className="hover:text-indigo-600 transition-colors">Accessibility</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Jobs;
