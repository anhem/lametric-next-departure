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
    jest.useFakeTimers().setSystemTime(new Date("2024-10-02T18:37:00"));
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
    jest.useFakeTimers().setSystemTime(new Date("2024-11-02T00:00:00"));
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
});
