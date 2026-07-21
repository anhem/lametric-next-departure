## Next Departure

LaMetric app that displays departure information for stops and stations within Stockholms Lokaltrafik.

Demo: https://www.youtube.com/watch?v=-n2hw2vIQRM

### Data source

All information about departures are fetched
from [SL Transport](https://www.trafiklab.se/sv/api/our-apis/sl/transport)

### App configuration

https://apps.lametric.com/apps/next_departure/6200

* site-id = Unique identification number for the stop or station of interest, i.e. 9192 for Slussen. The site-id can be found using this list https://transport.integration.sl.se/v1/sites
* transport-mode = which transportation mode to fetch information for
* journey-direction = Direction of journey, either 1 or 2. The following URL can be used to figure out the direction (replace 9192 with your site-id) https://transport.integration.sl.se/v1/sites/9192/departures
* skip-minutes = Will skip displaying departures within specified time
* line-numbers (optional) = Comma (,) separated list of line numbers that next departure should be displayed for
* display-line-number = Should the line number be displayed or not

### Development

The following is here in case anyone is interested in hosting their own backend and create their own app.

#### Run

use `npm run dev` to start in development mode.

example request once backend is started:

```
http://localhost:3000/api/next?site-id=1080&transport-mode=train&journey-direction=1&skip-minutes=10&display-line-number=true
```

#### Docker

Build with

```
docker build -t next-departure .
```

Run with

```
docker run -d --name next-departure -p 8084:3000 --restart unless-stopped next-departure
```
