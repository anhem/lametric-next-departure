import * as departures from "../data/transportsSiteDepartures.json";
import { getRealtimeDepartures } from "../../src/client/realtimeDeparturesClient";
import {
  Departures,
  DepartureState,
  JourneyState,
  StopAreaType,
  TransportMode,
} from "../../src/client/model/Departures";

describe("realtimeDeparturesClient", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("getRealtimeDepartures returns departures", async () => {
    fetchMock.mockResponse(JSON.stringify(departures));

    const response: Departures = await getRealtimeDepartures(1080);

    expect(response.departures).toHaveLength(93);
    const departure = response.departures[0];
    expect(departure.destination).toEqual("Svartbäcken");
    expect(departure.direction_code).toEqual(1);
    expect(departure.direction).toEqual("Svartbäcken");
    expect(departure.state).toEqual(DepartureState.EXPECTED);
    expect(departure.display).toEqual("Nu");
    expect(departure.scheduled).toEqual("2024-10-02T18:35:00");
    expect(departure.expected).toEqual("2024-10-02T18:35:00");
    expect(departure.journey.id).toEqual(2024100200127);
    expect(departure.journey.state).toEqual(JourneyState.EXPECTED);
    expect(departure.stop_area.id).toEqual(80055);
    expect(departure.stop_area.name).toEqual("Vattugatan");
    expect(departure.stop_area.type).toEqual(StopAreaType.BUSTERM);
    expect(departure.stop_point.id).toEqual(80200);
    expect(departure.stop_point.name).toEqual("Vattugatan");
    expect(departure.stop_point.designation).toEqual("I");
    expect(departure.line.id).toEqual(809);
    expect(departure.line.designation).toEqual("809C");
    expect(departure.line.transport_mode).toEqual(TransportMode.BUS);
    expect(departure.deviations).toHaveLength(2);
    expect(departure.deviations[0].importance_level).toEqual(7);
    expect(departure.deviations[0].consequence).toEqual("INFORMATION");
    expect(departure.deviations[0].message).toEqual(
      "Hållplats Vattugatan är tillfälligt flyttad  till Klara södra kyrkogata pga vägarbete."
    );
    expect(departure.deviations[1].importance_level).toEqual(7);
    expect(departure.deviations[1].consequence).toEqual("INFORMATION");
    expect(departure.deviations[1].message).toEqual(
      "Förseningar upp till 8 min pga framkomlighetsproblem."
    );
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
