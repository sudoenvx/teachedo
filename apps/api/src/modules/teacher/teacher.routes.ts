import { Router } from 'express';
import {
    loginTeacherHandler,
    logoutTeacherHandler,
    getTeacherMeHandler,
    createTeacherHandler,
    getTeachersHandler,
    getTeacherByIdHandler,
    updateTeacherHandler,
    deleteTeacherHandler,
    getLatestTeachersHandler,
    updateTeacherStatusHandler,
    completeTeacherOnboardingHandler,
} from './teacher.controller';
import { validate } from '../../core/middlewares/validate.mw';
import { requireAuth, requireRole } from '../../core/middlewares/require-auth';
import {
    teacherLoginSchema,
    createTeacherSchema,
    updateTeacherSchema,
    updateTeacherStatusSchema,
    queryTeachersSchema,
    teacherIdParamSchema,
    completeTeacherOnboardingSchema,
} from './teacher.schema';
import multer from 'multer';

const TeacherRouter: Router = Router();

const teacherImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/')),
});

// Auth routes for Teacher
TeacherRouter.post('/login', validate(teacherLoginSchema), loginTeacherHandler);
TeacherRouter.post('/auth/login', validate(teacherLoginSchema), loginTeacherHandler);
TeacherRouter.post('/logout', logoutTeacherHandler);
TeacherRouter.post('/auth/logout', logoutTeacherHandler);

// Teacher self-management
TeacherRouter.get('/me', requireAuth, requireRole('teacher'), getTeacherMeHandler);
TeacherRouter.patch('/onboarding', requireAuth, requireRole('teacher'), validate(completeTeacherOnboardingSchema), completeTeacherOnboardingHandler);

// Public / Admin management routes
TeacherRouter.get('/latest', getLatestTeachersHandler);
TeacherRouter.get('/', validate(queryTeachersSchema), getTeachersHandler);
TeacherRouter.post('/', teacherImageUpload.single('profileImage'), validate(createTeacherSchema), createTeacherHandler);
TeacherRouter.get('/:id', validate(teacherIdParamSchema), getTeacherByIdHandler);
TeacherRouter.put('/:id', teacherImageUpload.single('profileImage'), validate(updateTeacherSchema), updateTeacherHandler);
TeacherRouter.patch('/:id/status', validate(updateTeacherStatusSchema), updateTeacherStatusHandler);
TeacherRouter.delete('/:id', validate(teacherIdParamSchema), deleteTeacherHandler);

export { TeacherRouter };
