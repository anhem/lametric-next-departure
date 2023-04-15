import { TransportMode } from "../model/TransportMode";

export const TRAIN_ICON = "a1395";
const BUS_ICON = "a1309";
const METRO_ICON = "a16095";
const TRAM_ICON = "a11305";
const SHIP_ICON = "a16309";
export const WARNING_ICON = "17911";

export function createResponse(message, transportMode) {
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
  console.log(`Response: ${JSON.stringify(response)}`);
  return response;
}

export function createError(errorMessage, transportMode) {
  const response = {
    frames: [
      {
        text: errorMessage,
        icon: getIcon(transportMode),
        index: 0,
      },
    ],
  };
  console.log(`Error: ${JSON.stringify(response)}`);
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
