import { Router } from 'express';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import { validate } from '../../core/middlewares/validate.mw';
import { createSubjectHandler, deleteSubjectHandler, listSubjectsHandler, updateSubjectHandler } from './subject.controller';
import { createSubjectSchema, subjectIdSchema, updateSubjectSchema } from './subject.schema';

const SubjectRouter: Router = Router();
SubjectRouter.get('/', requireAuth, listSubjectsHandler);
SubjectRouter.post('/', requireAuth, requireRole('admin'), validate(createSubjectSchema), createSubjectHandler);
SubjectRouter.put('/:id', requireAuth, requireRole('admin'), validate(updateSubjectSchema), updateSubjectHandler);
SubjectRouter.delete('/:id', requireAuth, requireRole('admin'), validate(subjectIdSchema), deleteSubjectHandler);

export { SubjectRouter };