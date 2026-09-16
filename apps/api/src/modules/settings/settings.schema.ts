import { z } from 'zod';

export const updateSettingsSchema = z.object({
    body: z.union([
        z.record(z.string(), z.any()),
        z.array(
            z.object({
                key: z.string().min(1, 'Key is required'),
                value: z.any().optional(),
                settingGroup: z.string().optional(),
                isEncrypted: z.boolean().optional(),
            })
        ),
    ]),
});

export const singleSettingSchema = z.object({
    body: z.object({
        key: z.string().min(1, 'Key is required'),
        value: z.any().optional(),
        settingGroup: z.string().optional(),
        isEncrypted: z.boolean().optional(),
    }),
});

export const getSettingByKeyParamSchema = z.object({
    params: z.object({
        key: z.string().min(1, 'Key is required'),
    }),
});

export const getSettingByGroupParamSchema = z.object({
    params: z.object({
        group: z.string().min(1, 'Group is required'),
    }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
export type SingleSettingInput = z.infer<typeof singleSettingSchema>['body'];
export type SettingKeyParam = z.infer<typeof getSettingByKeyParamSchema>['params'];
export type SettingGroupParam = z.infer<typeof getSettingByGroupParamSchema>['params'];
