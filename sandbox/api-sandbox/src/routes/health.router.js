import { Router } from "express";
import { db } from "@teachedo/database";
export const healthRouter = Router();
healthRouter.get("/", async (_req, res) => {
    try {
        // Ping DB connection with a quick query
        await db.$queryRaw `SELECT 1`;
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            message: error instanceof Error ? error.message : "Database connection failed",
        });
    }
});
