import createHttpError from 'http-errors';
import { HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

type ErrorResponse = {
  code: number;
  error: {
    message: string;
    error: any;
  };
};

function isHttpError(error: any): error is createHttpError.HttpError {
  return error instanceof createHttpError.HttpError;
}

function isAxiosError(error: any): error is AxiosError {
  return error instanceof AxiosError;
}

function extractMessage(error: any): string {
  return error?.message || error?.error?.message || 'Error';
}

export const handleError = (error: unknown): ErrorResponse => {
  console.error(error);
  const message = extractMessage(error as any);
  console.error('Error Message:', message);

  if (isHttpError(error)) {
    return {
      code: error.statusCode,
      error: { message, error: '' },
    };
  }

  if (isAxiosError(error)) {
    return {
      code: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        message,
        error: error.response?.data,
      },
    };
  }

  return {
    code: HttpStatus.INTERNAL_SERVER_ERROR,
    error: { message: 'Internal server error', error: message },
  };
};
