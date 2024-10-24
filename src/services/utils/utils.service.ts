import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

@Injectable()
export class UtilsService {
  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  /**
   * Recursively executes an array of promises in chunks of a specified size
   * @param promises an array of promises
   * @param chunkSize the maximum number of promises to execute in a single chunkç
   * @param results an optional array to store the results
   * @returns a promise that resolves to an array of results
   */
  async executePromisesInChunksAsync(
    promises: Promise<any>[],
    chunkSize: number,
    results: any[] = [],
  ): Promise<any[]> {
    if (promises.length === 0) {
      return Promise.resolve(results);
    }

    const chunk = promises.slice(0, chunkSize);

    return Promise.allSettled(chunk).then((chunkResults) => {
      results.push(...chunkResults);
      const remainingPromises = promises.slice(chunkSize);
      return this.executePromisesInChunksAsync(
        remainingPromises,
        chunkSize,
        results,
      );
    });
  }

  /**
   * Validates a password against a string literal
   *
   * @param strLiteral - The string literal to compare the password against
   * @param userPassword - The hashed password to compare
   * @returns A promise that resolves to a boolean indicating whether the password is valid or not
   */
  validatePassword({
    strLiteral,
    userPassword,
  }: {
    strLiteral: string;
    userPassword: string;
  }) {
    return new Promise((resolve, reject) => {
      console.log({ strLiteral, userPassword });
      compare(strLiteral, userPassword)
        .then((isValid) => {
          if (isValid) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error) => reject(error));
    });
  }
}
