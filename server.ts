import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './src/server/Data/AppDbContext';

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

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.toString(),
    stack: err.stack
  });
});

// Diagnostic DB connection tester
app.get('/api/db-test', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'Not Set';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    
    const userCount = await prisma.user.count();
    res.json({
      success: true,
      message: 'Successfully connected to the database!',
      databaseUrlMasked: maskedUrl,
      userCount
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to the database.',
      error: error.message,
      stack: error.stack,
      databaseUrlMasked: process.env.DATABASE_URL 
        ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@') 
        : 'Not Set',
    });
  }
});

// Serve static elements in Production or non-dev environments
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT || '3000', 10);

if (process.env.NODE_ENV !== 'production') {
  // Local Vite Development Support - Dynamic import
  import('vite').then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Development server booted on http://localhost:${PORT}`);
      });
    });
  }).catch((err) => {
    console.error('Failed to load Vite development server:', err);
  });
} else {
  // Normal self-hosted production
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on port ${PORT}`);
  });
}

// Background startup task to backfill any missing ATS scores
async function backfillApplications() {
  try {
    const unanalyzed = await prisma.jobApplication.findMany({
      where: {
        OR: [
          { atsScore: null },
          { aiFeedback: null }
        ]
      },
      include: {
        job: true,
        jobSeekerProfile: true
      }
    });

    if (unanalyzed.length > 0) {
      console.log(`[Backfill] Found ${unanalyzed.length} applications missing ATS analysis. Processing backfill...`);
      const { AIService } = await import('./src/server/Services/AIService');
      for (const app of unanalyzed) {
        try {
          const result = await AIService.analyzeApplication(
            app.job.description,
            app.job.requirements || '',
            app.jobSeekerProfile
          );
          await prisma.jobApplication.update({
            where: { id: app.id },
            data: {
              atsScore: result.score !== null ? result.score : 0,
              aiFeedback: result.feedback || 'Analysis processed.'
            }
          });
          console.log(`[Backfill] Successfully backfilled ATS Score for app #${app.id} (${result.score}%)`);
        } catch (err) {
          console.error(`[Backfill] Failed analyzing application #${app.id}:`, err);
        }
      }
      console.log('[Backfill] All operations complete.');
    }
  } catch (error) {
    console.error('[Backfill Task failed on startup]', error);
  }
}

// Run backfill non-blockingly
backfillApplications();

export default app;

