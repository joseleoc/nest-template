import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

export const CreateUserResponse: ApiResponseOptions = {
  status: HttpStatus.CREATED,
  description:
    'Create user response, if the user has been already created and deleted: updates the "deleted" field to false',
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
