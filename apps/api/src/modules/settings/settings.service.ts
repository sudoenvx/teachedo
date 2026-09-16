import { prisma } from '../../core/database/prisma.client';
import { NotFoundError } from '../../shared/contracts/api-error';
import { UpdateSettingsInput, SingleSettingInput } from './settings.schema';

function parseSettingValue(raw: string | null): unknown {
    if (raw === null || raw === undefined) return null;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (!isNaN(Number(raw)) && raw.trim() !== '') return Number(raw);
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

function stringifySettingValue(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return JSON.stringify(val);
}

export class SettingsService {
    public async list() {
        const settings = await prisma.globalSettings.findMany({
            orderBy: [{ settingGroup: 'asc' }, { key: 'asc' }],
        });

        const formatted: Record<string, unknown> = {};
        const grouped: Record<string, Record<string, unknown>> = {};

        for (const s of settings) {
            const parsed = s.isEncrypted ? '********' : parseSettingValue(s.value);
            formatted[s.key] = parsed;

            const group = s.settingGroup || 'general';
            if (!grouped[group]) {
                grouped[group] = {};
            }
            grouped[group][s.key] = parsed;
        }

        return {
            settings: formatted,
            grouped,
            raw: settings.map((s) => ({
                id: s.id,
                group: s.settingGroup,
                key: s.key,
                value: s.isEncrypted ? '********' : parseSettingValue(s.value),
                isEncrypted: s.isEncrypted,
                updatedAt: s.updatedAt,
            })),
        };
    }

    public async getByGroup(group: string) {
        const settings = await prisma.globalSettings.findMany({
            where: { settingGroup: group },
            orderBy: { key: 'asc' },
        });

        if (settings.length === 0) {
            throw new NotFoundError(`No settings found for group '${group}'.`);
        }

        const formatted: Record<string, unknown> = {};
        for (const s of settings) {
            formatted[s.key] = s.isEncrypted ? '********' : parseSettingValue(s.value);
        }

        return {
            group,
            settings: formatted,
            raw: settings.map((s) => ({
                id: s.id,
                group: s.settingGroup,
                key: s.key,
                value: s.isEncrypted ? '********' : parseSettingValue(s.value),
                isEncrypted: s.isEncrypted,
                updatedAt: s.updatedAt,
            })),
        };
    }

    public async getByKey(key: string) {
        const setting = await prisma.globalSettings.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundError(`Setting '${key}' not found.`);
        }

        return {
            id: setting.id,
            group: setting.settingGroup,
            key: setting.key,
            value: setting.isEncrypted ? '********' : parseSettingValue(setting.value),
            isEncrypted: setting.isEncrypted,
            updatedAt: setting.updatedAt,
        };
    }

    public async updateBatch(input: UpdateSettingsInput) {
        const entries: Array<{ key: string; value: unknown; group?: string; isEncrypted?: boolean }> = [];

        if (Array.isArray(input)) {
            for (const item of input) {
                entries.push({
                    key: item.key,
                    value: item.value,
                    group: item.settingGroup,
                    isEncrypted: item.isEncrypted,
                });
            }
        } else if (typeof input === 'object' && input !== null) {
            for (const [key, value] of Object.entries(input)) {
                entries.push({ key, value });
            }
        }

        await prisma.$transaction(
            entries.map((item) => {
                const strValue = stringifySettingValue(item.value);
                return prisma.globalSettings.upsert({
                    where: { key: item.key },
                    update: {
                        value: strValue,
                        ...(item.group !== undefined ? { settingGroup: item.group } : {}),
                        ...(item.isEncrypted !== undefined ? { isEncrypted: item.isEncrypted } : {}),
                    },
                    create: {
                        key: item.key,
                        value: strValue,
                        settingGroup: item.group || 'general',
                        isEncrypted: item.isEncrypted || false,
                    },
                });
            })
        );

        return this.list();
    }

    public async upsert(input: SingleSettingInput) {
        const strValue = stringifySettingValue(input.value);

        const setting = await prisma.globalSettings.upsert({
            where: { key: input.key },
            update: {
                value: strValue,
                ...(input.settingGroup !== undefined ? { settingGroup: input.settingGroup } : {}),
                ...(input.isEncrypted !== undefined ? { isEncrypted: input.isEncrypted } : {}),
            },
            create: {
                key: input.key,
                value: strValue,
                settingGroup: input.settingGroup || 'general',
                isEncrypted: input.isEncrypted || false,
            },
        });

        return {
            id: setting.id,
            group: setting.settingGroup,
            key: setting.key,
            value: setting.isEncrypted ? '********' : parseSettingValue(setting.value),
            isEncrypted: setting.isEncrypted,
            updatedAt: setting.updatedAt,
        };
    }
}

export const settingsService = new SettingsService();
