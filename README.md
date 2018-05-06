## Next Departure

Backend for LaMetric app Next-Departure that fetches departure information for stops and stations within Stockholms Lokaltrafik.

### App configuration

https://apps.lametric.com/apps/next-departure/6200

Here is a short explanation of the different configuration options required by the LaMetric app. 
Further explanations of these can be found at https://www.trafiklab.se/node/15754/documentation

* site-id = Unique identification number for the stop or station of interest
* transport-mode = which transportation mode to fetch information for
* journey-direction = Direction of journey, either 1 or 2
* skip-minutes = next departure to skip because it will depart before one can get to the stop or station
* line-numbers (optional) = Comma (,) separated list of line numbers that next departure should be displayed for 

### Development

Set api key by environment variable `REAL_TIME_DEPARTURES_V4_KEY`

use `npm start` to start in development mode

example once backend is started:
```
http://localhost:3000/next?site-id=1080&transport-mode=train&journey-direction=1&skip-minutes=10
```