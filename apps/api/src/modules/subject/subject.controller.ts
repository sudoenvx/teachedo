import { Request, Response } from 'express';
import { ApiResponse } from '../../core/types/api-response';
import { subjectService } from './subject.service';

export const listSubjectsHandler = async (req: Request, res: Response) => ApiResponse.success(res, await subjectService.list(req.query.activeOnly === 'true'));
export const createSubjectHandler = async (req: Request, res: Response) => ApiResponse.success(res, await subjectService.create(req.body));
export const updateSubjectHandler = async (req: Request, res: Response) => ApiResponse.success(res, await subjectService.update(Number(req.params.id), req.body));
export const deleteSubjectHandler = async (req: Request, res: Response) => ApiResponse.success(res, await subjectService.delete(Number(req.params.id)));