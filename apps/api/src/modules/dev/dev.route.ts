import { Router } from "express";

const DevRouter: Router = Router();

DevRouter.get("/dev", async (_, res) => {
  res.json({ message: "Hello from the dev route!" });
});

export default DevRouter;