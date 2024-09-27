import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

export const CreateUserResponse: ApiResponseOptions = {
  status: HttpStatus.CREATED,
  description: 'Create user response',
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
