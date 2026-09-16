import { seedAdminData } from './admin.seeder'
import { seedPolicyData } from './policy.seeder'
import { seedSettingsData } from './settings.seeder'

export async function seedEssentialData() {
  console.log('🌱 Seeding essential domain data...')
  await seedAdminData()
  await seedSettingsData()
  await seedPolicyData()
}
