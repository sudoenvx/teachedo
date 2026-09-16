/*
  Warnings:

  - Made the column `ordering_index` on table `study_stages` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `study_stages` MODIFY `ordering_index` INTEGER NOT NULL,
    ALTER COLUMN `stage_group` DROP DEFAULT,
    ALTER COLUMN `grade_number` DROP DEFAULT;
