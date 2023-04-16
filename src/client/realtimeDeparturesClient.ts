import "isomorphic-fetch";
import { ResponseRD } from "./model/ResponseRD";
import logger from "../logger";

const REAL_TIME_DEPARTURES_V4_KEY = process.env.REAL_TIME_DEPARTURES_V4_KEY;
const BASE_URL =
  "https://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  REAL_TIME_DEPARTURES_V4_KEY;
const TIME_WINDOW = 60;

export function getRealtimeDepartures(siteId: number): Promise<ResponseRD> {
  return fetch(createRequestUrl(siteId))
    .then((response) => {
      return response.json().then((json) => {
        if (response.status >= 400) {
          logger.error(
            `Get request failed. ${response.status} - ${JSON.stringify(json)}`
          );
          return Promise.reject(json);
        } else {
          return Promise.resolve(json);
        }
      });
    })
    .then(
      (response) => {
        return Promise.resolve(response);
      },
      (error) => {
        logger.error(error);
        return Promise.reject("Failed to fetch information from SL");
      }
    );
}

function createRequestUrl(siteId: number): string {
  const request = `&siteid=${siteId}&timewindow=${TIME_WINDOW}&train=true&bus=true&metro=true&tram=true&ships=true`;
  return BASE_URL + request;
}
