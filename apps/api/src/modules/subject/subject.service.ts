import { prisma } from '../../core/database/prisma.client';
import { NotFoundError } from '../../shared/contracts/api-error';
import type { CreateSubjectInput, UpdateSubjectInput } from './subject.schema';

export class SubjectService {
    public async list(activeOnly = false) {
        return prisma.subject.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: [{ ordering: 'asc' }, { name: 'asc' }],
        });
    }

    public async create(input: CreateSubjectInput) {
        return prisma.subject.create({ data: input });
    }

    public async update(id: number, input: UpdateSubjectInput) {
        const subject = await prisma.subject.findUnique({ where: { id } });
        if (!subject) throw new NotFoundError('Subject not found.');
        return prisma.subject.update({ where: { id }, data: input });
    }

    public async delete(id: number) {
        const subject = await prisma.subject.findUnique({ where: { id } });
        if (!subject) throw new NotFoundError('Subject not found.');
        return prisma.subject.update({ where: { id }, data: { isActive: false } });
    }
}

export const subjectService = new SubjectService();