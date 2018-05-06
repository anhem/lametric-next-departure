import RealTimeDeparture from './realTimeDeparture'
import laMetric from "./laMetric";

const RealTimeDeparturecontroller = {};

const parseRequest = (req) => {
    return {
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
};

RealTimeDeparturecontroller.getNextDeparture = (req, res) => {
    const query = parseRequest(req);
    console.log('query: ' + JSON.stringify(query));

    if (query.isValid()) {
        RealTimeDeparture.execute(query).then(response => {
            res.send(response);
        });
    } else {
        res.send(laMetric.createError('arguments missing: ' + JSON.stringify(query), query.transportMode));
    }
};

export default RealTimeDeparturecontroller