import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  GraduationCap, 
  Wrench, 
  ChevronLeft,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const ApplicantProfile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/jobseeker-profile/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching applicant profile:", error);
        toast.error('Failed to load applicant profile');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, navigate]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-8 text-neutral-500 hover:text-indigo-600"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
          </Button>

          <div className="grid gap-8">
            {/* Header Card */}
            <Card className="border-none bg-white rounded-[32px] p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-4xl">
                  {profile.user?.fullName?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-indigo-950">{profile.user?.fullName || 'Unknown User'}</h1>
                  <div className="flex flex-wrap gap-4 mt-3 text-neutral-500">
                    <span className="flex items-center gap-1.5"><Mail size={16} /> {profile.user?.email || 'N/A'}</span>
                    {profile.phone && <span className="flex items-center gap-1.5"><Phone size={16} /> {profile.phone}</span>}
                    {profile.address && <span className="flex items-center gap-1.5"><MapPin size={16} /> {profile.address}</span>}
                  </div>
                </div>
                {profile.cvUrl && (
                  <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 px-6" asChild>
                    <a href={profile.cvUrl} target="_blank" rel="noreferrer">
                      <Download size={18} className="mr-2" /> Download CV
                    </a>
                  </Button>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none bg-white rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-indigo-950 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-600" /> Professional Bio
                  </h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {profile.bio || "No bio provided."}
                  </p>
                </Card>

                <Card className="border-none bg-white rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-indigo-950 mb-6 flex items-center gap-2">
                    <GraduationCap size={20} className="text-indigo-600" /> Education
                  </h2>
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {profile.education || "No education details provided."}
                  </p>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <Card className="border-none bg-white rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-indigo-950 mb-6 flex items-center gap-2">
                    <Wrench size={20} className="text-indigo-600" /> Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills ? profile.skills.split(',').map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1 rounded-lg">
                        {skill.trim()}
                      </Badge>
                    )) : (
                      <p className="text-neutral-500 text-sm">No skills listed.</p>
                    )}
                  </div>
                </Card>

                <Card className="border-none bg-indigo-950 text-white rounded-[32px] p-8 shadow-sm">
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-white text-indigo-950 hover:bg-neutral-100 rounded-xl" asChild>
                      <a href={`mailto:${profile.user?.email}`}>Contact via Email</a>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicantProfile;
