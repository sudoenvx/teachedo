import { Request, Response } from 'express';
import { ApiResponse } from '../../core/types/api-response';
import { groupService } from './group.service';

const teacherIdFromRequest = (req: Request) => Number(req.scope || req.user?.id);

export const getGroupsHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await groupService.list(teacherIdFromRequest(req)));
};

export const getGroupByIdHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await groupService.findById(Number(req.params.id), teacherIdFromRequest(req)));
};

export const createGroupHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await groupService.create(teacherIdFromRequest(req), req.body), 'Group created successfully.');
};

export const updateGroupHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await groupService.update(Number(req.params.id), teacherIdFromRequest(req), req.body), 'Group updated successfully.');
};

export const deleteGroupHandler = async (req: Request, res: Response) => {
    ApiResponse.success(res, await groupService.delete(Number(req.params.id), teacherIdFromRequest(req)), 'Group deleted successfully.');
};