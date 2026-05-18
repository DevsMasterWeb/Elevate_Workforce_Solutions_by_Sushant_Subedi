import { Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../Data/AppDbContext';
import { authorize, AuthRequest } from '../Middleware/AuthMiddleware';
import { AIService } from '../Services/AIService';

const router = Router();

const storage = multer.diskStorage({
  destination: 'public/uploads/cvs/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.get('/me', authorize(['JobSeeker']), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json({
      ...profile,
      cvUrl: profile.cvPath ? `/uploads/cvs/${profile.cvPath}` : undefined,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:userId', authorize(['Employer']), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: parseInt(req.params.userId) },
      include: { user: { select: { fullName: true, email: true } } }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json({
      ...profile,
      cvUrl: profile.cvPath ? `/uploads/cvs/${profile.cvPath}` : undefined,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/me', authorize(['JobSeeker']), upload.single('cv'), async (req: AuthRequest, res: Response) => {
  try {
    const { phone, address, education, skills, bio } = req.body;
    const cvPath = req.file?.filename;

    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        phone,
        address,
        education,
        skills,
        bio,
        ...(cvPath ? { cvPath } : {}),
      },
      create: {
        userId: req.user!.id,
        phone,
        address,
        education,
        skills,
        bio,
        cvPath,
      },
    });

    res.json({
      ...profile,
      cvUrl: profile.cvPath ? `/uploads/cvs/${profile.cvPath}` : undefined,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/me', authorize(['JobSeeker']), async (req: AuthRequest, res: Response) => {
  try {
    const { phone, address, education, skills, bio } = req.body;
    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: req.user!.id },
      update: { phone, address, education, skills, bio },
      create: { userId: req.user!.id, phone, address, education, skills, bio },
    });
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/upload-cv', authorize(['JobSeeker']), upload.single('cv'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const cvPath = req.file.filename;
    const fullPath = path.join(process.cwd(), 'public/uploads/cvs/', cvPath);

    // AI Parsing
    const aiData = await AIService.parseResume(fullPath);

    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: req.user!.id },
      update: { 
        cvPath,
        ...(aiData ? {
          skills: aiData.skills,
          education: aiData.education,
          bio: aiData.bio,
          phone: aiData.phone,
          address: aiData.address
        } : {})
      },
      create: { 
        userId: req.user!.id, 
        cvPath,
        ...(aiData ? {
          skills: aiData.skills,
          education: aiData.education,
          bio: aiData.bio,
          phone: aiData.phone,
          address: aiData.address
        } : {})
      },
    });

    res.json({
      ...profile,
      cvUrl: `/uploads/cvs/${profile.cvPath}`,
      aiParsed: !!aiData
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
