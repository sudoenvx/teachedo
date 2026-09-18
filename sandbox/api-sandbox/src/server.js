import "dotenv/config";
import { app } from "./app.js";
import { db, disconnect } from "@teachedo/database";
const PORT = process.env['PORT'] || 3001;
const server = app.listen(PORT, () => {
    console.log(`🚀 API Sandbox server running at http://localhost:${PORT}`);
    db.user.findMany({});
});
async function shutdown(signal) {
    console.log(`\n${signal} received. Closing HTTP server and database connections...`);
    server.close(async () => {
        try {
            await disconnect();
            console.log("Database disconnected. Server shut down cleanly.");
            process.exit(0);
        }
        catch (err) {
            console.error("Error during database disconnect:", err);
            process.exit(1);
        }
    });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
