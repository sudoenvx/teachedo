import { prisma } from '../../core/database/prisma.client';
import { NotFoundError } from '../../shared/contracts/api-error';

export class PolicyService {
    public async getPublishedByKey(key: string) {
        const policy = await prisma.policy.findFirst({ where: { key, isPublished: true } });
        if (!policy) throw new NotFoundError('Policy not found.');
        return policy;
    }
}

export const policyService = new PolicyService();