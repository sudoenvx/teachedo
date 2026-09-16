import "dotenv/config";

import { runSeeders } from "./seeders/index.ts";
import { disconnect, db } from "../src/index.ts";

async function main() {
    await runSeeders(db);
}

main()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await disconnect();
    });