import { z } from 'zod'

const centerFields = {
  name: z.string().trim().min(2).max(100),
  location: z.string().trim().max(255).optional().nullable(),
  area: z.string().trim().max(100).optional().nullable(),
  phoneNumber: z.string().trim().max(20).optional().nullable(),
  commission: z.number().nonnegative().optional().nullable(),
  commissionType: z.enum(['percentage', 'fixed_per_student', 'none']).default('none'),
}

export const createCenterSchema = z.object({ body: z.object(centerFields) })
export const updateCenterSchema = z.object({
  params: z.object({ id: z.coerce.number().positive() }),
  body: z.object(centerFields).partial(),
})
export const centerIdSchema = z.object({ params: z.object({ id: z.coerce.number().positive() }) })

export type CreateCenterInput = z.infer<typeof createCenterSchema>['body']
export type UpdateCenterInput = z.infer<typeof updateCenterSchema>['body']