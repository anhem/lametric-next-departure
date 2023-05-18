## Next Departure

LaMetric app that displays departure information for stops and stations within Stockholms Lokaltrafik. 

Demo: https://www.youtube.com/watch?v=-n2hw2vIQRM

### App configuration

https://apps.lametric.com/apps/next_departure/6200

* site-id = Unique identification number for the stop or station of interest, i.e. 9192 for Slussen. Can be found using https://sl.se/ ![site-id](site-id.png)
* transport-mode = which transportation mode to fetch information for
* journey-direction = Direction of journey, either 1 or 2. Use https://drive.google.com/file/d/1hjcMnPNd_vU7uqEd9utz1DnQcgnyyNsy/view?usp=sharing to figure out the direction you need.
* skip-minutes = Will skip displaying departures within specified time
* line-numbers (optional) = Comma (,) separated list of line numbers that next departure should be displayed for
* display-line-number = Should the line number be displayed or not

### Development

The following is here in case anyone is interested in hosting their own backend and create their own app.

#### Run

use `REAL_TIME_DEPARTURES_V4_KEY=<api key> npm run dev` to start in development mode. The api key can be requested from https://www.trafiklab.se/api/trafiklab-apis/sl/departures-4/

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
docker run -e REAL_TIME_DEPARTURES_V4_KEY=<key> -d --name next-departure -p 8084:3000 --restart unless-stopped next-departure
```
