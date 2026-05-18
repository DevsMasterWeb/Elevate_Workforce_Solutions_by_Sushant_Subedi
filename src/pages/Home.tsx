import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Briefcase, Search, Building2, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
                  </span>
                  Trusted by 500+ Companies in Nepal
                </div>
                <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-indigo-950 sm:text-7xl">
                  Elevate Your <span className="text-indigo-600">Career</span> with Precision.
                </h1>
                <p className="mt-6 text-lg leading-8 text-neutral-600">
                  Connecting Nepal's top talent with premium global and local opportunities. 
                  Our workforce solutions are designed for growth, transparency, and excellence.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link to="/jobs">
                      Browse Jobs <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-indigo-200 text-indigo-900 hover:bg-indigo-50" asChild>
                    <Link to={user?.role === 'Employer' ? "/post-job" : "/register"}>
                      {user?.role === 'Employer' ? "Post a Job" : "Hire Talent"}
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-12 grid grid-cols-3 gap-8 border-t border-neutral-100 pt-8">
                  <div>
                    <p className="text-3xl font-bold text-indigo-950">2.5k+</p>
                    <p className="text-sm text-neutral-500">Active Jobs</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-indigo-950">15k+</p>
                    <p className="text-sm text-neutral-500">Candidates</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-indigo-950">500+</p>
                    <p className="text-sm text-neutral-500">Companies</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl"></div>
                <div className="absolute -bottom-4 -right-4 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl"></div>
                <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-4 shadow-2xl shadow-indigo-200/50">
                  <img 
                    src="https://picsum.photos/seed/workplace/800/600" 
                    alt="Professional Workspace" 
                    className="rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-12 left-12 right-12 rounded-2xl bg-white/90 p-6 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-indigo-950">Verified Employers</p>
                        <p className="text-sm text-neutral-600">Every job listing is manually reviewed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-neutral-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">Why Choose Elevate?</h2>
              <p className="mt-4 text-lg text-neutral-600">We bridge the gap between talent and opportunity with technology.</p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Smart Matching",
                  description: "Our AI-driven algorithms connect you with jobs that perfectly match your skill set and career goals.",
                  icon: Search,
                  color: "bg-blue-500"
                },
                {
                  title: "Verified Companies",
                  description: "We partner with reputable IT and non-IT firms in Nepal to ensure safe and reliable employment.",
                  icon: Building2,
                  color: "bg-indigo-500"
                },
                {
                  title: "Career Growth",
                  description: "Access resources, workshops, and mentorship programs to help you level up your professional journey.",
                  icon: Users,
                  color: "bg-purple-500"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl bg-white p-8 shadow-sm border border-neutral-100"
                >
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} text-white`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-950">{feature.title}</h3>
                  <p className="mt-3 text-neutral-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Briefcase size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-indigo-950">Elevate Workforce Solutions</span>
          </div>
          <p className="text-neutral-500 text-sm">© 2026 Elevate Workforce Solutions. All rights reserved.</p>
          <p className="text-neutral-400 text-xs mt-2">Built by Code Art Web Technologies</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
