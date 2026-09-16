import { Router, type Request, type Response } from "express";
import { db } from "@teachedo/database-sandbox";

export const healthRouter: Router = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  try {
    // Ping DB connection with a quick query
    await db.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      message: error instanceof Error ? error.message : "Database connection failed",
    });
  }
});
