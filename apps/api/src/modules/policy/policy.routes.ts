import { Router } from 'express';
import { requireAuth } from '../../core/middlewares/require-auth';
import { getPublishedPolicyHandler } from './policy.controller';

const PolicyRouter: Router = Router();
PolicyRouter.get('/:key', requireAuth, getPublishedPolicyHandler);
export { PolicyRouter };