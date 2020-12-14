import type { QuadStream } from '@comunica/bus-query-operation';
import type { IActionRdfCombineQuads, IActorRdfCombineQuadsOutput, IQuadStreamUpdate } from '@comunica/bus-rdf-combine-quads';
import { ActorRdfCombineQuads } from '@comunica/bus-rdf-combine-quads';
import type { IActorArgs, IActorTest } from '@comunica/core';
import { AsyncIterator, ArrayIterator } from 'asynciterator';
import { sha1 } from 'hash.js';
import type * as RDF from 'rdf-js';
import { quadToStringQuad } from 'rdf-string';

/**
 * A comunica Combine quads using hashes, does not maintain history RDF Combine Quads Actor.
 */
export class ActorRdfCombineQuadsHashSingleNoHistory extends ActorRdfCombineQuads {
  public constructor(args: IActorArgs<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>) {
    super(args);
  }

  protected canTrackChanges = false;
  protected canMaintainOrder = true;
  protected canAvoidDuplicates = true;
  protected limitInsertsMin = 0;
  protected limitInsertsMax = Infinity;
  protected limitDeletesMin = 0;
  protected limitDeletesMax = Infinity;

  /**
   * Create a string-based hash of the given object.
   * @param quad The quad to hash
   * @return {string} The object's hash.
   */
  public static hash(quad: RDF.Quad): string {
    return sha1()
      .update(require('canonicalize')(quadToStringQuad(quad)))
      .digest('hex');
  }

  /**
   * Gets the number of 'iterations' over streams required to complete
   * this operation.
   * @param inserts The number of insert operations
   * @param deletes The number of delete operations
   * @param hasBase Whether there is a base quad stream
   */
  public async getIterations(inserts: number, deletes: number): Promise<number> {
    return inserts + deletes;
  }

  public async getOutput(quads: QuadStream, updates: IQuadStreamUpdate[]): Promise<IActorRdfCombineQuadsOutput> {
    const hashes: Record<string, boolean> = {};
    const result: AsyncIterator<RDF.Quad> = new ArrayIterator([ ...updates.reverse(), { quadStream: quads, type: 'insert'} ])
    .transform({
      transform: (item, done, push) => {
        if (item.type === 'insert') {
          item.quadStream.forEach(quad => {
            const hash = ActorRdfCombineQuadsHashSingleNoHistory.hash(quad);
            if (!(hash in hashes)) {
              push(quad);
              hashes[hash] = true;
            };
          })
        } else {
          item.quadStream.forEach(quad => {
            hashes[ActorRdfCombineQuadsHashSingleNoHistory.hash(quad)] = true;
          })
        }
        done();
      }
    })
    return { quads: result };
  }
}
