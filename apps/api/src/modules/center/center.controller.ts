import type { Request, Response } from 'express'
import { ApiResponse } from '../../core/types/api-response'
import { centerService } from './center.service'

const teacherIdFromRequest = (req: Request) => Number(req.scope || req.user?.id)

export const listCentersHandler = async (req: Request, res: Response) => ApiResponse.success(res, await centerService.list(teacherIdFromRequest(req)))
export const getCenterHandler = async (req: Request, res: Response) => ApiResponse.success(res, await centerService.findById(Number(req.params.id), teacherIdFromRequest(req)))
export const createCenterHandler = async (req: Request, res: Response) => ApiResponse.success(res, await centerService.create(teacherIdFromRequest(req), req.body), 'Center created successfully.')
export const updateCenterHandler = async (req: Request, res: Response) => ApiResponse.success(res, await centerService.update(Number(req.params.id), teacherIdFromRequest(req), req.body))
export const deleteCenterHandler = async (req: Request, res: Response) => ApiResponse.success(res, await centerService.remove(Number(req.params.id), teacherIdFromRequest(req)))