/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Toaster } from './components/ui/sonner';
import AIChatbot from './components/AIChatbot';

// Pages (to be created)
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Jobs = React.lazy(() => import('./pages/Jobs'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const JobDetails = React.lazy(() => import('./pages/JobDetails'));
const PostJob = React.lazy(() => import('./pages/PostJob'));
const EditJob = React.lazy(() => import('./pages/EditJob'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ApplicantProfile = React.lazy(() => import('./pages/ApplicantProfile'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const EmployerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return user?.role === 'Employer' ? <>{children}</> : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              <Route path="/post-job" element={
                <EmployerRoute>
                  <PostJob />
                </EmployerRoute>
              } />
              
              <Route path="/edit-job/:id" element={
                <EmployerRoute>
                  <EditJob />
                </EmployerRoute>
              } />

              <Route path="/applicant/:userId" element={
                <EmployerRoute>
                  <ApplicantProfile />
                </EmployerRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </React.Suspense>
          <Toaster />
          <AIChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

