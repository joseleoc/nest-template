export const SwaggerCreateUser = {
  summary: 'Create user',
  requestBody: {
    required: true,
    content: {
      'aplication/json': {
        schema: {
          type: 'object',
          properties: {
            userName: { type: 'string' },
            password: { type: 'string' },
          },
        },
      },
    },
  },
};

export const SwaggerCreateUserResponse = {
  status: 200,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { userId: { type: 'string' } },
      },
    },
  },
};
