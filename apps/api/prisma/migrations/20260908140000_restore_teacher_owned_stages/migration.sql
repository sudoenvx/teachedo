ALTER TABLE `study_stages` ADD COLUMN `teacher_id` INT NULL;

UPDATE `study_stages` s
LEFT JOIN (
  SELECT study_stage_id, MIN(teacher_id) AS teacher_id
  FROM students
  WHERE study_stage_id IS NOT NULL
  GROUP BY study_stage_id
) st ON st.study_stage_id = s.id
LEFT JOIN (
  SELECT study_stage_id, MIN(teacher_id) AS teacher_id
  FROM student_groups
  WHERE study_stage_id IS NOT NULL
  GROUP BY study_stage_id
) sg ON sg.study_stage_id = s.id
SET s.teacher_id = COALESCE(st.teacher_id, sg.teacher_id, 1);

ALTER TABLE `study_stages` MODIFY COLUMN `teacher_id` INT NOT NULL;
ALTER TABLE `study_stages` ADD CONSTRAINT `study_stages_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;