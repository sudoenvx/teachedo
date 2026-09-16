import { Request, Response } from 'express';
import { ApiResponse } from '../../core/types/api-response';
import { policyService } from './policy.service';

export const getPublishedPolicyHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await policyService.getPublishedByKey(String(req.params.key)));
};