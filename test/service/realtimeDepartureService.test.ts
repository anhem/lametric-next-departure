import * as departures from "../data/transportsSiteDepartures.json";
import {
  findNextDeparture,
  NO_DEPARTURES,
} from "../../src/service/realtimeDepartureService";
import { NextDepartureRequest } from "../../src/model/NextDepartureRequest";
import { TransportMode } from "../../src/model/TransportMode";

describe("realtimeDeparturesService", () => {
  const nextDepartureRequest: NextDepartureRequest = {
    siteId: 1080,
    transportMode: TransportMode.train,
    journeyDirection: 1,
    skipMinutes: 0,
    lineNumbers: [],
    displayLineNumber: false,
  };

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify(departures));
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate'] })
      .setSystemTime(new Date("2024-10-02T18:37:00"));
  });

  test("findNextDeparture returns departure", async () => {
    const nextDeparture = await findNextDeparture(nextDepartureRequest);
    expect(nextDeparture).toEqual(["0 min"]);
  });

  test("findNextDeparture returns departure with skipMinutes set", async () => {
    const request: NextDepartureRequest = {
      ...nextDepartureRequest,
      skipMinutes: 5,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual(["9 min"]);
  });

  test("findNextDeparture returns departure with displayed line number", async () => {
    const request: NextDepartureRequest = {
      ...nextDepartureRequest,
      displayLineNumber: true,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual([
      "43",
      "0 min",
      "43",
      "0 min",
      "43",
      "0 min",
    ]);
  });

  test("findNextDeparture returns departure with selected line number", async () => {
    const request: NextDepartureRequest = {
      ...nextDepartureRequest,
      lineNumbers: ["40"],
      displayLineNumber: true,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual([
      "40",
      "17 min",
      "40",
      "17 min",
      "40",
      "17 min",
    ]);
  });

  test("findNextDeparture returns departure with changed journeyDirection", async () => {
    const request: NextDepartureRequest = {
      ...nextDepartureRequest,
      journeyDirection: 2,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual(["2 min"]);
  });

  test("findNextDeparture returns departure with completely different request", async () => {
    const request: NextDepartureRequest = {
      siteId: 1080,
      transportMode: TransportMode.metro,
      journeyDirection: 2,
      skipMinutes: 10,
      lineNumbers: ["17"],
      displayLineNumber: true,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual([
      "17",
      "11 min",
      "17",
      "11 min",
      "17",
      "11 min",
    ]);
  });

  test("findNextDeparture returns no departure", async () => {
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate'] })
      .setSystemTime(new Date("2024-11-02T00:00:00"));
    const nextDeparture = await findNextDeparture(nextDepartureRequest);
    expect(nextDeparture).toEqual(NO_DEPARTURES);
  });

  test("findNextDeparture deduplicates simultaneous requests for the same siteId", async () => {
    const request1: NextDepartureRequest = { ...nextDepartureRequest, siteId: 9991 };
    const request2: NextDepartureRequest = { ...nextDepartureRequest, siteId: 9991 };

    const [result1, result2] = await Promise.all([
      findNextDeparture(request1),
      findNextDeparture(request2),
    ]);

    expect(result1).toEqual(["0 min"]);
    expect(result2).toEqual(["0 min"]);

    const fetchCallsForSite = fetchMock.mock.calls.filter(call => (call[0] as string).includes("sites/9991"));
    expect(fetchCallsForSite.length).toBe(1);
  });

  test("findNextDeparture does not deduplicate simultaneous requests for different siteIds", async () => {
    const request1: NextDepartureRequest = { ...nextDepartureRequest, siteId: 9992 };
    const request2: NextDepartureRequest = { ...nextDepartureRequest, siteId: 9993 };

    const [result1, result2] = await Promise.all([
      findNextDeparture(request1),
      findNextDeparture(request2),
    ]);

    expect(result1).toEqual(["0 min"]);
    expect(result2).toEqual(["0 min"]);

    const fetchCallsForSite2 = fetchMock.mock.calls.filter(call => (call[0] as string).includes("sites/9992"));
    const fetchCallsForSite3 = fetchMock.mock.calls.filter(call => (call[0] as string).includes("sites/9993"));
    expect(fetchCallsForSite2.length).toBe(1);
    expect(fetchCallsForSite3.length).toBe(1);
  });

  test("findNextDeparture serves stale cache data when API fails", async () => {
    const staleRequest = { ...nextDepartureRequest, siteId: 8888 };
    
    const initialDeparture = await findNextDeparture(staleRequest);
    expect(initialDeparture).toEqual(["0 min"]);

    jest.advanceTimersByTime(15 * 60 * 1000);

    fetchMock.mockRejectOnce(new Error("Quota Exceeded"));
    
    const staleDeparture = await findNextDeparture(staleRequest);
    expect(staleDeparture).toEqual(["2 min"]);
  });

  test("findNextDeparture avoids retry storm by temporarily caching stale data on API failure", async () => {
    const staleRequest = { ...nextDepartureRequest, siteId: 7777 };

    const initialDeparture = await findNextDeparture(staleRequest);
    expect(initialDeparture).toEqual(["0 min"]);

    jest.advanceTimersByTime(15 * 60 * 1000);

    fetchMock.mockRejectOnce(new Error("Quota Exceeded"));

    const staleDeparture = await findNextDeparture(staleRequest);
    expect(staleDeparture).toEqual(["2 min"]);

    // Subsequent request within 2 minutes should be served from cache without an extra fetch
    const cachedStaleDeparture = await findNextDeparture(staleRequest);
    expect(cachedStaleDeparture).toEqual(["2 min"]);

    const fetchCallsForSite = fetchMock.mock.calls.filter((call) =>
      (call[0] as string).includes("sites/7777")
    );
    expect(fetchCallsForSite.length).toBe(2);
  });

  test("findNextDeparture throttles cold failure retries without stale data", async () => {
    const coldErrorRequest = { ...nextDepartureRequest, siteId: 6666 };

    fetchMock.mockRejectOnce(new Error("Not Found"));

    // Cold failure returns NO_DEPARTURES (no stale data available)
    const result1 = await findNextDeparture(coldErrorRequest);
    expect(result1).toEqual(NO_DEPARTURES);

    // Immediate second call should be served from cache (empty departures) without calling fetch again
    const result2 = await findNextDeparture(coldErrorRequest);
    expect(result2).toEqual(NO_DEPARTURES);

    const fetchCallsForSite = fetchMock.mock.calls.filter((call) =>
      (call[0] as string).includes("sites/6666")
    );
    expect(fetchCallsForSite.length).toBe(1);
  });

  test("findNextDeparture rejects requests when queue depth exceeds MAX_QUEUE_DEPTH", async () => {
    jest.useFakeTimers();
    
    const requests = [];

    for (let i = 0; i < 101; i++) {
      const request: NextDepartureRequest = { ...nextDepartureRequest, siteId: 2000 + i };
      requests.push(findNextDeparture(request));
    }

    await expect(Promise.all(requests)).rejects.toThrow("Server Too Busy: outbound queue at maximum capacity");
  });
});
