import { Router } from 'express';
import {
    loginAdminHandler,
    logoutAdminHandler,
    getAdminMeHandler,
    updateAdminProfileHandler,
    changeAdminPasswordHandler,
} from './admin.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import {
    adminLoginSchema,
    adminUpdateProfileSchema,
    changePasswordSchema,
} from './admin.schema';

const AdminRouter: Router = Router();

// Auth endpoints
AdminRouter.post('/login', validate(adminLoginSchema), loginAdminHandler);
AdminRouter.post('/auth/login', validate(adminLoginSchema), loginAdminHandler);
AdminRouter.post('/logout', logoutAdminHandler);
AdminRouter.post('/auth/logout', logoutAdminHandler);

// Admin profile endpoints
AdminRouter.get('/me', requireAuth, requireRole('admin'), getAdminMeHandler);
AdminRouter.put('/me', requireAuth, requireRole('admin'), validate(adminUpdateProfileSchema), updateAdminProfileHandler);
AdminRouter.put('/me/change-password', requireAuth, requireRole('admin'), validate(changePasswordSchema), changeAdminPasswordHandler);

export { AdminRouter };
