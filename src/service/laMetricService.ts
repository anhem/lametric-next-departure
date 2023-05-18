import { TransportMode } from "../model/TransportMode";
import logger from "../logger";
import { NextDepartureResponse } from "../model/NextDepartureResponse";

export const TRAIN_ICON = "a1395";
const BUS_ICON = "a1309";
const METRO_ICON = "a16095";
const TRAM_ICON = "a11305";
const SHIP_ICON = "a16309";
export const WARNING_ICON = "17911";

export function createResponse(
  message: string[],
  transportMode: TransportMode
): NextDepartureResponse {
  const frames = message.map((value, index) => {
    return {
      text: value,
      icon: getIcon(transportMode),
      index: index,
    };
  });
  const response = {
    frames: frames,
  };
  logger.debug(`Created response ${JSON.stringify(response)}`);
  return response;
}

export function createError(
  errorMessage: string,
  transportMode: TransportMode | undefined
): NextDepartureResponse {
  const response = {
    frames: [
      {
        text: errorMessage,
        icon: getIcon(transportMode),
        index: 0,
      },
    ],
  };
  logger.debug(`Created error response ${JSON.stringify(response)}`);
  return response;
}

function getIcon(transportMode: TransportMode): string {
  switch (transportMode) {
    case TransportMode.bus:
      return BUS_ICON;
    case TransportMode.metro:
      return METRO_ICON;
    case TransportMode.train:
      return TRAIN_ICON;
    case TransportMode.tram:
      return TRAM_ICON;
    case TransportMode.ships:
      return SHIP_ICON;
    default:
      return WARNING_ICON;
  }
}
