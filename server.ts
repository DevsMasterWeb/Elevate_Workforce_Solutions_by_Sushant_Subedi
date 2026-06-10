import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Import Controllers
import AuthController from './src/server/Controllers/AuthController';
import JobsController from './src/server/Controllers/JobsController';
import ApplicationsController from './src/server/Controllers/ApplicationsController';
import JobSeekerProfileController from './src/server/Controllers/JobSeekerProfileController';
import AnalyticsController from './src/server/Controllers/AnalyticsController';
import CompanyController from './src/server/Controllers/CompanyController';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// API Routes
app.use('/api/auth', AuthController);
app.use('/api/jobs', JobsController);
app.use('/api/applications', ApplicationsController);
app.use('/api/jobseeker-profile', JobSeekerProfileController);
app.use('/api/analytics', AnalyticsController);
app.use('/api/company', CompanyController);

// Serve static elements in Production or non-dev environments
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Only listen locally or on long-running processes (not under serverless Vercel runtime)
if (process.env.VERCEL !== '1') {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  if (process.env.NODE_ENV !== 'production') {
    // Local Vite Development Support
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Development server booted on http://localhost:${PORT}`);
      });
    });
  } else {
    // Normal self-hosted production
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Production server running on port ${PORT}`);
    });
  }
}

export default app;

