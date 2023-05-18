import * as departures from "../data/realtimedeparturesV4.json";
import { getRealtimeDepartures } from "../../src/client/realtimeDeparturesClient";
import { ResponseRD } from "../../src/client/model/ResponseRD";

describe("realtimeDeparturesClient", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("getRealtimeDepartures returns departures", async () => {
    fetchMock.mockResponse(JSON.stringify(departures));

    const response: ResponseRD = await getRealtimeDepartures(1080);

    expect(response.ResponseData.Buses).toHaveLength(52);
    expect(response.ResponseData.Metros).toHaveLength(95);
    expect(response.ResponseData.Trains).toHaveLength(14);
    expect(response.ResponseData.Trams).toHaveLength(10);
    expect(response.ResponseData.Ships).toHaveLength(0);
  });

  test(`getRealtimeDepartures throws error`, async () => {
    const errorMessage = "some error";
    fetchMock.mockReject(new Error(errorMessage));
    try {
      await getRealtimeDepartures(1080);
    } catch (error) {
      expect(error.message).toBe(
        `Failed to get realtime departures due to ${errorMessage}`
      );
    }
  });
});
