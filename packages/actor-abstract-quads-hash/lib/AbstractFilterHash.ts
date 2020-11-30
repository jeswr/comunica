import { createHash, getHashes, Hash } from 'crypto';
import * as RDF from 'rdf-js';
import { quadToStringQuad } from 'rdf-string';

/**
 * A comunica Quads Hash Abstract Actor.
 */
export abstract class AbstractFilterHash {
  public readonly hashAlgorithm: string;
  public readonly digestAlgorithm: string;
  // TODO: WORK OUT TYPE
  // @ts-ignore
  public constructor(args) {
    super(args);
    if (!AbstractFilterHash.doesHashAlgorithmExist(this.hashAlgorithm)) {
      throw new Error(`The given hash algorithm is not present in this version of Node: ${this.hashAlgorithm}`);
    }
    if (!AbstractFilterHash.doesDigestAlgorithmExist(this.digestAlgorithm)) {
      throw new Error(`The given digest algorithm is not present in this version of Node: ${this.digestAlgorithm}`);
    }
  }

  /**
   * Check if the given hash algorithm (such as sha1) exists.
   * @param {string} hashAlgorithm A hash algorithm.
   * @return {boolean} If it exists.
   */
  public static doesHashAlgorithmExist(hashAlgorithm: string): boolean {
    return getHashes().includes(hashAlgorithm);
  }

  /**
   * Check if the given digest (such as base64) algorithm exists.
   * @param {string} digestAlgorithm A digest algorithm.
   * @return {boolean} If it exists.
   */
  public static doesDigestAlgorithmExist(digestAlgorithm: string): boolean {
    return [ 'latin1', 'hex', 'base64' ].includes(digestAlgorithm);
  }

  /**
   * Create a string-based hash of the given object.
   * @param {string} hashAlgorithm A hash algorithm.
   * @param {string} digestAlgorithm A digest algorithm.
   * @param quad The quad to hash.
   * @return {string} The object's hash.
   */
  public static hash(hashAlgorithm: string, digestAlgorithm: string, quad: RDF.Quad): string {
    const hash: Hash = createHash(hashAlgorithm);
    hash.update(require('canonicalize')(quadToStringQuad(quad)));
    return hash.digest(<any>digestAlgorithm);
  }
  // TODO: CHECK IF WE NEED A RUN OPERATION LIKE
  // public abstract async runOperation(pattern: T, context: ActionContext):
  // Promise<IActorQueryOperationOutputBindings>;
}
