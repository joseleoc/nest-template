import { faker } from '@faker-js/faker/.';

export class MockMongooseModel {
  static create = (data: any, error = false): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (error === true) reject(new Error('Custom error'));
      const resData = { _id: faker.string.uuid(), ...data };
      const res = {
        ...resData,
        toObject: () => ({ ...resData }),
        toJSON: () => ({ ...resData }),
      };
      resolve(res);
    });
  };

  static findById = (data: any) => Promise.resolve(data);
}
