import { Request, Response } from 'express';
import { ApiResponse } from '../../core/types/api-response';
import { classService } from './group.service';

const teacherIdFromRequest = (req: Request) => Number(req.scope || req.user?.id);

export const getClassesHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await classService.list(teacherIdFromRequest(req)));
};

export const getClassByIdHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await classService.findById(Number(req.params.id), teacherIdFromRequest(req)));
};

export const createClassHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await classService.create(teacherIdFromRequest(req), req.body), 'Class created successfully.');
};

export const updateClassHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await classService.update(Number(req.params.id), teacherIdFromRequest(req), req.body), 'Class updated successfully.');
};

export const deleteClassHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await classService.delete(Number(req.params.id), teacherIdFromRequest(req)), 'Class deleted successfully.');
};

export const createClassSessionHandler = async (req: Request, res: Response) => {
    ApiResponse.success(
        res,
        await classService.createSession(Number(req.params.id), teacherIdFromRequest(req), req.body),
        'Class session created successfully.',
    );
};
