import cache from "memory-cache";
import restClient from './restClient';
import RealTimeDeparture from './realTimeDeparture'
import laMetric from "./laMetric";

const RealTimeDeparturecontroller = {};

const TEN_MINUTES = 600000;

RealTimeDeparturecontroller.getNextDeparture = (req, res) => {
    const query = {
        siteId: parseInt(req.query['site-id']),
        transportMode: req.query['transport-mode'],
        journeyDirection: parseInt(req.query['journey-direction']),
        skipMinutes: parseInt(req.query['skip-minutes']),

        isValid: function () {
            return this.siteId && this.transportMode && this.journeyDirection;
        },
        getCacheKey: function () {
            return this.siteId;
        }
    };
    console.log('query: ' + JSON.stringify(query));

    if (!query.isValid()) {
        res.send(laMetric.createError('arguments missing: ' + JSON.stringify(query), query.transportMode));
        return;
    }

    const cachedJson = cache.get(query.getCacheKey());
    if (cachedJson !== null) {
        console.log('Found cached response for key: ' + query.getCacheKey());
        res.send(RealTimeDeparture.parseResponse(cachedJson, query.transportMode, query.journeyDirection, query.skipMinutes))
    } else {
        restClient.get(RealTimeDeparture.createRequest(query.siteId))
            .then(json => {
                cache.put(query.getCacheKey(), json, TEN_MINUTES);
                res.send(RealTimeDeparture.parseResponse(json, query.transportMode, query.journeyDirection, query.skipMinutes))
            }, error => {
                res.send(laMetric.createError('Error: ' + JSON.stringify(error), query.transportMode));
            });
    }
};

export default RealTimeDeparturecontroller