import HTTP_STATUS from 'http-status-codes';
import { Response } from 'express';

export interface APIResponse {
  status: string;
  statusCode: number;
  message: string;
  data?: any;
}

export const CreatedResponse = (res: Response, message: string, data?: any): Response => {
  const response: APIResponse = {
    statusCode: HTTP_STATUS.CREATED,
    status: 'success',
    message,
    data: data ? data : undefined
  };
  return res.status(HTTP_STATUS.CREATED).json(response);
};

export const OKResponse = (res: Response, message: string, data?: any): Response => {
  const response: APIResponse = {
    statusCode: HTTP_STATUS.OK,
    status: 'success',
    message,
    data: data ? data : undefined
  };
  return res.status(HTTP_STATUS.OK).json(response);
};
