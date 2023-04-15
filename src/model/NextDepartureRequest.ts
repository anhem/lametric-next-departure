import { TransportMode } from "./TransportMode";

export interface NextDepartureRequest {
  siteId: number;
  transportMode: TransportMode;
  journeyDirection: number;
  skipMinutes: number;
  lineNumbers: string[];
  displayLineNumber: boolean;
}