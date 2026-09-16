import { Router } from 'express';
import {
    loginAssistantHandler,
    getPermissionsCatalogHandler,
    createAssistantHandler,
    getAssistantsHandler,
    getAssistantByIdHandler,
    updateAssistantHandler,
    deleteAssistantHandler,
    getAssistantMeHandler,
} from './assistant.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import { clearAuthTokenCookie } from '../../core/utils/auth/cookie';
import {
    assistantLoginSchema,
    createAssistantSchema,
    updateAssistantSchema,
    queryAssistantsSchema,
    assistantIdParamSchema,
} from './assistant.schema';

const AssistantRouter: Router = Router();

// Assistant Auth & Profile
AssistantRouter.post('/login', validate(assistantLoginSchema), loginAssistantHandler);
AssistantRouter.post('/auth/login', validate(assistantLoginSchema), loginAssistantHandler);
AssistantRouter.post('/logout', (_req, res) => { clearAuthTokenCookie(res); res.status(200).json({ success: true, data: null }); });
AssistantRouter.get('/me', requireAuth, requireRole('assistant'), getAssistantMeHandler);

// Permissions Catalog
AssistantRouter.get('/permissions-catalog', requireAuth, requireRole('teacher', 'admin'), getPermissionsCatalogHandler);

// Teacher Management of Assistants
AssistantRouter.get('/', requireAuth, requireRole('teacher', 'admin'), validate(queryAssistantsSchema), getAssistantsHandler);
AssistantRouter.post('/', requireAuth, requireRole('teacher'), validate(createAssistantSchema), createAssistantHandler);
AssistantRouter.get('/:id', requireAuth, requireRole('teacher', 'admin'), validate(assistantIdParamSchema), getAssistantByIdHandler);
AssistantRouter.put('/:id', requireAuth, requireRole('teacher'), validate(updateAssistantSchema), updateAssistantHandler);
AssistantRouter.delete('/:id', requireAuth, requireRole('teacher'), validate(assistantIdParamSchema), deleteAssistantHandler);

export { AssistantRouter };
