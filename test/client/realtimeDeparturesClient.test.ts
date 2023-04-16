import * as departures from '../data/realtimedeparturesV4.json';
import {getRealtimeDepartures} from "../../src/client/realtimeDeparturesClient";
import {ResponseRD} from "../../src/client/model/ResponseRD";


describe('realtimeDeparturesClient', () => {

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponse(JSON.stringify(departures));
    });

    test('getRealtimeDepartures returns departures', async () => {
        const response: ResponseRD = await getRealtimeDepartures(1080);

        expect(response.ResponseData.Buses).toHaveLength(52)
        expect(response.ResponseData.Metros).toHaveLength(95)
        expect(response.ResponseData.Trains).toHaveLength(14)
        expect(response.ResponseData.Trams).toHaveLength(10)
        expect(response.ResponseData.Ships).toHaveLength(0)
    });
});