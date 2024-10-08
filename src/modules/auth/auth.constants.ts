/**
 * Request body for login
 * Used for swagger documentation
 */
export const LoginRequestBody = {
  summary: 'Login',
  requestBody: {
    required: true,
    content: {
      'aplication/json': {
        schema: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
      },
    },
  },
};

/**
 * Response body for login
 * Used for swagger documentation
 */
export const LoginResponseBody = {
  status: 200,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { access_token: { type: 'string' } },
      },
    },
  },
};
