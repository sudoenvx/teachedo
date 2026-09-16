import { Router } from 'express';
import {
    getAdminDashboardStatsHandler,
    getAdminDashboardOverviewHandler,
    getTeacherDashboardStatsHandler,
    getUpcomingTeacherSessionsHandler,
} from './dashboard.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import { dashboardDateQuerySchema } from './dashboard.schema';

const DashboardRouter: Router = Router();

// Admin dashboard statistics
DashboardRouter.get('/stats', validate(dashboardDateQuerySchema), getAdminDashboardStatsHandler);
DashboardRouter.get('/overview', getAdminDashboardOverviewHandler);

// Teacher scoped dashboard statistics
DashboardRouter.get('/teacher/stats', requireAuth, requireRole('teacher', 'assistant'), getTeacherDashboardStatsHandler);
DashboardRouter.get('/teacher/upcoming-sessions', requireAuth, requireRole('teacher', 'assistant'), getUpcomingTeacherSessionsHandler);

export { DashboardRouter };
