import { Response, Router } from 'express';
import { AnalyticsService } from '../Services/AnalyticsService';
import { authorize, AuthRequest } from '../Middleware/AuthMiddleware';

const router = Router();

router.get('/employer', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await AnalyticsService.getEmployerAnalytics(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/jobseeker', authorize(['JobSeeker']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await AnalyticsService.getJobSeekerAnalytics(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
