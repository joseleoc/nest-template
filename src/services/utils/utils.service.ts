import { Injectable } from '@nestjs/common';

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
}
