import { Router } from 'express';
import { requireAuth, requirePermission, requireRole } from '../../core/middlewares/require-auth';
import { validate } from '../../core/middlewares/validate.mw';
import {
    createClassHandler,
    createClassSessionHandler,
    deleteClassHandler,
    getClassByIdHandler,
    getClassSessionsHandler,
    getLiveClassSessionHandler,
    getClassesHandler,
    recordClassSessionAttendanceHandler,
    rescheduleClassSessionHandler,
    startClassSessionHandler,
    updateClassHandler,
} from './group.controller';
import {
    classIdParamSchema,
    classSessionParamsSchema,
    classSessionsQuerySchema,
    createClassSchema,
    createClassSessionSchema,
    recordSessionAttendanceSchema,
    rescheduleClassSessionSchema,
    updateClassSchema,
} from './group.schema';

const ClassRouter: Router = Router();
const teacherRoles = ['teacher', 'assistant'] as const;

ClassRouter.use(requireAuth, requireRole(...teacherRoles));
ClassRouter.get('/', requirePermission('groups_view'), getClassesHandler);
ClassRouter.get('/sessions', requirePermission('groups_view'), validate(classSessionsQuerySchema), getClassSessionsHandler);
ClassRouter.post('/', requirePermission('groups_manage'), validate(createClassSchema), createClassHandler);
ClassRouter.post('/:id/sessions', requirePermission('groups_manage'), validate(createClassSessionSchema), createClassSessionHandler);
ClassRouter.patch('/:id/sessions/:sessionId', requirePermission('groups_manage'), validate(rescheduleClassSessionSchema), rescheduleClassSessionHandler);
ClassRouter.post('/:id/sessions/:sessionId/start', requirePermission('groups_manage'), validate(classSessionParamsSchema), startClassSessionHandler);
ClassRouter.get('/:id/sessions/:sessionId/live', requirePermission('groups_view'), validate(classSessionParamsSchema), getLiveClassSessionHandler);
ClassRouter.post('/:id/sessions/:sessionId/attendance', requirePermission('attendance_write'), validate(recordSessionAttendanceSchema), recordClassSessionAttendanceHandler);
ClassRouter.get('/:id', requirePermission('groups_view'), validate(classIdParamSchema), getClassByIdHandler);
ClassRouter.put('/:id', requirePermission('groups_manage'), validate(updateClassSchema), updateClassHandler);
ClassRouter.delete('/:id', requirePermission('groups_manage'), validate(classIdParamSchema), deleteClassHandler);

export { ClassRouter };
