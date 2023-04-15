import fetchMock from "jest-fetch-mock";
import * as departures from "../data/realtimedeparturesV4.json";
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
    fetchMock.enableMocks();
    jest.useFakeTimers().setSystemTime(new Date("2023-04-15T17:09:00"));
    fetchMock.mockResponse(JSON.stringify(departures));
  });

  afterEach(() => {
    fetchMock.resetMocks();
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
    expect(nextDeparture).toEqual(["7 min"]);
  });

  test("findNextDeparture returns departure with displayed line number", async () => {
    const request: NextDepartureRequest = {
      ...nextDepartureRequest,
      displayLineNumber: true,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual([
      "41",
      "0 min",
      "41",
      "0 min",
      "41",
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
      "15 min",
      "40",
      "15 min",
      "40",
      "15 min",
    ]);
  });

  test("findNextDeparture returns departure with changed journeyDirection", async () => {
    const request: NextDepartureRequest = {
      ...nextDepartureRequest,
      journeyDirection: 2,
    };
    const nextDeparture = await findNextDeparture(request);
    expect(nextDeparture).toEqual(["21 min"]);
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
      "10 min",
      "17",
      "10 min",
      "17",
      "10 min",
    ]);
  });

  test("findNextDeparture returns no departure", async () => {
    jest.useFakeTimers().setSystemTime(new Date());
    const nextDeparture = await findNextDeparture(nextDepartureRequest);
    expect(nextDeparture).toEqual(NO_DEPARTURES);
  });
});
