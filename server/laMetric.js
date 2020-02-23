const laMetric = {};
const TRAIN_ICON = 'a1395';
const BUS_ICON = 'a1309';
const METRO_ICON = 'a16095';
const TRAM_ICON = 'a11305';
const SHIP_ICON = 'a16309';
const MESSAGE_DURATION = 10000;
const ERROR_MESSAGE_DURATION = 15000;

laMetric.createResponse = (message, transportMode) => {
   const frames = message.map((value, index) => {
        return {
            text: value,
            icon: getIcon(transportMode),
            index: index
        }
    });
    const response = {
        frames: frames
    };
    console.log('Response: ' + JSON.stringify(response));
    return response;
};

laMetric.createError = (errorMessage, transportMode) => {
    const response = {
        frames: [
            {
                text: errorMessage,
                icon: getIcon(transportMode),
                index: 0,
                duration: ERROR_MESSAGE_DURATION
            }
        ]
    };
    console.log('Error: ' + JSON.stringify(response));
    return response;
};

const getIcon = transportMode => {
    switch (transportMode) {
        case 'train':
            return TRAIN_ICON;
        case 'bus':
            return BUS_ICON;
        case 'metro':
            return METRO_ICON;
        case 'tram':
            return TRAM_ICON;
        case 'ships':
            return SHIP_ICON;
        default:
            return TRAIN_ICON;
    }
};

export default laMetric
