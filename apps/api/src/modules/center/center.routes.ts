import { Router } from 'express'
import { requireAuth, requireRole } from '../../core/middlewares/require-auth'
import { validate } from '../../core/middlewares/validate.mw'
import { createCenterHandler, deleteCenterHandler, getCenterHandler, listCentersHandler, updateCenterHandler } from './center.controller'
import { centerIdSchema, createCenterSchema, updateCenterSchema } from './center.schema'

const CenterRouter = Router()
CenterRouter.use(requireAuth, requireRole('teacher', 'assistant'))
CenterRouter.get('/', listCentersHandler)
CenterRouter.post('/', validate(createCenterSchema), createCenterHandler)
CenterRouter.get('/:id', validate(centerIdSchema), getCenterHandler)
CenterRouter.put('/:id', validate(updateCenterSchema), updateCenterHandler)
CenterRouter.delete('/:id', validate(centerIdSchema), deleteCenterHandler)

export { CenterRouter }