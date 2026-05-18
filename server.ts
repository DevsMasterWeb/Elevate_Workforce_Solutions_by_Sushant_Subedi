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

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
