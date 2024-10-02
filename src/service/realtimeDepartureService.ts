import cache from "memory-cache";
import { NextDepartureRequest } from "../model/NextDepartureRequest";
import { getRealtimeDepartures } from "../client/realtimeDeparturesClient";
import logger from "../logger";
import { Departure, Departures } from "../client/model/Departures";

const TEN_MINUTES = 600000;
export const NO_DEPARTURES: string[] = ["?"];
const departureCache = new cache.Cache();

export async function findNextDeparture(
  nextDepartureRequest: NextDepartureRequest
) {
  const responseData = await getDepartures(nextDepartureRequest.siteId);
  logger.debug(`got departures ${JSON.stringify(responseData)}`);
  const departuresForTransportMode = extractTransportModeDepartures(
    responseData,
    nextDepartureRequest
  );
  logger.debug(
    `extracted departures ${JSON.stringify(departuresForTransportMode)}`
  );
  const nextDeparture: Departure = extractDeparture(
    departuresForTransportMode,
    nextDepartureRequest
  );
  logger.debug(`extracted next departure ${JSON.stringify(nextDeparture)}`);
  return formatDepartureResponse(
    nextDeparture,
    nextDepartureRequest.displayLineNumber
  );
}

async function getDepartures(siteId: number): Promise<Departure[]> {
  const cachedDepartures: Departures = departureCache.get(siteId);
  if (cachedDepartures !== null) {
    logger.debug(`Found cached response for key ${siteId}`);
    return cachedDepartures.departures;
  } else {
    const departures: Departures = await getRealtimeDepartures(siteId);
    departureCache.put(siteId, departures, TEN_MINUTES);
    logger.info(
      `Added ${siteId} to departureCache. Current size ${departureCache.size()}`
    );
    return departures.departures;
  }
}

function extractTransportModeDepartures(
  responseData: Departure[],
  nextDepartureRequest: NextDepartureRequest
) {
  return responseData.filter(
    (departure) =>
      departure.line.transport_mode ===
      nextDepartureRequest.transportMode.toUpperCase()
  );
}

function extractDeparture(
  departures: Departure[],
  nextDepartureRequest: NextDepartureRequest
): Departure {
  return departures
    .filter(
      (departure) =>
        nextDepartureRequest.lineNumbers.length == 0 ||
        nextDepartureRequest.lineNumbers.indexOf(`${departure.line.id}`) > -1
    )
    .filter(
      (departure) =>
        departure.direction_code === nextDepartureRequest.journeyDirection
    )
    .sort(
      (departure1, departure2) =>
        new Date(departure1.expected).getTime() -
        new Date(departure2.expected).getTime()
    )
    .find(
      (departure) =>
        calculateMinutesLeft(departure.expected) >=
        nextDepartureRequest.skipMinutes
    );
}

function formatDepartureResponse(
  nextDeparture: Departure,
  displayLineNumber: boolean
): string[] {
  if (nextDeparture) {
    const departureTime = [
      `${calculateMinutesLeft(nextDeparture.expected)} min`,
    ];
    if (displayLineNumber) {
      return [
        `${nextDeparture.line.id}`,
        `${departureTime}`,
        `${nextDeparture.line.id}`,
        `${departureTime}`,
        `${nextDeparture.line.id}`,
        `${departureTime}`,
      ];
    }
    return departureTime;
  } else {
    return NO_DEPARTURES;
  }
}

function calculateMinutesLeft(expectedDepartureTime: Date): number {
  const durationInMs =
    new Date(expectedDepartureTime).getTime() - new Date().getTime();
  return Math.floor(durationInMs / 1000 / 60);
}
