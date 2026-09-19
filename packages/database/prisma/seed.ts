import "dotenv/config";

import { runSeeders } from "./seeders/index";
import { disconnect, db } from "../src/index";

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