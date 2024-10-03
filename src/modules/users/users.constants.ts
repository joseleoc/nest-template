import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

export const CreateUserResponse: ApiResponseOptions = {
  status: HttpStatus.CREATED,
  description:
    'Create an user if it does not exist. If the user already exists, it updates the "deleted" field to false',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
          },
        },
      },
    },
  },
};
