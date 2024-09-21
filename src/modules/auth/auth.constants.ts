export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

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
