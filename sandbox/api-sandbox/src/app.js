import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.router.js";
import { usersRouter } from "./routes/users.router.js";
export const app = express();
app.use(cors());
app.use(express.json());
// Routes
app.use("/health", healthRouter);
app.use("/api/users", usersRouter);
// Root route
app.get("/", (_req, res) => {
    res.json({
        name: "@teachedo/api-sandbox",
        message: "API Sandbox server is running with Prisma database integration",
        endpoints: {
            health: "GET /health",
            users: {
                list: "GET /api/users",
                getById: "GET /api/users/:id",
                create: "POST /api/users",
                delete: "DELETE /api/users/:id",
            },
        },
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
