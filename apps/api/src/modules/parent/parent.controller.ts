import { Request, Response } from 'express';
import { parentService } from './parent.service';
import { ApiResponse } from '../../core/types/api-response';
import { ApiStatusCode } from '../../shared/contracts/status-codes';
import { setAuthTokenCookie } from '../../core/utils/auth/cookie';

export const loginParentHandler = async (req: Request, res: Response) => {
    const result = await parentService.login(req.body);
    setAuthTokenCookie(res, result.token);
    ApiResponse.success(res, result, 'Parent logged in successfully.');
};

export const createParentHandler = async (req: Request, res: Response) => {
    const parent = await parentService.create(req.body);
    ApiResponse.success(res, parent, 'Parent created successfully.', null, ApiStatusCode.CREATED);
};

export const getParentsHandler = async (req: Request, res: Response) => {
    const result = await parentService.list(req.query as never, req.originalUrl);
    ApiResponse.success(res, result.data, 'Parents retrieved successfully.', result.meta as unknown as Record<string, unknown>);
};

export const getParentByIdHandler = async (req: Request, res: Response) => {
    const parentId = Number(req.params.id);
    const parent = await parentService.findById(parentId);
    ApiResponse.success(res, parent);
};

export const updateParentHandler = async (req: Request, res: Response) => {
    const parentId = Number(req.params.id);
    const parent = await parentService.update(parentId, req.body);
    ApiResponse.success(res, parent, 'Parent updated successfully.');
};

export const getParentMeHandler = async (req: Request, res: Response) => {
    const parentId = Number(req.user?.id);
    const profile = await parentService.getParentMe(parentId);
    ApiResponse.success(res, profile);
};
