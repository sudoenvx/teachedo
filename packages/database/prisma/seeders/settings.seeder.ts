import { PrismaClient } from "../../src"

export async function seedSettingsData(prisma: PrismaClient) {
  const settings = [
    ['price_per_student', '10', 'billing'], ['currency', 'EGP', 'billing'], ['trial_days', '14', 'billing'],
    ['billing_cycle_days', '30', 'billing'], ['grace_period_days', '5', 'billing'], ['auto_suspend_unpaid', 'true', 'billing'],
    ['business_name', 'Portal Edu (SaaS)', 'general'], ['support_email', 'support@portaledu.com', 'general'],
    ['support_phone', '+20 100 000 0000', 'general'], ['default_language', 'ar', 'general'],
    ['notify_on_payment_overdue', 'true', 'notifications'], ['weekly_system_report', 'false', 'notifications'],
  ] as const
  for (const [key, value, settingGroup] of settings) {
    await prisma.globalSettings.upsert({ where: { key }, update: { value, settingGroup }, create: { key, value, settingGroup } })
  }
  console.log(`  ✅ ${settings.length} global settings initialized`)
}
