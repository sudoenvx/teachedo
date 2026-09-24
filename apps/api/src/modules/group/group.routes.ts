import { Router } from 'express';
import { requireAuth, requirePermission, requireRole } from '../../core/middlewares/require-auth';
import { validate } from '../../core/middlewares/validate.mw';
import { createClassHandler, createClassSessionHandler, deleteClassHandler, getClassByIdHandler, getClassesHandler, updateClassHandler } from './group.controller';
import { createClassSchema, createClassSessionSchema, classIdParamSchema, updateClassSchema } from './group.schema';

const ClassRouter: Router = Router();
const teacherRoles = ['teacher', 'assistant'] as const;

ClassRouter.use(requireAuth, requireRole(...teacherRoles));
ClassRouter.get('/', requirePermission('groups_view'), getClassesHandler);
ClassRouter.post('/', requirePermission('groups_manage'), validate(createClassSchema), createClassHandler);
ClassRouter.post('/:id/sessions', requirePermission('groups_manage'), validate(createClassSessionSchema), createClassSessionHandler);
ClassRouter.get('/:id', requirePermission('groups_view'), validate(classIdParamSchema), getClassByIdHandler);
ClassRouter.put('/:id', requirePermission('groups_manage'), validate(updateClassSchema), updateClassHandler);
ClassRouter.delete('/:id', requirePermission('groups_manage'), validate(classIdParamSchema), deleteClassHandler);

export { ClassRouter };
