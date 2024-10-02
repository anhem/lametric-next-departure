export enum DepartureState {
  NOTEXPECTED = "NOTEXPECTED",
  NOTCALLED = "NOTCALLED",
  EXPECTED = "EXPECTED",
  CANCELLED = "CANCELLED",
  INHIBITED = "INHIBITED",
  ATSTOP = "ATSTOP",
  BOARDING = "BOARDING",
  BOARDINGCLOSED = "BOARDINGCLOSED",
  DEPARTED = "DEPARTED",
  PASSED = "PASSED",
  MISSED = "MISSED",
  REPLACED = "REPLACED",
  ASSUMEDDEPARTED = "ASSUMEDDEPARTED",
}

export enum JourneyState {
  NOTEXPECTED = "NOTEXPECTED",
  NOTRUN = "NOTRUN",
  EXPECTED = "EXPECTED",
  ASSIGNED = "ASSIGNED",
  CANCELLED = "CANCELLED",
  SIGNEDON = "SIGNEDON",
  ATORIGIN = "ATORIGIN",
  FASTPROGRESS = "FASTPROGRESS",
  NORMALPROGRESS = "NORMALPROGRESS",
  SLOWPROGRESS = "SLOWPROGRESS",
  NOPROGRESS = "NOPROGRESS",
  OFFROUTE = "OFFROUTE",
  ABORTED = "ABORTED",
  COMPLETED = "COMPLETED",
  ASSUMEDCOMPLETED = "ASSUMEDCOMPLETED",
}

enum PredictionState {
  NORMAL = "NORMAL",
  LOSTCONTACT = "LOSTCONTACT",
  UNRELIABLE = "UNRELIABLE",
}

enum PassengerLevel {
  EMPTY = "EMPTY",
  SEATSAVAILABLE = "SEATSAVAILABLE",
  STANDINGPASSENGERS = "STANDINGPASSENGERS",
  PASSENGERSLEFTBEHIND = "PASSENGERSLEFTBEHIND",
  UNKNOWN = "UNKNOWN"
}

export enum StopAreaType {
  BUSTERM = "BUSTERM",
  METROSTN = "METROSTN",
  TRAMSTN = "TRAMSTN",
  RAILWSTN = "RAILWSTN",
  SHIPBER = "SHIPBER",
  FERRYBER = "FERRYBER",
  AIRPORT = "AIRPORT",
  TAXITERM = "TAXITERM",
  UNKNOWN = "UNKNOWN"
}

export enum TransportMode {
  BUS = "BUS",
  TRAM = "TRAM",
  METRO = "METRO",
  TRAIN = "TRAIN",
  FERRY = "FERRY",
  SHIP = "SHIP",
  TAXI = "TAXI"
}


interface Deviation {
  importance_level: number;
  consequence: string;
  message: string;
}

interface Journey {
  id: number;
  state: JourneyState;
  prediction_state: PredictionState;
  passenger_level: PassengerLevel;
}

interface StopArea {
  id: number;
  name: string;
  type: StopAreaType;
}

interface StopPoint {
  id: number;
  name: string;
  designation: string;
}

interface Line {
  id: number;
  designation: string;
  transport_mode: TransportMode;
}

export interface Departure {
  destination: string;
  direction_code: number;
  direction: string;
  state: DepartureState;
  display: string;
  scheduled: Date;
  expected: Date;
  journey: Journey;
  stop_area: StopArea;
  stop_point: StopPoint;
  line: Line;
  deviations: Deviation[];
}

export interface Departures {
  departures: Departure[];
}
