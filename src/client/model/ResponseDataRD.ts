import { DepartureRD } from "./DepartureRD";

export interface ResponseDataRD {
  LatestUpdate: Date;
  DataAge: number;
  Buses: DepartureRD[];
  Metros: DepartureRD[];
  Trains: DepartureRD[];
  Trams: DepartureRD[];
  Ships: DepartureRD[];
}
