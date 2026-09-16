import { prisma } from '../../core/database/prisma.client';
import { AuthError, NotFoundError, DuplicationError } from '../../shared/contracts/api-error';
import { verifyPassword, hashPassword } from '../../core/utils/auth/password';
import { generateToken } from '../../core/utils/auth/jwt';
import {
    ParentLoginInput,
    CreateParentInput,
    UpdateParentInput,
    QueryParentsInput,
} from './parent.schema';
import { AuthTokenPayload } from '../../core/types/auth.types';
import { ApiResponse, PaginationMeta } from '../../core/types/api-response';

export class ParentService {
    public async login(input: ParentLoginInput) {
        const phone = input.phoneNumber.trim();
        const parent = await prisma.parent.findUnique({
            where: { phoneNumber: phone },
        });

        if (!parent) {
            throw new AuthError('Invalid phone number or password.');
        }

        const isPasswordValid = await verifyPassword(input.password, parent.password);
        if (!isPasswordValid) {
            throw new AuthError('Invalid phone number or password.');
        }

        const tokenPayload: AuthTokenPayload = {
            id: parent.id,
            role: 'parent',
            phoneNumber: parent.phoneNumber,
        };

        const token = generateToken(tokenPayload);

        return {
            parent: {
                id: parent.id,
                fullName: parent.fullName,
                phoneNumber: parent.phoneNumber,
                whatsappNumber: parent.whatsappNumber,
                createdAt: parent.createdAt,
            },
            token,
        };
    }

    public async create(input: CreateParentInput) {
        const phone = input.phoneNumber.trim();
        const existing = await prisma.parent.findUnique({
            where: { phoneNumber: phone },
        });

        if (existing) {
            throw new DuplicationError('A parent with this phone number already exists.');
        }

        if (input.whatsappNumber) {
            const existingWa = await prisma.parent.findUnique({
                where: { whatsappNumber: input.whatsappNumber.trim() },
            });
            if (existingWa) {
                throw new DuplicationError('A parent with this WhatsApp number already exists.');
            }
        }

        const hashedPassword = await hashPassword(input.password);

        const parent = await prisma.parent.create({
            data: {
                fullName: input.fullName.trim(),
                phoneNumber: phone,
                whatsappNumber: input.whatsappNumber ? input.whatsappNumber.trim() : null,
                password: hashedPassword,
            },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                whatsappNumber: true,
                createdAt: true,
            },
        });

        return parent;
    }

    public async list(query: QueryParentsInput, requestUrl: string): Promise<{ data: unknown[]; meta: PaginationMeta }> {
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.max(1, Math.min(100, Number(query.perPage) || 10));
        const skip = (page - 1) * perPage;

        const where: Record<string, unknown> = {};

        if (query.search && query.search.trim() !== '') {
            const term = query.search.trim();
            where.OR = [
                { fullName: { contains: term } },
                { phoneNumber: { contains: term } },
                { whatsappNumber: { contains: term } },
            ];
        }

        const [total, parents] = await Promise.all([
            prisma.parent.count({ where }),
            prisma.parent.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    phoneNumber: true,
                    whatsappNumber: true,
                    createdAt: true,
                    _count: {
                        select: {
                            students: { where: { deletedAt: null } },
                        },
                    },
                },
            }),
        ]);

        const formatted = parents.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            phoneNumber: p.phoneNumber,
            whatsappNumber: p.whatsappNumber,
            studentsCount: p._count.students,
            createdAt: p.createdAt,
        }));

        const lastPage = Math.ceil(total / perPage) || 1;
        const pagination = {
            currentPage: page,
            perPage,
            total,
            lastPage,
            from: total === 0 ? null : skip + 1,
            to: total === 0 ? null : Math.min(skip + perPage, total),
            path: requestUrl.split('?')[0] || '/api/parents',
        };

        const meta = ApiResponse.paginationMeta(pagination, requestUrl);

        return { data: formatted, meta };
    }

    public async findById(id: number) {
        const parent = await prisma.parent.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                whatsappNumber: true,
                createdAt: true,
                students: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        fullName: true,
                        studentCode: true,
                        phoneNumber: true,
                        status: true,
                        teacher: {
                            select: {
                                id: true,
                                fullName: true,
                                subjectSpecialization: true,
                            },
                        },
                        studyStage: {
                            select: {
                                id: true,
                                stageName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!parent) {
            throw new NotFoundError('Parent not found.');
        }

        return parent;
    }

    public async update(id: number, input: UpdateParentInput) {
        const existing = await prisma.parent.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Parent not found.');
        }

        if (input.phoneNumber && input.phoneNumber.trim() !== existing.phoneNumber) {
            const inUse = await prisma.parent.findUnique({
                where: { phoneNumber: input.phoneNumber.trim() },
            });
            if (inUse) {
                throw new DuplicationError('Phone number already in use.');
            }
        }

        const data: Record<string, unknown> = {};
        if (input.fullName !== undefined) data.fullName = input.fullName.trim();
        if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber.trim();
        if (input.whatsappNumber !== undefined) data.whatsappNumber = input.whatsappNumber ? input.whatsappNumber.trim() : null;
        if (input.password) {
            data.password = await hashPassword(input.password);
        }

        const updated = await prisma.parent.update({
            where: { id },
            data,
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                whatsappNumber: true,
                createdAt: true,
            },
        });

        return updated;
    }

    public async getParentMe(parentId: number) {
        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                students: {
                    where: { deletedAt: null },
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                fullName: true,
                                subjectSpecialization: true,
                                phoneNumber: true,
                            },
                        },
                        studyStage: {
                            select: {
                                id: true,
                                stageName: true,
                            },
                        },
                        groupEnrollments: {
                            where: { status: 'active' },
                            include: {
                                group: true,
                            },
                        },
                        invoices: {
                            where: { status: 'unpaid' },
                            select: {
                                id: true,
                                billingMonth: true,
                                amountDue: true,
                                amountPaid: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        if (!parent) {
            throw new NotFoundError('Parent not found.');
        }

        return parent;
    }
}

export const parentService = new ParentService();
