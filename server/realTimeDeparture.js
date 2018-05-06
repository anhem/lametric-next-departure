import moment from 'moment';
import 'moment-timezone';
import cache from 'memory-cache';
import laMetric from "./laMetric";
import restClient from "./restClient";

const REAL_TIME_DEPARTURES_V4_KEY = process.env.REAL_TIME_DEPARTURES_V4_KEY;
const BASE_URL = 'http://api.sl.se/api2/realtimedeparturesV4.json?key=' + REAL_TIME_DEPARTURES_V4_KEY;
const TIME_WINDOW = 60;
const TEN_MINUTES = 600000;
const THIRTY_MINUTES = 1800000;
const TZ_STOCKHOLM = 'Europe/Stockholm';
const TIME_FORMAT = 'hh:mm:ss';

const RealTimeDeparture = {};

RealTimeDeparture.execute = (query) => {
    return new Promise((resolve, reject) => {
        const cachedJson = cache.get(query.getCacheKey());
        if (cachedJson !== null) {
            console.log('Found cached response for key: ' + query.getCacheKey());
            findTimeTilNextDeparture(cachedJson, query).then(nextDepartureTime => {
                resolve(laMetric.createResponse(nextDepartureTime, query.transportMode));
            }, error => {
                console.log('Failed to parse cached data. Setting TTL on cached data to ' + TEN_MINUTES + '.', error);
                cache.put(query.getCacheKey(), cachedJson, TEN_MINUTES);
                reject(laMetric.createError(error, query.transportMode));
            });
        } else {
            queryRealTimeDeparturesApi(query).then(response => {
                resolve(laMetric.createResponse(response, query.transportMode));
            }, error => {
                reject(laMetric.createError(error, query.transportMode));
            })
        }
    })
};

function queryRealTimeDeparturesApi(query) {
    return new Promise((resolve, reject) => {
        restClient.get(createRequest(query.siteId))
            .then(json => {
                cache.put(query.getCacheKey(), json, getCacheTime());
                findTimeTilNextDeparture(json, query).then(nextDepartureTime => {
                    resolve(nextDepartureTime);
                }, error => {
                    reject(error);
                })
            }, error => {
                console.log(error);
                reject('Error: Failed to fetch departure data');
            });
    })
}

const findTimeTilNextDeparture = (json, query) => {
    return new Promise((resolve, reject) => {
        try {
            const transportModeResponseData = getTransportModeResponseData(json.ResponseData, query.transportMode);
            const nextDeparture = findNextDeparture(transportModeResponseData, query);
            if (nextDeparture) {
                resolve(calculateMinutesLeft(nextDeparture.ExpectedDateTime));
            } else {
                resolve('?');
            }
        } catch (e) {
            console.log(e);
            reject('Error: Failed to parse response from SL');
        }
    })

};

const createRequest = (siteId) => {
    const request = `&siteid=${siteId}&timewindow=${TIME_WINDOW}&train=true&bus=true&metro=true&tram=true&ships=true`;
    console.log('Request: ' + request);
    return BASE_URL + request;
};

const calculateMinutesLeft = (expectedDepartureTime) => {
    const expectedDeparture = moment.tz(expectedDepartureTime, TZ_STOCKHOLM);
    const now = moment();
    const calc = moment.duration(expectedDeparture.diff(now));
    return calc.minutes();
};

const findNextDeparture = (responseData, query) => {
    console.log(query);
    let departures = responseData;

    if (query.lineNumbers.length > 0) {
        departures = responseData.filter(item => {
            return (query.lineNumbers.indexOf(item.LineNumber.toLowerCase()) > -1)
        });
    }

    return departures.sort((a, b) => {
        return moment(a.ExpectedDateTime) - moment(b.ExpectedDateTime);
    }).find((item) => {
        if (item.JourneyDirection === query.journeyDirection) {
            const minutesLeft = calculateMinutesLeft(item.ExpectedDateTime);
            return minutesLeft >= query.skipMinutes;
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

const getCacheTime = () => {
    const currentTime = moment.tz(moment(), TZ_STOCKHOLM);
    let from = moment.tz(moment('05:00:00', TIME_FORMAT), TZ_STOCKHOLM);
    let to = moment.tz(moment('10:00:00', TIME_FORMAT), TZ_STOCKHOLM);
    if (currentTime.isBetween(from, to)) {
        console.log('10 minutes cache time');
        return TEN_MINUTES;
    }
    console.log('30 minutes cache time');
    return THIRTY_MINUTES;
};

export default RealTimeDeparture