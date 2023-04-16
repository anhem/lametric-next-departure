import cache from "memory-cache";
import { NextDepartureRequest } from "../model/NextDepartureRequest";
import { getRealtimeDepartures } from "../client/realtimeDeparturesClient";
import { ResponseRD } from "../client/model/ResponseRD";
import { TransportMode } from "../model/TransportMode";
import { ResponseDataRD } from "../client/model/ResponseDataRD";
import { DepartureRD } from "../client/model/DepartureRD";
import logger from "../logger";

const THIRTY_MINUTES = 1800000;
export const NO_DEPARTURES: string[] = ["?"];
const departureCache = new cache.Cache();

export async function findNextDeparture(
  nextDepartureRequest: NextDepartureRequest
) {
  const responseData = await getDepartures(nextDepartureRequest.siteId);
  logger.debug(`responseData: ${JSON.stringify(responseData)}`);
  const departures = extractTransportModeDepartures(
    responseData,
    nextDepartureRequest.transportMode
  );
  logger.debug(`departures: ${JSON.stringify(departures)}`);
  const nextDeparture: DepartureRD = extractDeparture(
    departures,
    nextDepartureRequest
  );
  logger.debug(`nextDeparture: ${JSON.stringify(nextDeparture)}`);
  return formatDepartureResponse(
    nextDeparture,
    nextDepartureRequest.displayLineNumber
  );
}

async function getDepartures(siteId): Promise<ResponseDataRD> {
  const cachedResponseRD: ResponseRD = departureCache.get(siteId);
  if (cachedResponseRD !== null) {
    logger.info(`Found cached response for key: ${siteId}`);
    return cachedResponseRD.ResponseData;
  } else {
    const responseRD: ResponseRD = await getRealtimeDepartures(siteId);
    departureCache.put(siteId, responseRD, THIRTY_MINUTES);
    logger.info(
      `Added ${siteId} to departureCache. Current size: ${departureCache.size()}`
    );
    return responseRD.ResponseData;
  }
}

function extractTransportModeDepartures(
  responseDataRD: ResponseDataRD,
  transportMode: TransportMode
): DepartureRD[] {
  if (responseDataRD) {
    switch (transportMode) {
      case TransportMode.bus:
        return responseDataRD.Buses || [];
      case TransportMode.metro:
        return responseDataRD.Metros || [];
      case TransportMode.train:
        return responseDataRD.Trains || [];
      case TransportMode.tram:
        return responseDataRD.Trams || [];
      case TransportMode.ships:
        return responseDataRD.Ships || [];
      default:
        return [];
    }
  }
  return [];
}

function extractDeparture(
  departures: DepartureRD[],
  nextDepartureRequest: NextDepartureRequest
): DepartureRD {
  return departures
    .filter(
      (departure) =>
        nextDepartureRequest.lineNumbers.length == 0 ||
        nextDepartureRequest.lineNumbers.indexOf(
          departure.LineNumber.toLowerCase()
        ) > -1
    )
    .filter(
      (departure) =>
        departure.JourneyDirection === nextDepartureRequest.journeyDirection
    )
    .sort(
      (departure1, departure2) =>
        new Date(departure1.ExpectedDateTime).getTime() -
        new Date(departure2.ExpectedDateTime).getTime()
    )
    .find(
      (departure) =>
        calculateMinutesLeft(departure.ExpectedDateTime) >=
        nextDepartureRequest.skipMinutes
    );
}

function formatDepartureResponse(
  nextDeparture: DepartureRD,
  displayLineNumber: boolean
): string[] {
  if (nextDeparture) {
    const departureTime = [
      `${calculateMinutesLeft(nextDeparture.ExpectedDateTime)} min`,
    ];
    if (displayLineNumber) {
      return [
        `${nextDeparture.LineNumber}`,
        `${departureTime}`,
        `${nextDeparture.LineNumber}`,
        `${departureTime}`,
        `${nextDeparture.LineNumber}`,
        `${departureTime}`,
      ];
    }
    return departureTime;
  } else {
    return NO_DEPARTURES;
  }
}

function calculateMinutesLeft(expectedDepartureTime): number {
  const durationInMs =
    new Date(expectedDepartureTime).getTime() - new Date().getTime();
  return Math.floor(durationInMs / 1000 / 60);
}
