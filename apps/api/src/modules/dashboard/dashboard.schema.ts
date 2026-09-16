import { z } from 'zod';

export const dashboardDateQuerySchema = z.object({
    query: z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/, 'Month format must be YYYY-MM').optional(),
    }),
});

export type DashboardDateQueryInput = z.infer<typeof dashboardDateQuerySchema>['query'];
