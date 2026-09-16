CREATE TABLE `policies` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 1,
  `is_published` BOOLEAN NOT NULL DEFAULT true,
  `updated_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `policies_key_key` (`key`)
);
ALTER TABLE `teachers` ADD COLUMN `onboarding_policy_key` VARCHAR(100) NULL;
ALTER TABLE `teachers` ADD COLUMN `onboarding_policy_version` INTEGER NULL;