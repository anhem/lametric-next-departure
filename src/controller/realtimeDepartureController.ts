import { NextDepartureRequest } from "../model/NextDepartureRequest";
import { findNextDeparture } from "../service/realtimeDepartureService";
import { createError, createResponse } from "../service/laMetricService";
import { TransportMode } from "../model/TransportMode";
import logger from "../logger";

export const INVALID_REQUEST = "invalid request";

export async function getNextDeparture(req, res) {
  const nextDepartureRequest = toNextDepartureRequest(req);
  if (isValid(nextDepartureRequest)) {
    logger.info(`Incoming request: ${JSON.stringify(nextDepartureRequest)}`);
    try {
      const nextDeparture = await findNextDeparture(nextDepartureRequest);
      res.json(
        createResponse(nextDeparture, nextDepartureRequest.transportMode)
      );
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.json(createError("Error", nextDepartureRequest.transportMode));
    }
  } else {
    logger.warn(`Invalid request: ${JSON.stringify(nextDepartureRequest)}`);
    res.json(createError(INVALID_REQUEST, undefined));
  }
}

function toNextDepartureRequest(req): NextDepartureRequest {
  return {
    siteId: parseInt(req.query["site-id"]),
    transportMode: TransportMode[req.query["transport-mode"]],
    journeyDirection: parseInt(req.query["journey-direction"]),
    skipMinutes: parseInt(req.query["skip-minutes"]) || 0,
    lineNumbers: req.query["line-numbers"]
      ? req.query["line-numbers"].toLowerCase().split(",")
      : [],
    displayLineNumber: req.query["display-line-number"]
      ? req.query["display-line-number"] === "true"
      : false,
  };
}

function isValid(nextDepartureRequest: NextDepartureRequest) {
  return (
    nextDepartureRequest.siteId &&
    nextDepartureRequest.transportMode &&
    nextDepartureRequest.journeyDirection
  );
}
