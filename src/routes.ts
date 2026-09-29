import express from "express";
import { getNextDeparture, getStats } from "./controller/realtimeDepartureController";

const router = express.Router();
router.get("/next", (req, res) => getNextDeparture(req, res));
router.get("/stats", (req, res) => getStats(req, res));

export default router;
