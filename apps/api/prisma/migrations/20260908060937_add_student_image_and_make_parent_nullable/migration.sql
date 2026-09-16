-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_parent_id_fkey`;

-- DropIndex
DROP INDEX `students_parent_id_fkey` ON `students`;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
