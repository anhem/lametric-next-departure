import cache from "memory-cache";
import { NextDepartureRequest } from "../model/NextDepartureRequest";
import { getRealtimeDepartures } from "../client/realtimeDeparturesClient";
import logger from "../logger";
import { Departure, Departures } from "../client/model/Departures";
import metrics from "../utils/metrics";

const TWO_MINUTES = 120000;
const TEN_MINUTES = 600000;
const ONE_HOUR = 3600000;
export const NO_DEPARTURES: string[] = ["?"];
const departureCache = new cache.Cache();
const staleCache = new cache.Cache();
const pendingRequests = new Map<number, Promise<Departures>>();
let globalRequestQueue = Promise.resolve();
let queueDepth = 0;
const MAX_QUEUE_DEPTH = 100;
const REQUEST_DELAY_MS = parseInt(process.env.REQUEST_DELAY_MS ?? "500", 10);

export async function findNextDeparture(
  nextDepartureRequest: NextDepartureRequest
) {
  metrics.recordStat("incomingRequests");
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
  metrics.recordSiteRequest(siteId);
  const cachedDepartures: Departures = departureCache.get(siteId);
  if (cachedDepartures !== null) {
    logger.debug(`Found cached response for key ${siteId}`);
    metrics.recordStat("cacheHits");
    return cachedDepartures.departures;
  }

  if (pendingRequests.has(siteId)) {
    logger.debug(`Found pending request for key ${siteId}`);
    metrics.recordStat("cacheHits");
    const departures = await pendingRequests.get(siteId);
    return departures.departures || [];
  }

  if (queueDepth >= MAX_QUEUE_DEPTH) {
    metrics.recordStat("queueRejections");
    logger.warn(`Rejected request for siteId ${siteId}: Server Too Busy. Queue depth: ${queueDepth}`);
    throw new Error("Server Too Busy: outbound queue at maximum capacity");
  }
  queueDepth++;
  const promise = new Promise<Departures>((resolve, reject) => {
    globalRequestQueue = globalRequestQueue
      .then(async () => {
        await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
        metrics.recordStat("apiRequests");
        return getRealtimeDepartures(siteId);
      })
      .then(resolve)
      .catch(reject);
  });
  pendingRequests.set(siteId, promise);

  try {
    const departures: Departures = await promise;
    if (departures && departures.departures) {
      metrics.recordStat("apiSuccesses");
      departureCache.put(siteId, departures, TEN_MINUTES);
      staleCache.put(siteId, departures, ONE_HOUR);
      logger.info(
        `Added ${siteId} to departureCache. Current size ${departureCache.size()}`
      );
      return departures.departures;
    } else {
      metrics.recordStat("apiErrors");
      logger.error(`Invalid API response: ${JSON.stringify(departures)}`);
      const stale = staleCache.get(siteId);
      if (stale) {
        metrics.recordStat("staleCacheHits");
        logger.warn(`Serving stale data for ${siteId} due to invalid response`);
        departureCache.put(siteId, stale, TWO_MINUTES);
        return stale.departures;
      }
      return [];
    }
  } catch (error) {
    metrics.recordStat("apiErrors");
    logger.error(`Fetch failed for ${siteId}: ${(error as Error).message}`);
    const stale = staleCache.get(siteId);
    if (stale) {
      metrics.recordStat("staleCacheHits");
      logger.warn(`Serving stale data for ${siteId} due to fetch error`);
      departureCache.put(siteId, stale, TWO_MINUTES);
      return stale.departures;
    }
    throw error;
  } finally {
    queueDepth--;
    pendingRequests.delete(siteId);
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
