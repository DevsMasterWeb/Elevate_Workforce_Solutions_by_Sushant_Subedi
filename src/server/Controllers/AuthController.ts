import { Request, Response, Router } from 'express';
import { AuthService } from '../Services/AuthService';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
