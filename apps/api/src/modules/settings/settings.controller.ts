import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import { ApiResponse } from '../../core/types/api-response';

export const getSettingsHandler = async (_req: Request, res: Response) => {
    const result = await settingsService.list();
    ApiResponse.success(res, result.settings, 'Settings retrieved successfully.', {
        grouped: result.grouped,
        raw: result.raw,
    });
};

export const updateSettingsHandler = async (req: Request, res: Response) => {
    const result = await settingsService.updateBatch(req.body);
    ApiResponse.success(res, result.settings, 'Settings updated successfully.', {
        grouped: result.grouped,
    });
};

export const getSettingByKeyHandler = async (req: Request, res: Response) => {
    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    const setting = await settingsService.getByKey(key);
    ApiResponse.success(res, setting);
};

export const getSettingsByGroupHandler = async (req: Request, res: Response) => {
    const group = Array.isArray(req.params.group) ? req.params.group[0] : req.params.group;
    const result = await settingsService.getByGroup(group);
    ApiResponse.success(res, result.settings, `Settings for group '${group}' retrieved successfully.`, {
        raw: result.raw,
    });
};

export const upsertSettingHandler = async (req: Request, res: Response) => {
    const setting = await settingsService.upsert(req.body);
    ApiResponse.success(res, setting, 'Setting saved successfully.');
};
