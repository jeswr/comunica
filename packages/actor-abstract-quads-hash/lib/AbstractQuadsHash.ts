import { ActorAbstract, IActionAbstract, IActorAbstractOutput } from '@comunica/bus-abstract';
import { IActorArgs, IActorTest } from '@comunica/core';
import * as RDF from 'rdf-js';
import { AbstractFilterHash } from './AbstractFilterHash';

/**
 * A comunica Quads Hash Abstract Actor.
 */
export abstract class ActorAbstractQuadsHash extends ActorAbstract {
  public readonly hashAlgorithm: string;
  public readonly digestAlgorithm: string;
  public constructor(args: IActorArgs<IActionAbstract, IActorTest, IActorAbstractOutput>) {
    super(args);
    if (!AbstractFilterHash.doesHashAlgorithmExist(this.hashAlgorithm)) {
      throw new Error(`The given hash algorithm is not present in this version of Node: ${this.hashAlgorithm}`);
    }
    if (!AbstractFilterHash.doesDigestAlgorithmExist(this.digestAlgorithm)) {
      throw new Error(`The given digest algorithm is not present in this version of Node: ${this.digestAlgorithm}`);
    }
  }

  /**
    * Create a new filter function for the given hash algorithm and digest algorithm.
    * The given filter depends on the Algebraic operation
    * @param {string} hashAlgorithm A hash algorithm.
    * @param {string} digestAlgorithm A digest algorithm.
    * @return {(quads: RDF.Quad) => boolean} A distinct filter for bindings.
    */
  public newHashFilter(hashAlgorithm: string, digestAlgorithm: string): HashFilterGenerator {
    return new (class {
      constructor() {};
      private readonly hashes: {[id: string]: boolean} = {};
      
      add(quad: RDF.Quad): void {
        this.hashes[AbstractFilterHash.hash(hashAlgorithm, digestAlgorithm, quad)] = true;
      }

      // TODO: Optimise by updateing the filter function to just return true once
      // the hashes object is empty
      filter(): (quad: RDF.Quad) => boolean {
        return (quad: RDF.Quad): boolean => {
          const hash = AbstractFilterHash.hash(hashAlgorithm, digestAlgorithm, quad);
          // TODO: SEE IF SECOND EXPRESSION NEEDS BRACETS
          return (hash in this.hashes) && delete this.hashes[hash];
        };
      }})
    }
  }

  public async runOperation(pattern: T, context: ActionContext): Promise<IActorQueryOperationOutputBindings> {
    const output: IActorQueryOperationOutputBindings = ActorQueryOperation.getSafeBindings(
      await this.mediatorQueryOperation.mediate({ operation: pattern.input, context }),
    );
    const bindingsStream: BindingsStream = output.bindingsStream.filter(
      this.newHashFilter(this.hashAlgorithm, this.digestAlgorithm),
    );
    return { type: 'bindings', bindingsStream, metadata: output.metadata, variables: output.variables };
  }
}

interface HashFilterGenerator {

}