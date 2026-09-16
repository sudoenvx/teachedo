import { Request, Response } from 'express';
import { studentService } from './student.service';
import { ApiResponse } from '../../core/types/api-response';
import { ApiStatusCode } from '../../shared/contracts/status-codes';
import { setAuthTokenCookie } from '../../core/utils/auth/cookie';

export const loginStudentHandler = async (req: Request, res: Response) => {
    const result = await studentService.login(req.body);
    setAuthTokenCookie(res, result.token);
    ApiResponse.success(res, result, 'Student logged in successfully.');
};

export const createStudentHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.scope || req.user?.id);
    const student = await studentService.create(teacherId, req.body, req.file);
    ApiResponse.success(res, student, 'Student created successfully.', null, ApiStatusCode.CREATED);
};

export const getStudentsHandler = async (req: Request, res: Response) => {
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const result = await studentService.list(teacherId, req.query as never, req.originalUrl);
    ApiResponse.success(res, result.data, 'Students retrieved successfully.', result.meta as unknown as Record<string, unknown>);
};

export const getStudentStatsHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.scope || req.user?.id);
    const stats = await studentService.stats(teacherId);
    ApiResponse.success(res, stats);
};

export const getStudentByIdHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const student = await studentService.findById(studentId, teacherId);
    ApiResponse.success(res, student);
};

export const updateStudentHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const student = await studentService.update(studentId, teacherId, req.body, req.file);
    ApiResponse.success(res, student, 'Student updated successfully.');
};

export const deleteStudentHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const result = await studentService.delete(studentId, teacherId);
    ApiResponse.success(res, result, 'Student deleted successfully.');
};

export const regenerateCredentialsHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    const teacherId = Number(req.scope || req.user?.id);
    const credentials = await studentService.regenerateCredentials(studentId, teacherId);
    ApiResponse.success(res, credentials, 'New ID card credentials generated successfully.');
};

export const enrollStudentHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const result = await studentService.enroll(studentId, teacherId, req.body);
    ApiResponse.success(res, result, 'Student enrolled in group successfully.');
};

export const unenrollStudentHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    const groupId = Number(req.params.groupId);
    const teacherId = req.user?.role === 'admin' || req.user?.role === 'super_admin' ? undefined : Number(req.scope || req.user?.id);
    const result = await studentService.unenroll(studentId, groupId, teacherId);
    ApiResponse.success(res, result, result.message);
};

// Student Mobile App Handlers
export const getStudentMeHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.user?.id);
    const student = await studentService.getStudentMe(studentId);
    ApiResponse.success(res, student);
};

export const getStudentAttendanceHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.user?.id);
    const attendance = await studentService.getStudentAttendance(studentId);
    ApiResponse.success(res, attendance);
};

export const getStudentInvoicesHandler = async (req: Request, res: Response) => {
    const studentId = Number(req.user?.id);
    const data = await studentService.getStudentInvoices(studentId);
    ApiResponse.success(res, data);
};
