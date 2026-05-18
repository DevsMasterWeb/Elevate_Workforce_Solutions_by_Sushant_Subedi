import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { Briefcase, MapPin, DollarSign, Calendar, Building2, Zap } from 'lucide-react';

const EditJob: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    requirements: '',
    benefits: '',
    location: '',
    salary: '',
    salaryRange: '',
    category: 'Technology',
    jobType: 'Full-time',
    deadline: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        const job = response.data;
        setFormData({
          title: job.title || '',
          companyName: job.companyName || '',
          description: job.description || '',
          requirements: job.requirements || '',
          benefits: job.benefits || '',
          location: job.location || '',
          salary: job.salary ? job.salary.toString() : '',
          salaryRange: job.salaryRange || '',
          category: job.category || 'Technology',
          jobType: job.jobType || 'Full-time',
          deadline: job.deadline ? job.deadline.split('T')[0] : '',
        });
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error('Failed to load job details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Employer' && id) {
      fetchJob();
    } else if (user && user.role !== 'Employer') {
      navigate('/dashboard');
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await api.put(`/jobs/${id}`, {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      });
      toast.success('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-indigo-950">Edit Job Listing</h1>
            <p className="text-neutral-500 mt-2">Update the details for your job posting.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-none bg-white rounded-[32px] p-10 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      id="title" 
                      placeholder="e.g. Senior Creative Director" 
                      className="pl-12 h-14 rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="companyName" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      id="companyName" 
                      placeholder="e.g. Stellar Systems Ltd." 
                      className="pl-12 h-14 rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Category</Label>
                  <select 
                    id="category"
                    className="w-full h-14 px-4 rounded-2xl border-none bg-[#F8F9FB] text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option>Technology</option>
                    <option>Design & Creative</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                    <option>Finance</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="jobType" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Job Type</Label>
                  <select 
                    id="jobType"
                    className="w-full h-14 px-4 rounded-2xl border-none bg-[#F8F9FB] text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.jobType}
                    onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                    required
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Remote</option>
                    <option>Part-time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      id="location" 
                      placeholder="e.g. San Francisco, CA" 
                      className="pl-12 h-14 rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Application Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      id="deadline" 
                      type="date"
                      className="pl-12 h-14 rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid gap-2">
                  <Label htmlFor="salaryRange" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Salary Range (Display)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      id="salaryRange" 
                      placeholder="e.g. $180k - $240k" 
                      className="pl-12 h-14 rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salary" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Base Salary (Numeric)</Label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      id="salary" 
                      type="number"
                      placeholder="e.g. 180000" 
                      className="pl-12 h-14 rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Job Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the role, primary responsibilities, and impact..." 
                  className="min-h-[150px] rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500 p-4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="requirements" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Key Requirements</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="List essential skills, experience, and qualifications..." 
                  className="min-h-[150px] rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500 p-4"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="benefits" className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Benefits & Perks</Label>
                <Textarea 
                  id="benefits" 
                  placeholder="What makes this role special? Equity, health, travel, etc..." 
                  className="min-h-[150px] rounded-2xl border-neutral-100 bg-[#F8F9FB] focus:ring-indigo-500 p-4"
                  value={formData.benefits}
                  onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" className="rounded-2xl h-14 px-8 text-neutral-500 font-bold" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-14 px-12 text-sm font-bold shadow-lg shadow-indigo-100" disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditJob;
