import { Router } from 'express';
import {
    loginStudentHandler,
    createStudentHandler,
    getStudentsHandler,
    getStudentStatsHandler,
    getStudentByIdHandler,
    updateStudentHandler,
    deleteStudentHandler,
    regenerateCredentialsHandler,
    enrollStudentHandler,
    unenrollStudentHandler,
    getStudentMeHandler,
    getStudentAttendanceHandler,
    getStudentInvoicesHandler,
} from './student.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requirePermission, requireRole } from '../../core/middlewares/require-auth';
import {
    studentLoginSchema,
    createStudentSchema,
    updateStudentSchema,
    enrollStudentSchema,
    queryStudentsSchema,
    studentIdParamSchema,
    unenrollStudentParamSchema,
} from './student.schema';
import multer from 'multer';

const StudentRouter: Router = Router();
const studentImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/')),
});

// Student App Authentication & Me routes
StudentRouter.post('/login', validate(studentLoginSchema), loginStudentHandler);
StudentRouter.post('/auth/login', validate(studentLoginSchema), loginStudentHandler);
StudentRouter.get('/me', requireAuth, requireRole('student'), getStudentMeHandler);
StudentRouter.get('/me/attendance', requireAuth, requireRole('student'), getStudentAttendanceHandler);
StudentRouter.get('/me/invoices', requireAuth, requireRole('student'), getStudentInvoicesHandler);

// Teacher / Staff management of Students
StudentRouter.get('/', requireAuth, requireRole('teacher', 'assistant', 'admin'), requirePermission('students_view'), validate(queryStudentsSchema), getStudentsHandler);
StudentRouter.get('/stats', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_view'), getStudentStatsHandler);
StudentRouter.post('/', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_manage'), studentImageUpload.single('profileImage'), validate(createStudentSchema), createStudentHandler);
StudentRouter.get('/:id', requireAuth, requireRole('teacher', 'assistant', 'admin'), requirePermission('students_view'), validate(studentIdParamSchema), getStudentByIdHandler);
StudentRouter.put('/:id', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_manage'), studentImageUpload.single('profileImage'), validate(updateStudentSchema), updateStudentHandler);
StudentRouter.delete('/:id', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_manage'), validate(studentIdParamSchema), deleteStudentHandler);
StudentRouter.post('/:id/regenerate-card', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_manage'), validate(studentIdParamSchema), regenerateCredentialsHandler);
StudentRouter.post('/:id/enroll', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_manage'), validate(enrollStudentSchema), enrollStudentHandler);
StudentRouter.delete('/:id/enroll/:groupId', requireAuth, requireRole('teacher', 'assistant'), requirePermission('students_manage'), validate(unenrollStudentParamSchema), unenrollStudentHandler);

export { StudentRouter };
