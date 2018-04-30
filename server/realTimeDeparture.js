import moment from 'moment';
import 'moment-timezone';
import laMetric from "./laMetric";

const REAL_TIME_DEPARTURES_V4_KEY = process.env.REAL_TIME_DEPARTURES_V4_KEY;
const BASE_URL = 'http://api.sl.se/api2/realtimedeparturesV4.json?key=' + REAL_TIME_DEPARTURES_V4_KEY;
const TIME_WINDOW = 60;

const RealTimeDeparture = {};

RealTimeDeparture.parseResponse = (json, transportMode, journeyDirection, skipMinutes) => {
    try {
        const transportModeResponseData = getTransportModeResponseData(json.ResponseData, transportMode);
        const nextDeparture = findNextDeparture(transportModeResponseData, journeyDirection, skipMinutes);
        const minutesLeft = calculateMinutesLeft(nextDeparture.ExpectedDateTime);

        return laMetric.createResponse(minutesLeft, transportMode);
    } catch (e) {
        console.log(e);
        return laMetric.createError('Error: Failed to parseResponse response', transportMode);
    }
};

RealTimeDeparture.createRequest = (siteId) => {
    const request = `&siteid=${siteId}&timewindow=${TIME_WINDOW}&train=true&bus=true&metro=true&tram=true&ships=true`;
    console.log('Request: ' + request);
    return BASE_URL + request;
};

const calculateMinutesLeft = (expectedDepartureTime) => {
    const expectedDeparture = moment.tz(expectedDepartureTime, 'Europe/Stockholm');
    const now = moment();
    const calc = moment.duration(expectedDeparture.diff(now));
    return calc.minutes();
};

const findNextDeparture = (responseData, journeyDirection, skipMinutes) => {
    return responseData.sort((a, b) => {
        return moment(a.ExpectedDateTime) - moment(b.ExpectedDateTime);
    }).find((item) => {
        if (item.JourneyDirection === journeyDirection) {
            const minutesLeft = calculateMinutesLeft(item.ExpectedDateTime);
            return minutesLeft >= skipMinutes;
        }
        return false;
    });
};

const getTransportModeResponseData = (responseData, transportMode) => {
    switch (transportMode) {
        case 'train':
            return responseData.Trains || [];
        case 'bus':
            return responseData.Buses || [];
        case 'metro':
            return responseData.Metros || [];
        case 'tram':
            return responseData.Trams || [];
        case 'ships':
            return responseData.Ships || [];
        default:
            return [];
    }
};

export default RealTimeDeparture