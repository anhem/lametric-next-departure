import express from "express";
import RealTimeDeparturecontroller from './realTimeDeparturecontroller'

const router = express.Router();

router.get("/", (req, res) => {
    RealTimeDeparturecontroller.helloWorld(req, res);
});

router.get("/next", (req, res) => {
    RealTimeDeparturecontroller.getNextDeparture(req, res);
});

export default router
