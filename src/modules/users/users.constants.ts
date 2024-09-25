// export const SwaggerCreateUser: ApiOperationOptions = {
//   summary: 'Create user',
//   requestBody: {
//     required: true,
//     content: {
//       'aplication/json': {
//         schema: {
//           type: 'object',
//           properties: {
//             userName: { type: 'string' },
//             password: { type: 'string' },
//             tier: { type: 'string' },
//           },
//         },
//         example: {
//           userName: 'john',
//           password: 'changeme',
//           tier: 'FREE',
//         },
//       },
//     },
//   },
// };

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
