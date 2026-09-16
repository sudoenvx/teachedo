import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { ApiResponse } from '../../core/types/api-response';
import { setAuthTokenCookie, clearAuthTokenCookie } from '../../core/utils/auth/cookie';

export const loginAdminHandler = async (req: Request, res: Response) => {
    const result = await adminService.login(req.body);
    setAuthTokenCookie(res, result.token);
    ApiResponse.success(res, result, 'Admin logged in successfully.');
};

export const logoutAdminHandler = async (_req: Request, res: Response) => {
    clearAuthTokenCookie(res);
    ApiResponse.success(res, null, 'Logged out successfully.');
};

export const getAdminMeHandler = async (req: Request, res: Response) => {
    const adminId = Number(req.user?.id);
    const admin = await adminService.findById(adminId);
    ApiResponse.success(res, admin);
};

export const updateAdminProfileHandler = async (req: Request, res: Response) => {
    const adminId = Number(req.user?.id);
    const updated = await adminService.update(adminId, req.body);
    ApiResponse.success(res, updated, 'Profile updated successfully.');
};

export const changeAdminPasswordHandler = async (req: Request, res: Response) => {
    const adminId = Number(req.user?.id);
    const result = await adminService.changePassword(adminId, req.body);
    ApiResponse.success(res, result, result.message);
};
