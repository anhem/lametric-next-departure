import "isomorphic-fetch";
import { ResponseRD } from "./model/ResponseRD";

const REAL_TIME_DEPARTURES_V4_KEY = process.env.REAL_TIME_DEPARTURES_V4_KEY;
const BASE_URL =
  "https://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  REAL_TIME_DEPARTURES_V4_KEY;
const TIME_WINDOW = 60;

export async function getRealtimeDepartures(
  siteId: number
): Promise<ResponseRD> {
  try {
    const response = await fetch(createRequestUrl(siteId));
    return response.json();
  } catch (error) {
    throw new Error(`getRealtimeDepartures failed: ${error}`);
  }
}

function createRequestUrl(siteId: number): string {
  const request = `&siteid=${siteId}&timewindow=${TIME_WINDOW}`;
  return BASE_URL + request;
}
