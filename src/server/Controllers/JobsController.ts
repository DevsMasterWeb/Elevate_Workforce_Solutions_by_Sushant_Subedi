import { Response, Router } from 'express';
import { JobService } from '../Services/JobService';
import { authorize, AuthRequest } from '../Middleware/AuthMiddleware';

const router = Router();

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const filters = {
    category: req.query.category as string,
    jobType: req.query.jobType ? (req.query.jobType as string).split(',') : undefined,
    search: req.query.search as string,
  };
  try {
    const result = await JobService.getAllJobs(page, pageSize, filters);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/mine', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await JobService.getMyJobs(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await JobService.getJobById(parseInt(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.post('/', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await JobService.createJob(req.user!.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await JobService.updateJob(req.user!.id, parseInt(req.params.id), req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    await JobService.deleteJob(req.user!.id, parseInt(req.params.id));
    res.sendStatus(204);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
