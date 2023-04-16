## Next Departure

Backend for LaMetric app **Next Departure** that fetches departure information for stops and stations within Stockholms Lokaltrafik.

### App configuration

https://apps.lametric.com/apps/next_departure/6200

* site-id = Unique identification number for the stop or station of interest, i.e. 9192 for Slussen. Use https://www.trafiklab.se/api/sl-platsuppslag/konsol to get the site-id you need.
* transport-mode = which transportation mode to fetch information for
* journey-direction = Direction of journey, either 1 or 2. Use https://drive.google.com/file/d/1hjcMnPNd_vU7uqEd9utz1DnQcgnyyNsy/view?usp=sharing to figure out the direction you need.
* skip-minutes = Will skip displaying departures within specified time
* line-numbers (optional) = Comma (,) separated list of line numbers that next departure should be displayed for
* display-line-number = Should the line number be displayed or not

### Development

use `LOG_LEVEL=<log level> REAL_TIME_DEPARTURES_V4_KEY=<api key> npm start` to start in development mode

example request once backend is started:
```
http://localhost:3000/api/next?site-id=1080&transport-mode=train&journey-direction=1&skip-minutes=10&display-line-number=true
```

### Docker

Build with
```
docker build -t next-departure .
```
Run with
```
docker run -e REAL_TIME_DEPARTURES_V4_KEY=<key> -d --name next-departure -p 8084:3000 --restart unless-stopped next-departure
```
