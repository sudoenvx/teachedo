-- DropForeignKey
ALTER TABLE `study_stages` DROP FOREIGN KEY `study_stages_teacher_id_fkey`;

-- DropIndex
DROP INDEX `study_stages_ordering_index_key` ON `study_stages`;

-- DropIndex
DROP INDEX `study_stages_teacher_id_fkey` ON `study_stages`;

-- AlterTable
ALTER TABLE `study_stages` MODIFY `ordering_index` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `study_stages` ADD CONSTRAINT `study_stages_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
