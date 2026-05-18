import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../Data/AppDbContext';
import { AuthResponseDto } from '../DTOs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class AuthService {
  static async register(data: any): Promise<AuthResponseDto> {
    const { fullName, email, password, role } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role,
        ...(role === 'Employer'
          ? { company: { create: { companyName: fullName } } }
          : { jobSeekerProfile: { create: {} } }),
      },
      include: {
        company: true,
        jobSeekerProfile: true,
      },
    });

    const token = this.generateToken(user);

    return {
      token,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  static async login(data: any): Promise<AuthResponseDto> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');

    const token = this.generateToken(user);

    return {
      token,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  private static generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}
