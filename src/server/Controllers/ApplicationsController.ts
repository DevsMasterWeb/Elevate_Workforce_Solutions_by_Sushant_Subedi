import { Response, Router } from 'express';
import { ApplicationService } from '../Services/ApplicationService';
import { authorize, AuthRequest } from '../Middleware/AuthMiddleware';

const router = Router();

router.post('/', authorize(['JobSeeker']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await ApplicationService.apply(req.user!.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/company', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await ApplicationService.getCompanyApplications(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/my', authorize(['JobSeeker']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await ApplicationService.getMyApplications(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/status', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await ApplicationService.updateStatus(
      req.user!.id,
      parseInt(req.params.id),
      req.body.status
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
