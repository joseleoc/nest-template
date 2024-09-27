export const SwaggerCreateUserResponse = {
  status: 200,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    },
  },
};
