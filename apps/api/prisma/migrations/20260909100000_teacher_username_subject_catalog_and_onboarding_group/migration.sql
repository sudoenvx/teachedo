ALTER TABLE `teachers`
  ADD COLUMN `username` VARCHAR(50) NULL,
  MODIFY `email` VARCHAR(255) NULL;

UPDATE `teachers`
SET `username` = CONCAT('teacher_', `id`)
WHERE `username` IS NULL;

ALTER TABLE `teachers`
  MODIFY `username` VARCHAR(50) NOT NULL,
  ADD UNIQUE INDEX `teachers_username_key` (`username`),
  DROP INDEX `teachers_email_key`,
  ADD UNIQUE INDEX `teachers_email_key` (`email`);

ALTER TABLE `student_groups`
  ADD COLUMN `schedule_description` VARCHAR(255) NULL;

CREATE TABLE `subjects` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `ordering` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `subjects_name_key` (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `teacher_subjects` (
  `teacher_id` INTEGER NOT NULL,
  `subject_id` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`teacher_id`, `subject_id`),
  INDEX `teacher_subjects_subject_id_idx` (`subject_id`),
  CONSTRAINT `teacher_subjects_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `teacher_subjects_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `subjects` (`name`, `icon`, `ordering`, `updated_at`) VALUES
  ('الرياضيات', 'math', 1, CURRENT_TIMESTAMP(3)),
  ('الفيزياء', 'physics', 2, CURRENT_TIMESTAMP(3)),
  ('الكيمياء', 'chemistry', 3, CURRENT_TIMESTAMP(3)),
  ('الأحياء', 'biology', 4, CURRENT_TIMESTAMP(3)),
  ('اللغة العربية', 'arabic', 5, CURRENT_TIMESTAMP(3)),
  ('اللغة الإنجليزية', 'english', 6, CURRENT_TIMESTAMP(3)),
  ('الدراسات الاجتماعية', 'social', 7, CURRENT_TIMESTAMP(3)),
  ('العلوم', 'biology', 8, CURRENT_TIMESTAMP(3)),
  ('التاريخ', 'social', 9, CURRENT_TIMESTAMP(3)),
  ('الجغرافيا', 'social', 10, CURRENT_TIMESTAMP(3)),
  ('اللغة الفرنسية', 'english', 11, CURRENT_TIMESTAMP(3)),
  ('اللغة الألمانية', 'english', 12, CURRENT_TIMESTAMP(3)),
  ('الفلسفة والمنطق', 'social', 13, CURRENT_TIMESTAMP(3)),
  ('علم النفس والاجتماع', 'biology', 14, CURRENT_TIMESTAMP(3)),
  ('الاقتصاد', 'math', 15, CURRENT_TIMESTAMP(3)),
  ('التربية الدينية', 'arabic', 16, CURRENT_TIMESTAMP(3)),
  ('القرآن الكريم', 'arabic', 17, CURRENT_TIMESTAMP(3)),
  ('الحاسب الآلي', 'computer', 18, CURRENT_TIMESTAMP(3)),
  ('التربية الفنية', 'art', 19, CURRENT_TIMESTAMP(3)),
  ('التربية الموسيقية', 'music', 20, CURRENT_TIMESTAMP(3));
