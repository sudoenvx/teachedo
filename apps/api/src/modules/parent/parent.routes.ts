import { Router } from 'express';
import {
    loginParentHandler,
    createParentHandler,
    getParentsHandler,
    getParentByIdHandler,
    updateParentHandler,
    getParentMeHandler,
} from './parent.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import {
    parentLoginSchema,
    createParentSchema,
    updateParentSchema,
    queryParentsSchema,
    parentIdParamSchema,
} from './parent.schema';

const ParentRouter: Router = Router();

// Parent App Authentication & Profile
ParentRouter.post('/login', validate(parentLoginSchema), loginParentHandler);
ParentRouter.post('/auth/login', validate(parentLoginSchema), loginParentHandler);
ParentRouter.get('/me', requireAuth, requireRole('parent'), getParentMeHandler);

// Teacher / Staff management of Parents
ParentRouter.get('/', requireAuth, requireRole('teacher', 'assistant', 'admin'), validate(queryParentsSchema), getParentsHandler);
ParentRouter.post('/', requireAuth, requireRole('teacher', 'assistant', 'admin'), validate(createParentSchema), createParentHandler);
ParentRouter.get('/:id', requireAuth, requireRole('teacher', 'assistant', 'admin'), validate(parentIdParamSchema), getParentByIdHandler);
ParentRouter.put('/:id', requireAuth, requireRole('teacher', 'assistant', 'admin'), validate(updateParentSchema), updateParentHandler);

export { ParentRouter };
