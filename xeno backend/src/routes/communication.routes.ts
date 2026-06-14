import { Router } from "express";
import { CommunicationController } from "../controllers/communication.controller";

const router = Router();

router.post("/status", CommunicationController.updateStatus);

export default router;
