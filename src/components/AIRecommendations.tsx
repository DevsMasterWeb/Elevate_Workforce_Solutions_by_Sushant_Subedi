import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, Briefcase, MapPin, ArrowRight, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';
import api from '../lib/api';

interface Recommendation {
  jobId: number;
  title: string;
  company: string;
  matchScore: number;
  reason: string;
}

interface AIRecommendationsProps {
  userProfile: any;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ userProfile }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!userProfile || (!userProfile.skills && !userProfile.bio)) return;
    
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch available jobs
      const jobsRes = await api.get('/jobs');
      const allJobs = jobsRes.data.jobs || [];

      if (allJobs.length === 0) {
        setRecommendations([]);
        return;
      }

      // 2. Use Gemini to rank and recommend
      const rawKey = process.env.USER_GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.MY_CUSTOM_KEY || "AIzaSyCcQE8rHvLTuTn9udfgArBJ1dbGSm7mrug";
      let apiKey = rawKey?.replace(/['"]+/g, '').trim();
      
      if (apiKey === 'AI Studio Free Tier') {
        apiKey = (process.env.USER_GEMINI_KEY || process.env.MY_CUSTOM_KEY)?.replace(/['"]+/g, '').trim();
      }
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '' || apiKey === 'AI Studio Free Tier') {
        throw new Error("Gemini API key is missing or invalid.");
      }

      if (!apiKey.startsWith('AIza')) {
        throw new Error("Invalid API key format.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        User Profile:
        Skills: ${userProfile.skills || 'Not specified'}
        Education: ${userProfile.education || 'Not specified'}
        Bio: ${userProfile.bio || 'Not specified'}
        
        Available Jobs:
        ${JSON.stringify(allJobs.map((j: any) => ({ id: j.id, title: j.title, company: j.companyName, description: j.description.substring(0, 200) })))}
        
        Task:
        Analyze the user's profile and the available jobs. Recommend the top 3 jobs that are the best fit for this user.
        Return the result as a JSON array of objects with these fields:
        - jobId (number)
        - title (string)
        - company (string)
        - matchScore (number, 0-100)
        - reason (string, a short explanation of why this is a good match)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                jobId: { type: Type.NUMBER },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                matchScore: { type: Type.NUMBER },
                reason: { type: Type.STRING },
              },
              required: ["jobId", "title", "company", "matchScore", "reason"]
            }
          }
        }
      });

      const result = JSON.parse(response.text || "[]");
      setRecommendations(result);
    } catch (err: any) {
      console.error("AI Recommendations Error:", err);
      const msg = err.message?.includes("API key") 
        ? "Gemini API key is missing or invalid. Please check your settings."
        : `AI Error: ${err.message || "Unknown error"}`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile && recommendations.length === 0 && !loading && !error) {
      fetchRecommendations();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20" />
            <div className="relative bg-indigo-50 p-4 rounded-full text-indigo-600">
              <Sparkles size={32} className="animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-950">Analyzing Your Profile</h3>
            <p className="text-sm text-neutral-500 mt-1">Our AI is finding the best job matches for your skills...</p>
          </div>
          <Loader2 className="animate-spin text-indigo-600 h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-none shadow-sm bg-white p-6 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchRecommendations}>Retry</Button>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white p-8 text-center">
        <div className="bg-neutral-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-neutral-400 mb-4">
          <Briefcase size={24} />
        </div>
        <h3 className="text-lg font-bold text-indigo-950">No Recommendations Yet</h3>
        <p className="text-sm text-neutral-500 mt-1">Complete your profile to get personalized job matches.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
            <Sparkles className="text-indigo-600 h-5 w-5" /> AI-Powered Matches
          </h2>
          <p className="text-sm text-neutral-500">Personalized recommendations based on your skills and experience.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={fetchRecommendations}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {recommendations.map((rec) => (
          <Card key={rec.jobId} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold">
                  {rec.matchScore}% Match
                </Badge>
                <Star className="text-yellow-400 h-4 w-4 fill-yellow-400" />
              </div>
              <CardTitle className="text-lg font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                {rec.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin size={14} /> {rec.company}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                <p className="text-xs text-indigo-900 leading-relaxed italic">
                  "{rec.reason}"
                </p>
              </div>
            </CardContent>
            <div className="p-4 pt-0 mt-auto">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl group" asChild>
                <Link to={`/jobs/${rec.jobId}`}>
                  View Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
