import { prisma } from './prisma.client';
import { seedDevDemoData } from './seeders/dev-demo.seeder';
import { seedEssentialData } from './seeders/essential.seeder';
import { seedPermissions } from './seeders/permissions.seeder';

const seedDatabase = async () => {
    console.log('🚀 Starting Database Seeder...\n');

    // Always seed essential production data
    await seedEssentialData();
    await seedPermissions();

    // Conditionally seed development demo data
    const isDev = process.env.NODE_ENV !== 'production';
    const forceDemo = process.argv.includes('--demo');

    if (isDev || forceDemo) {
        console.log('\n🔧 Environment is development / demo flag detected:');
        await seedDevDemoData();
    } else {
        console.log('\n🔒 Production environment detected: skipped demo seeds.');
    }
};

seedDatabase()
    .then(() => {
        console.log('\n🎉 Database seeding completed successfully!\n');
    })
    .catch((error) => {
        console.error('\n❌ Error seeding database:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });