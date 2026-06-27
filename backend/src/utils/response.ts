import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  message: string,
  data: any = null,
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    data
  });
};
