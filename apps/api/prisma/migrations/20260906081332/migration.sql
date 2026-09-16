/*
  Warnings:

  - A unique constraint covering the columns `[student_code]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `students` ADD COLUMN `password` VARCHAR(255) NULL,
    ADD COLUMN `student_code` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_student_code_key` ON `students`(`student_code`);
