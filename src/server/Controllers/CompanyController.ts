import { Response, Router } from 'express';
import prisma from '../Data/AppDbContext';
import { authorize, AuthRequest } from '../Middleware/AuthMiddleware';

const router = Router();

router.get('/me', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user!.id },
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/me', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, description, address, contactEmail } = req.body;
    const company = await prisma.company.update({
      where: { userId: req.user!.id },
      data: { companyName, description, address, contactEmail },
    });
    res.json(company);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
