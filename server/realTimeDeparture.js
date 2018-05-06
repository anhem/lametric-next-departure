import moment from 'moment';
import 'moment-timezone';
import cache from 'memory-cache';
import laMetric from "./laMetric";
import restClient from "./restClient";

const REAL_TIME_DEPARTURES_V4_KEY = process.env.REAL_TIME_DEPARTURES_V4_KEY;
const BASE_URL = 'http://api.sl.se/api2/realtimedeparturesV4.json?key=' + REAL_TIME_DEPARTURES_V4_KEY;
const TIME_WINDOW = 60;
const TEN_MINUTES = 600000;

const RealTimeDeparture = {};

RealTimeDeparture.execute = (query) => {
    return new Promise((resolve, reject) => {
        const cachedJson = cache.get(query.getCacheKey());
        if (cachedJson !== null) {
            console.log('Found cached response for key: ' + query.getCacheKey());
            resolve(parseResponse(cachedJson, query.transportMode, query.journeyDirection, query.skipMinutes));
        } else {
            restClient.get(createRequest(query.siteId))
                .then(json => {
                    cache.put(query.getCacheKey(), json, TEN_MINUTES);
                    resolve(parseResponse(json, query.transportMode, query.journeyDirection, query.skipMinutes));
                }, error => {
                    reject(laMetric.createError('Error: ' + JSON.stringify(error), query.transportMode));
                });
        }
    })
};

const parseResponse = (json, transportMode, journeyDirection, skipMinutes) => {
    try {
        const transportModeResponseData = getTransportModeResponseData(json.ResponseData, transportMode);
        const nextDeparture = findNextDeparture(transportModeResponseData, journeyDirection, skipMinutes);
        const minutesLeft = calculateMinutesLeft(nextDeparture.ExpectedDateTime);

        return laMetric.createResponse(minutesLeft, transportMode);
    } catch (e) {
        console.log(e);
        return laMetric.createError('Error: Failed to parse response', transportMode);
    }
};

const createRequest = (siteId) => {
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