import { TransportModeRD } from "./TransportModeRD";

export interface DepartureRD {
  GroupOfLine: string;
  DisplayTime: string;
  TransportMode: TransportModeRD;
  LineNumber: string;
  Destination: string;
  JourneyDirection: number;
  StopAreaName: string;
  StopAreaNumber: number;
  StopPointNumber: number;
  StopPointDesignation: string;
  TimeTabledDateTime: string;
  ExpectedDateTime: string;
  JourneyNumber: number;
}
