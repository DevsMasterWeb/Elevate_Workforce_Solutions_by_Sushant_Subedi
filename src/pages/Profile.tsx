import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { User, FileText, Upload, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    education: '',
    phone: '',
    address: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/jobseeker-profile/me');
        const data = response.data;
        setProfile(data);
        setFormData({
          bio: data.bio || '',
          skills: data.skills || '',
          education: data.education || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'JobSeeker') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/jobseeker-profile/me', formData);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('cv', cvFile);

    try {
      const response = await api.post('/jobseeker-profile/upload-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.aiParsed) {
        toast.success('CV uploaded and parsed by AI successfully!');
      } else {
        toast.success('CV uploaded successfully!');
      }

      // Refresh profile and update form data with AI parsed results
      const profileRes = await api.get('/jobseeker-profile/me');
      const data = profileRes.data;
      setProfile(data);
      setFormData({
        bio: data.bio || '',
        skills: data.skills || '',
        education: data.education || '',
        phone: data.phone || '',
        address: data.address || '',
      });
      setCvFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload CV');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (user?.role !== 'JobSeeker') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-indigo-950">Employer Profile</h1>
            <p className="text-neutral-600 mt-2">Employer profile management is coming soon.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-indigo-950">My Profile</h1>
            <p className="text-neutral-600">Manage your professional information and CV.</p>
          </div>

          <div className="grid gap-8">
            <Card className="border-none shadow-xl shadow-indigo-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-indigo-600" /> Professional Profile
                </CardTitle>
                <CardDescription>Update your professional details and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="e.g. +977 98XXXXXXXX" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        placeholder="e.g. Kathmandu, Nepal" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea 
                      id="bio"
                      placeholder="Write a short professional bio..." 
                      className="min-h-[120px]"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea 
                      id="education"
                      placeholder="e.g. MBA from Tribhuvan University (2020-2022)" 
                      className="min-h-[100px]"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="skills">Skills (Comma separated)</Label>
                    <Input 
                      id="skills"
                      placeholder="e.g. React, Node.js, Project Management" 
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="bg-indigo-600 w-full md:w-auto" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-indigo-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} className="text-indigo-600" /> Curriculum Vitae (CV)
                </CardTitle>
                <CardDescription>Upload your latest CV in PDF format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile?.cvUrl ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-600" size={24} />
                      <div>
                        <p className="font-bold text-green-900">CV Uploaded</p>
                        <a 
                          href={profile.cvUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sm text-green-700 hover:underline"
                        >
                          View Current CV
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center">
                    <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500">No CV uploaded yet.</p>
                  </div>
                )}

                <form onSubmit={handleUploadCV} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cv">Upload New CV (PDF)</Label>
                    <Input 
                      id="cv" 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="h-12 pt-2"
                    />
                  </div>
                  <Button type="submit" className="bg-indigo-600" disabled={!cvFile || saving}>
                    {saving ? 'Uploading...' : 'Upload CV'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
