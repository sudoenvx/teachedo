import { prisma } from '../../core/database/prisma.client';
import { AuthError, NotFoundError, DuplicationError, BadRequestError } from '../../shared/contracts/api-error';
import { verifyPassword, hashPassword } from '../../core/utils/auth/password';
import { generateToken } from '../../core/utils/auth/jwt';
import { AdminLoginInput, AdminUpdateProfileInput, ChangePasswordInput } from './admin.schema';
import { AuthTokenPayload } from '../../core/types/auth.types';

export class AdminService {
    public async login(input: AdminLoginInput) {
        const admin = await prisma.admin.findUnique({
            where: { email: input.email.toLowerCase().trim() },
        });

        if (!admin) {
            throw new AuthError('Invalid email or password.');
        }

        const isPasswordValid = await verifyPassword(input.password, admin.password);
        if (!isPasswordValid) {
            throw new AuthError('Invalid email or password.');
        }

        const tokenPayload: AuthTokenPayload = {
            id: admin.id,
            role: admin.role as 'admin' | 'super_admin',
            email: admin.email,
            permissions: ['*'],
        };

        const token = generateToken(tokenPayload);

        return {
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                createdAt: admin.createdAt,
            },
            token,
        };
    }

    public async findById(id: number) {
        const admin = await prisma.admin.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!admin) {
            throw new NotFoundError('Admin not found.');
        }

        return admin;
    }

    public async update(id: number, input: AdminUpdateProfileInput) {
        if (input.email) {
            const existing = await prisma.admin.findFirst({
                where: {
                    email: input.email.toLowerCase().trim(),
                    id: { not: id },
                },
            });
            if (existing) {
                throw new DuplicationError('An account with this email already exists.');
            }
        }

        const updated = await prisma.admin.update({
            where: { id },
            data: {
                ...(input.name ? { name: input.name.trim() } : {}),
                ...(input.email ? { email: input.email.toLowerCase().trim() } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return updated;
    }

    public async changePassword(id: number, input: ChangePasswordInput) {
        const admin = await prisma.admin.findUnique({
            where: { id },
        });

        if (!admin) {
            throw new NotFoundError('Admin not found.');
        }

        const isCurrentValid = await verifyPassword(input.currentPassword, admin.password);
        if (!isCurrentValid) {
            throw new BadRequestError('Current password is incorrect.');
        }

        const newHash = await hashPassword(input.newPassword);
        await prisma.admin.update({
            where: { id },
            data: { password: newHash },
        });

        return { message: 'Password updated successfully.' };
    }
}

export const adminService = new AdminService();
