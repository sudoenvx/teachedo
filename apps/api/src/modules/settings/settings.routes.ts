import { Router } from 'express';
import {
    getSettingsHandler,
    updateSettingsHandler,
    getSettingByKeyHandler,
    getSettingsByGroupHandler,
    upsertSettingHandler,
} from './settings.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import {
    updateSettingsSchema,
    singleSettingSchema,
    getSettingByKeyParamSchema,
    getSettingByGroupParamSchema,
} from './settings.schema';

const SettingsRouter: Router = Router();

// Settings management
SettingsRouter.get('/', getSettingsHandler);
SettingsRouter.get('/group/:group', validate(getSettingByGroupParamSchema), getSettingsByGroupHandler);
SettingsRouter.put('/', requireAuth, requireRole('admin'), validate(updateSettingsSchema), updateSettingsHandler);
SettingsRouter.patch('/', requireAuth, requireRole('admin'), validate(updateSettingsSchema), updateSettingsHandler);
SettingsRouter.post('/', requireAuth, requireRole('admin'), validate(singleSettingSchema), upsertSettingHandler);
SettingsRouter.get('/:key', validate(getSettingByKeyParamSchema), getSettingByKeyHandler);

export { SettingsRouter };
