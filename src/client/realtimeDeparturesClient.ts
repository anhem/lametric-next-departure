import "isomorphic-fetch";
import logger from "../logger";
import crypto from "crypto";
import {Departures} from "./model/Departures";

const BASE_URL = "https://transport.integration.sl.se/v1";
const FORECAST = 60

export async function getRealtimeDepartures(
  siteId: number
): Promise<Departures> {
  try {
    const url = `${BASE_URL}/sites/${siteId}/departures?forecast=${FORECAST}&uuid=${crypto.randomUUID()}`;
    console.log(url);
    const response = await fetch(url);
    const json = await response.json();
    logger.debug(
      `Got realtime departures response for ${siteId} as ${JSON.stringify(
        json
      )}`
    );
    return json;
  } catch (error) {
    throw new Error(
      `Failed to get realtime departures due to ${error.message}`
    );
  }
}

