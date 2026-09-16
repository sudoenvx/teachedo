import { prisma } from '../../core/database/prisma.client';
import { AuthError, NotFoundError, DuplicationError } from '../../shared/contracts/api-error';
import { verifyPassword, hashPassword } from '../../core/utils/auth/password';
import { generateToken } from '../../core/utils/auth/jwt';
import {
    AssistantLoginInput,
    CreateAssistantInput,
    UpdateAssistantInput,
    QueryAssistantsInput,
} from './assistant.schema';
import { AuthTokenPayload } from '../../core/types/auth.types';
import { ApiResponse, PaginationMeta } from '../../core/types/api-response';

export class AssistantService {
    public async login(input: AssistantLoginInput) {
        const username = input.username.toLowerCase().trim();
        const assistant = await prisma.teacherAssistant.findUnique({
            where: { username },
            include: {
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        accountStatus: true,
                        subjectSpecialization: true,
                    },
                },
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!assistant) {
            throw new AuthError('Invalid username or password.');
        }

        const isPasswordValid = await verifyPassword(input.password, assistant.password);
        if (!isPasswordValid) {
            throw new AuthError('Invalid username or password.');
        }

        if (assistant.teacher.accountStatus === 'inactive' || assistant.teacher.accountStatus === 'suspended_payment') {
            throw new AuthError('Teacher account is currently inactive. Assistant access suspended.');
        }

        const permissionKeys = assistant.permissions.map((ap) => ap.permission.key);

        const tokenPayload: AuthTokenPayload = {
            id: assistant.id,
            role: 'assistant',
            email: assistant.email || undefined,
            scopeTeacherId: assistant.teacherId,
            permissions: permissionKeys,
        };

        const token = generateToken(tokenPayload);

        return {
            assistant: {
                id: assistant.id,
                fullName: assistant.fullName,
                username: assistant.username,
                email: assistant.email,
                phoneNumber: assistant.phoneNumber,
                teacherId: assistant.teacherId,
                teacher: assistant.teacher,
                permissions: permissionKeys,
                createdAt: assistant.createdAt,
            },
            token,
        };
    }

    public async listPermissionsCatalog() {
        return prisma.permission.findMany({
            orderBy: { key: 'asc' },
        });
    }

    public async create(teacherId: number, input: CreateAssistantInput) {
        const username = input.username?.toLowerCase().trim() || `assistant_${Date.now()}`;
        const existing = await prisma.teacherAssistant.findUnique({
            where: { username },
        });

        if (existing) {
            throw new DuplicationError('An assistant with this username already exists.');
        }

        const email = input.email?.toLowerCase().trim() || null;
        if (email && await prisma.teacherAssistant.findUnique({ where: { email } })) {
            throw new DuplicationError('An assistant with this email already exists.');
        }

        const hashedPassword = await hashPassword(input.password);

        // Fetch matching permissions by key
        const permissions = await prisma.permission.findMany({
            where: { key: { in: input.permissionKeys } },
        });
        if (permissions.length !== new Set(input.permissionKeys).size) {
            throw new AuthError('One or more selected permissions are invalid.');
        }

        const assistant = await prisma.teacherAssistant.create({
            data: {
                teacherId,
                fullName: input.fullName.trim(),
                username,
                email,
                password: hashedPassword,
                phoneNumber: input.phoneNumber ? input.phoneNumber.trim() : null,
                permissions: {
                    create: permissions.map((p) => ({
                        permissionId: p.id,
                    })),
                },
            },
            include: {
                permissions: {
                    include: { permission: true },
                },
            },
        });

        return {
            id: assistant.id,
            teacherId: assistant.teacherId,
            fullName: assistant.fullName,
            username: assistant.username,
            email: assistant.email,
            phoneNumber: assistant.phoneNumber,
            permissions: assistant.permissions.map((p) => p.permission.key),
            createdAt: assistant.createdAt,
        };
    }

    public async list(teacherId: number | undefined, query: QueryAssistantsInput, requestUrl: string): Promise<{ data: unknown[]; meta: PaginationMeta }> {
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.max(1, Math.min(100, Number(query.perPage) || 10));
        const skip = (page - 1) * perPage;

        const where: Record<string, unknown> = {
            ...(teacherId ? { teacherId } : {}),
        };

        if (query.search && query.search.trim() !== '') {
            const term = query.search.trim();
            where.OR = [
                { fullName: { contains: term } },
                { username: { contains: term } },
                { email: { contains: term } },
                { phoneNumber: { contains: term } },
            ];
        }

        const [total, assistants] = await Promise.all([
            prisma.teacherAssistant.count({ where }),
            prisma.teacherAssistant.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    permissions: {
                        include: { permission: true },
                    },
                },
            }),
        ]);

        const formatted = assistants.map((a) => ({
            id: a.id,
            fullName: a.fullName,
            username: a.username,
            email: a.email,
            phoneNumber: a.phoneNumber,
            permissions: a.permissions.map((p) => p.permission.key),
            createdAt: a.createdAt,
        }));

        const lastPage = Math.ceil(total / perPage) || 1;
        const pagination = {
            currentPage: page,
            perPage,
            total,
            lastPage,
            from: total === 0 ? null : skip + 1,
            to: total === 0 ? null : Math.min(skip + perPage, total),
            path: requestUrl.split('?')[0] || '/api/assistants',
        };

        const meta = ApiResponse.paginationMeta(pagination, requestUrl);

        return { data: formatted, meta };
    }

    public async findById(id: number, teacherId?: number) {
        const where: Record<string, unknown> = { id };
        if (teacherId) where.teacherId = teacherId;

        const assistant = await prisma.teacherAssistant.findFirst({
            where,
            include: {
                permissions: {
                    include: { permission: true },
                },
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        subjectSpecialization: true,
                    },
                },
            },
        });

        if (!assistant) {
            throw new NotFoundError('Assistant not found.');
        }

        return {
            id: assistant.id,
            teacherId: assistant.teacherId,
            fullName: assistant.fullName,
            username: assistant.username,
            email: assistant.email,
            phoneNumber: assistant.phoneNumber,
            teacher: assistant.teacher,
            permissions: assistant.permissions.map((p) => ({
                id: p.permission.id,
                key: p.permission.key,
                label: p.permission.label,
            })),
            createdAt: assistant.createdAt,
        };
    }

    public async update(id: number, teacherId: number | undefined, input: UpdateAssistantInput) {
        const where: Record<string, unknown> = { id };
        if (teacherId) where.teacherId = teacherId;

        const existing = await prisma.teacherAssistant.findFirst({ where });
        if (!existing) {
            throw new NotFoundError('Assistant not found.');
        }

        if (input.username && input.username.toLowerCase().trim() !== existing.username.toLowerCase()) {
            const inUse = await prisma.teacherAssistant.findUnique({
                where: { username: input.username.toLowerCase().trim() },
            });
            if (inUse) {
                throw new DuplicationError('Username is already taken by another assistant.');
            }
        }

        if (input.email && input.email.toLowerCase().trim() !== existing.email?.toLowerCase()) {
            const inUse = await prisma.teacherAssistant.findUnique({ where: { email: input.email.toLowerCase().trim() } });
            if (inUse) throw new DuplicationError('Email is already taken by another assistant.');
        }

        const data: Record<string, unknown> = {};
        if (input.fullName !== undefined) data.fullName = input.fullName.trim();
        if (input.username !== undefined) data.username = input.username.toLowerCase().trim();
        if (input.email !== undefined) data.email = input.email ? input.email.toLowerCase().trim() : null;
        if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber ? input.phoneNumber.trim() : null;
        if (input.password) {
            data.password = await hashPassword(input.password);
        }

        // If permission keys are provided, re-sync junction table
        if (input.permissionKeys !== undefined) {
            const permissions = await prisma.permission.findMany({
                where: { key: { in: input.permissionKeys } },
            });
            if (permissions.length !== new Set(input.permissionKeys).size) {
                throw new AuthError('One or more selected permissions are invalid.');
            }

            await prisma.assistantPermission.deleteMany({
                where: { assistantId: id },
            });

            if (permissions.length > 0) {
                await prisma.assistantPermission.createMany({
                    data: permissions.map((p) => ({
                        assistantId: id,
                        permissionId: p.id,
                    })),
                });
            }
        }

        const updated = await prisma.teacherAssistant.update({
            where: { id },
            data,
            include: {
                permissions: {
                    include: { permission: true },
                },
            },
        });

        return {
            id: updated.id,
            teacherId: updated.teacherId,
            fullName: updated.fullName,
            username: updated.username,
            email: updated.email,
            phoneNumber: updated.phoneNumber,
            permissions: updated.permissions.map((p) => p.permission.key),
            createdAt: updated.createdAt,
        };
    }

    public async delete(id: number, teacherId?: number) {
        const where: Record<string, unknown> = { id };
        if (teacherId) where.teacherId = teacherId;

        const existing = await prisma.teacherAssistant.findFirst({ where });
        if (!existing) {
            throw new NotFoundError('Assistant not found.');
        }

        await prisma.assistantPermission.deleteMany({
            where: { assistantId: id },
        });

        await prisma.teacherAssistant.delete({
            where: { id },
        });

        return { message: 'Assistant deleted successfully.' };
    }

    public async getAssistantMe(assistantId: number) {
        return this.findById(assistantId);
    }
}

export const assistantService = new AssistantService();
