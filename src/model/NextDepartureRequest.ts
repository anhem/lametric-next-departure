import { TransportMode } from "./TransportMode";

export interface NextDepartureRequest {
  siteId: number;
  transportMode: TransportMode;
  journeyDirection: number;
  skipMinutes: number;
  lineNumbers: string[];
  displayLineNumber: boolean;
}

export function toNextDepartureRequest(request): NextDepartureRequest {
  return {
    siteId: parseInt(request.query["site-id"]),
    transportMode: TransportMode[request.query["transport-mode"]],
    journeyDirection: parseInt(request.query["journey-direction"]),
    skipMinutes: parseInt(request.query["skip-minutes"]) || 0,
    lineNumbers: request.query["line-numbers"]
      ? request.query["line-numbers"]
          .toLowerCase()
          .split(",")
          .map((lineNumber) => lineNumber.trim())
      : [],
    displayLineNumber: request.query["display-line-number"]
      ? request.query["display-line-number"] === "true"
      : false,
  };
}

export function isValid(nextDepartureRequest: NextDepartureRequest) {
  return (
    nextDepartureRequest.siteId &&
    nextDepartureRequest.transportMode &&
    nextDepartureRequest.journeyDirection
  );
}
