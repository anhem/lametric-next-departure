import { ResponseDataRD } from "./ResponseDataRD";

export interface ResponseRD {
  StatusCode: number;
  Message: string;
  ExecutionTime: number;
  ResponseData: ResponseDataRD;
}
