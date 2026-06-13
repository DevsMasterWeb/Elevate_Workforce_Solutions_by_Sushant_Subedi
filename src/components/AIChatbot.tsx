import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { useAuth } from '../AuthContext';
import api from '../lib/api';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const AIChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && jobs.length === 0) {
      fetchJobs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs for chatbot context:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prioritize the user's custom key over the system default
      const rawKey = process.env.USER_GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.MY_CUSTOM_KEY;
      
      // Strip whitespace AND quotes
      let apiKey = rawKey?.replace(/['"]+/g, '').trim();
      
      // Ignore the placeholder string if it's being passed as the value
      if (apiKey === 'AI Studio Free Tier') {
        apiKey = (process.env.USER_GEMINI_KEY || process.env.MY_CUSTOM_KEY)?.replace(/['"]+/g, '').trim();
      }
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '' || apiKey === 'AI Studio Free Tier') {
        throw new Error("API key is missing. Please add 'USER_GEMINI_KEY' in Settings > Secrets.");
      }

      if (!apiKey.startsWith('AIza')) {
        throw new Error("Invalid API key format.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are a helpful AI assistant for the Workforce job portal. 
        Your goal is to help candidates find jobs, answer questions about job descriptions, and provide career advice.
        
        Current User: ${user?.fullName || 'Guest'} (${user?.role || 'Unknown'})
        
        Available Jobs Context:
        ${JSON.stringify(jobs.slice(0, 10).map(j => ({ title: j.title, company: j.companyName, location: j.location, type: j.jobType })))}
        
        Guidelines:
        - Be professional, encouraging, and concise.
        - If asked about jobs, refer to the available jobs listed above.
        - If the user is an employer, help them with hiring tips or managing their dashboard.
        - If the user is a job seeker, help them with resume tips or finding the right role.
        - Do not hallucinate jobs that aren't in the context, but you can suggest general roles they might look for.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [...messages, userMessage],
        config: {
          systemInstruction,
        },
      });

      const aiMessage: Message = { role: 'model', parts: [{ text: response.text || "I'm sorry, I couldn't process that." }] };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Chatbot Error:", error);
      let errorMessage = "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
      
      if (error.message?.includes("API key")) {
        errorMessage = "I'm having trouble accessing my AI brain. Please make sure your Gemini API key is configured correctly in the settings.";
      }
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }] }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <MessageCircle size={28} />
        </Button>
      ) : (
        <Card className="w-[350px] md:w-[400px] h-[500px] flex flex-col shadow-2xl border-indigo-100 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-indigo-600 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Workforce AI Assistant</CardTitle>
                <div className="flex items-center gap-1 text-[10px] opacity-80">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online & Ready to Help
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </Button>
          </CardHeader>
          
          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50"
          >
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-950">How can I help you today?</p>
                  <p className="text-xs text-neutral-500 mt-1">Ask me about jobs, career advice, or how to use the platform.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Find remote jobs', 'Resume tips', 'How to apply?'].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-neutral-100 text-indigo-950 rounded-tl-none shadow-sm'
                }`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 size={18} className="animate-spin text-indigo-600" />
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 bg-white border-t border-neutral-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full gap-2"
            >
              <Input 
                placeholder="Type your message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-10 rounded-xl border-neutral-200 focus:ring-indigo-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || loading}
                className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                <Send size={18} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AIChatbot;
