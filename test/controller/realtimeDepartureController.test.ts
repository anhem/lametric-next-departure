import * as departures from "../data/transportsSiteDepartures.json";
import {
  ERROR,
  getNextDeparture,
  INVALID_REQUEST,
} from "../../src/controller/realtimeDepartureController";
import { TRAIN_ICON, WARNING_ICON } from "../../src/service/laMetricService";
import { TransportMode } from "../../src/model/TransportMode";

describe("realtimeDeparturesController", () => {
  const query = {
    "site-id": 1080,
    "transport-mode": TransportMode.train,
    "journey-direction": 1,
  };

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.useFakeTimers().setSystemTime(new Date("2024-10-02T18:37:00"));
  });

  test("getNextDeparture responds with invalid request when request is empty", async () => {
    const req = {
      query: {},
    };
    const res = {
      json: jest.fn(),
    };

    await getNextDeparture(req, res);

    expect(res.json).toHaveBeenCalledWith({
      frames: [{ icon: WARNING_ICON, index: 0, text: INVALID_REQUEST }],
    });
  });

  test("getNextDeparture responds with required request values", async () => {
    fetchMock.mockResponse(JSON.stringify(departures));
    const req = {
      query: query,
    };
    const res = {
      json: jest.fn(),
    };

    await getNextDeparture(req, res);

    expect(res.json).toHaveBeenCalledWith({
      frames: [{ icon: TRAIN_ICON, index: 0, text: "0 min" }],
    });
  });

  test("getNextDeparture responds with Error when unable to fetch departure data", async () => {
    fetchMock.mockRejectedValue("");
    const req = {
      query: { ...query, "site-id": 10801080 },
    };
    const res = {
      json: jest.fn(),
    };

    await getNextDeparture(req, res);

    expect(res.json).toHaveBeenCalledWith({
      frames: [{ icon: TRAIN_ICON, index: 0, text: ERROR }],
    });
  });
});
