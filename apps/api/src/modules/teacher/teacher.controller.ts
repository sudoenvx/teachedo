import { Request, Response } from 'express';
import { teacherService } from './teacher.service';
import { ApiResponse } from '../../core/types/api-response';
import { ApiStatusCode } from '../../shared/contracts/status-codes';
import { setAuthTokenCookie, clearAuthTokenCookie } from '../../core/utils/auth/cookie';

export const loginTeacherHandler = async (req: Request, res: Response) => {
    const result = await teacherService.login(req.body);
    setAuthTokenCookie(res, result.token);
    ApiResponse.success(res, result, 'Teacher logged in successfully.');
};

export const logoutTeacherHandler = async (_req: Request, res: Response) => {
    clearAuthTokenCookie(res);
    ApiResponse.success(res, null, 'Logged out successfully.');
};

export const getTeacherMeHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.user?.id);
    const teacher = await teacherService.findById(teacherId);
    ApiResponse.success(res, teacher);
};

export const completeTeacherOnboardingHandler = async (req: Request, res: Response) => {
    const teacher = await teacherService.completeOnboarding(Number(req.user?.id), req.body);
    ApiResponse.success(res, teacher, 'Teacher onboarding completed.');
};

export const createTeacherHandler = async (req: Request, res: Response) => {
    const teacher = await teacherService.create(req.body, req.file);
    ApiResponse.success(res, teacher, 'Teacher registered successfully.', null, ApiStatusCode.CREATED);
};

export const getTeachersHandler = async (req: Request, res: Response) => {
    const result = await teacherService.list(req.query as never, req.originalUrl);
    ApiResponse.success(res, result.data, 'Teachers retrieved successfully.', result.meta as unknown as Record<string, unknown>);
};

export const getTeacherByIdHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.params.id);
    const teacher = await teacherService.findById(teacherId);
    ApiResponse.success(res, teacher);
};

export const updateTeacherHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.params.id);
    const teacher = await teacherService.update(teacherId, req.body, req.file);
    ApiResponse.success(res, teacher, 'Teacher updated successfully.');
};

export const deleteTeacherHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.params.id);
    const result = await teacherService.delete(teacherId);
    ApiResponse.success(res, result, 'Teacher deleted successfully.');
};

export const getLatestTeachersHandler = async (_req: Request, res: Response) => {
    const teachers = await teacherService.getLatest();
    ApiResponse.success(res, teachers);
};

export const updateTeacherStatusHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.params.id);
    const teacher = await teacherService.updateStatus(teacherId, req.body.accountStatus);
    ApiResponse.success(res, teacher, 'Teacher status updated successfully.');
};
