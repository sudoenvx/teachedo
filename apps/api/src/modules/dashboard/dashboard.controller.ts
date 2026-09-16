import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { ApiResponse } from '../../core/types/api-response';

export const getAdminDashboardStatsHandler = async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    const stats = await dashboardService.getAdminStats(month);
    ApiResponse.success(res, stats);
};

export const getAdminDashboardOverviewHandler = async (_req: Request, res: Response) => {
    const overview = await dashboardService.getAdminOverview();
    ApiResponse.success(res, overview);
};

export const getTeacherDashboardStatsHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.user?.id || req.scope);
    const stats = await dashboardService.getTeacherStats(teacherId);
    ApiResponse.success(res, stats);
};

export const getUpcomingTeacherSessionsHandler = async (req: Request, res: Response) => {
    const teacherId = Number(req.user?.id || req.scope);
    const sessions = await dashboardService.getUpcomingTeacherSessions(teacherId);
    ApiResponse.success(res, sessions);
};
