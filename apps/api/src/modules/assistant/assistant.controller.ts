import { Request, Response } from 'express';
import { assistantService } from './assistant.service';
import { ApiResponse } from '../../core/types/api-response';
import { ApiStatusCode } from '../../shared/contracts/status-codes';
import { setAuthTokenCookie } from '../../core/utils/auth/cookie';

export const loginAssistantHandler = async (req: Request, res: Response) => {
    const result = await assistantService.login(req.body);
    setAuthTokenCookie(res, result.token);
    ApiResponse.success(res, result, 'Assistant logged in successfully.');
};

export const getPermissionsCatalogHandler = async (_req: Request, res: Response) => {
    const permissions = await assistantService.listPermissionsCatalog();
    ApiResponse.success(res, permissions);
};

export const createAssistantHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.scope || req.user?.id);
    const assistant = await assistantService.create(teacherId, req.body);
    ApiResponse.success(res, assistant, 'Assistant created successfully.', null, ApiStatusCode.CREATED);
};

export const getAssistantsHandler = async (req: Request, res: Response) => {
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const result = await assistantService.list(teacherId, req.query as never, req.originalUrl);
    ApiResponse.success(res, result.data, 'Assistants retrieved successfully.', result.meta as unknown as Record<string, unknown>);
};

export const getAssistantByIdHandler = async (req: Request, res: Response) => {
    const assistantId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const assistant = await assistantService.findById(assistantId, teacherId);
    ApiResponse.success(res, assistant);
};

export const updateAssistantHandler = async (req: Request, res: Response) => {
    const assistantId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const assistant = await assistantService.update(assistantId, teacherId, req.body);
    ApiResponse.success(res, assistant, 'Assistant updated successfully.');
};

export const deleteAssistantHandler = async (req: Request, res: Response) => {
    const assistantId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const result = await assistantService.delete(assistantId, teacherId);
    ApiResponse.success(res, result, result.message);
};

export const getAssistantMeHandler = async (req: Request, res: Response) => {
    const assistantId = Number(req.user?.id);
    const assistant = await assistantService.getAssistantMe(assistantId);
    ApiResponse.success(res, assistant);
};
