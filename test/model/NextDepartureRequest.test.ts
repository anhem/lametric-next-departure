import { toNextDepartureRequest } from "../../src/model/NextDepartureRequest";
import { TransportMode } from "../../src/model/TransportMode";

describe("nextDepartureRequest", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("toNextDepartureRequest returns NextDepartureRequest for request with required fields only", () => {
    const request = {
      query: {
        "site-id": 1080,
        "transport-mode": TransportMode.train,
        "journey-direction": 1,
      },
    };

    const nextDepartureRequest = toNextDepartureRequest(request);

    expect(nextDepartureRequest.siteId).toEqual(1080);
    expect(nextDepartureRequest.transportMode).toEqual(TransportMode.train);
    expect(nextDepartureRequest.journeyDirection).toEqual(1);
    expect(nextDepartureRequest.skipMinutes).toEqual(0);
    expect(nextDepartureRequest.lineNumbers).toEqual([]);
    expect(nextDepartureRequest.displayLineNumber).toBeFalsy();
  });

  test("toNextDepartureRequest returns NextDepartureRequest for fully populated request", () => {
    const request = {
      query: {
        "site-id": 1080,
        "transport-mode": TransportMode.train,
        "journey-direction": 1,
        "skip-minutes": 5,
        "line-numbers": "100X, 101,102, 103",
        "display-line-number": "true",
      },
    };

    const nextDepartureRequest = toNextDepartureRequest(request);

    expect(nextDepartureRequest.siteId).toEqual(1080);
    expect(nextDepartureRequest.transportMode).toEqual(TransportMode.train);
    expect(nextDepartureRequest.journeyDirection).toEqual(1);
    expect(nextDepartureRequest.skipMinutes).toEqual(5);
    expect(nextDepartureRequest.lineNumbers).toEqual([
      "100x",
      "101",
      "102",
      "103",
    ]);
    expect(nextDepartureRequest.displayLineNumber).toBeTruthy();
  });
});
