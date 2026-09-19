import express, { Application, type Request, type Response } from "express";
import cors from "cors";

export const app:Application = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_req: Request, res: Response) => {
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
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});
