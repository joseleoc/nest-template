export const JwtStrategyMock = {
  validate: jest.fn().mockImplementation(() => true),
};

export const LocalStrategyMock = {
  validate: jest.fn().mockImplementation(() => true),
};

export const AuthServiceMock = {
  login: jest.fn().mockImplementation(() => ({
    access_token: 'token',
  })),
  validateUser: jest.fn().mockImplementation(() => true),
};
