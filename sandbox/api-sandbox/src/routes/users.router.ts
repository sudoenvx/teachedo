import { Router, type Request, type Response } from "express";
import { db } from "@teachedo/database-sandbox";

export const usersRouter: Router = Router();

// GET /api/users - List all users
usersRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    });
  }
});

// GET /api/users/:id - Get a user by ID
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid user ID" });
      return;
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    });
  }
});

// POST /api/users - Create a new user
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, error: "Field 'email' is required" });
      return;
    }

    const user = await db.user.create({
      data: { email, name: name ?? null },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    });
  }
});

// DELETE /api/users/:id - Delete a user
usersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid user ID" });
      return;
    }

    const user = await db.user.delete({ where: { id } });
    res.json({ success: true, message: `User ${id} deleted`, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    });
  }
});
