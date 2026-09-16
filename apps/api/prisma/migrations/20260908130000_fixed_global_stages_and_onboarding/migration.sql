ALTER TABLE `teachers` ADD COLUMN `onboarding_completed_at` DATETIME(3) NULL;
ALTER TABLE `study_stages` ADD COLUMN `stage_group` VARCHAR(30) NOT NULL DEFAULT 'primary';
ALTER TABLE `study_stages` ADD COLUMN `grade_number` INT NOT NULL DEFAULT 1;
UPDATE `study_stages` SET `ordering_index` = `id` WHERE `ordering_index` IS NULL;
ALTER TABLE `study_stages` DROP FOREIGN KEY `study_stages_teacher_id_fkey`;
ALTER TABLE `study_stages` DROP INDEX `study_stages_teacher_id_fkey`;
ALTER TABLE `study_stages` DROP COLUMN `teacher_id`;
ALTER TABLE `study_stages` ADD UNIQUE INDEX `study_stages_ordering_index_key` (`ordering_index`);
