UPDATE `subjects` SET `icon` = CASE `name`
  WHEN 'الرياضيات' THEN 'math'
  WHEN 'الفيزياء' THEN 'physics'
  WHEN 'الكيمياء' THEN 'chemistry'
  WHEN 'الأحياء' THEN 'biology'
  WHEN 'اللغة العربية' THEN 'arabic'
  WHEN 'اللغة الإنجليزية' THEN 'english'
  WHEN 'الدراسات الاجتماعية' THEN 'social'
  WHEN 'الحاسب الآلي' THEN 'computer'
  ELSE `icon`
END;

INSERT IGNORE INTO `subjects` (`name`, `icon`, `ordering`, `updated_at`) VALUES
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
