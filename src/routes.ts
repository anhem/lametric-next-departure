import express from "express";
import { getNextDeparture } from "./controller/realtimeDepartureController";

const router = express.Router();
router.get("/next", (req, res) => getNextDeparture(req, res));

export default router;
