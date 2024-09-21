import { Router } from "express";
import { initiateTransaction, webhook } from "../controller/payment";

const router = Router();

router.post("/", initiateTransaction);

router.post("/webhook", webhook);
export default router;
