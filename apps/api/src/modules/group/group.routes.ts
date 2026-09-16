import { Router } from 'express';
import { requireAuth, requirePermission, requireRole } from '../../core/middlewares/require-auth';
import { validate } from '../../core/middlewares/validate.mw';
import { createGroupHandler, deleteGroupHandler, getGroupByIdHandler, getGroupsHandler, updateGroupHandler } from './group.controller';
import { createGroupSchema, groupIdParamSchema, updateGroupSchema } from './group.schema';

const GroupRouter: Router = Router();
const teacherRoles = ['teacher', 'assistant'] as const;

GroupRouter.use(requireAuth, requireRole(...teacherRoles));
GroupRouter.get('/', requirePermission('groups_view'), getGroupsHandler);
GroupRouter.post('/', requirePermission('groups_manage'), validate(createGroupSchema), createGroupHandler);
GroupRouter.get('/:id', requirePermission('groups_view'), validate(groupIdParamSchema), getGroupByIdHandler);
GroupRouter.put('/:id', requirePermission('groups_manage'), validate(updateGroupSchema), updateGroupHandler);
GroupRouter.delete('/:id', requirePermission('groups_manage'), validate(groupIdParamSchema), deleteGroupHandler);

export { GroupRouter };