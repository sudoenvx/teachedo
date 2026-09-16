ALTER TABLE `teacher_assistants`
    ADD COLUMN `username` VARCHAR(50) NULL AFTER `full_name`;

UPDATE `teacher_assistants`
SET `username` = LEFT(SUBSTRING_INDEX(`email`, '@', 1), 50)
WHERE `username` IS NULL;

ALTER TABLE `teacher_assistants`
    MODIFY COLUMN `username` VARCHAR(50) NOT NULL,
    MODIFY COLUMN `email` VARCHAR(255) NULL;

CREATE UNIQUE INDEX `teacher_assistants_username_key` ON `teacher_assistants`(`username`);