import { Router } from 'express';
import { AdminRouter } from './admin';
import { TeacherRouter } from './teacher';
import { AssistantRouter } from './assistant';
import { StudentRouter } from './student';
import { ParentRouter } from './parent';
import { SettingsRouter } from './settings';
import { DashboardRouter } from './dashboard';
import { GroupRouter } from './group';
import { PolicyRouter } from './policy';
import { SubjectRouter } from './subject';

const AppRouter: Router = Router();

// =========================================================================
// 1. Auth Namespaces (Mobile Apps & Web CPanels)
// =========================================================================
AppRouter.use('/auth/admin', AdminRouter);
AppRouter.use('/auth/teacher', TeacherRouter);
AppRouter.use('/auth/assistant', AssistantRouter);
AppRouter.use('/auth/student', StudentRouter);
AppRouter.use('/auth/parent', ParentRouter);

// =========================================================================
// 2. Admin CPanel Namespaces
// =========================================================================
AppRouter.use('/admin/teachers', TeacherRouter);
AppRouter.use('/admin/dashboard', DashboardRouter);
AppRouter.use('/admin/settings', SettingsRouter);
AppRouter.use('/admin', AdminRouter);

// =========================================================================
// 3. Core Resource Endpoints
// =========================================================================
AppRouter.use('/teachers', TeacherRouter);
AppRouter.use('/assistants', AssistantRouter);
AppRouter.use('/students', StudentRouter);
AppRouter.use('/parents', ParentRouter);
AppRouter.use('/settings', SettingsRouter);
AppRouter.use('/dashboard', DashboardRouter);
AppRouter.use('/groups', GroupRouter);
AppRouter.use('/policies', PolicyRouter);
AppRouter.use('/subjects', SubjectRouter);

export { AppRouter };