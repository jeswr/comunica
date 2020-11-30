import type { QuadStream } from '@comunica/bus-query-operation';
import type { IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';
import { Actor } from '@comunica/core';
import type { IMediatorTypeIterations } from '@comunica/mediatortype-iterations';
import { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';

/**
 * A quad stream and annotation of whether it is to be
 * used to insert or delete Quads
 */
interface IQuadStreamUpdate {
  /**
   * Whether the quads are to be inserted into
   * or deleted from the main stream
   */
  type: 'insert' | 'delete';
  /**
   * Stream of Quads
   */
  quadStream: QuadStream;
}

/**
 * A comunica actor for rdf-combine-quads events including joining and diffing quad streams
 *
 * Actor types:
 * * Input:  IActionRdfCombineQuads:      The streams to be inserted/deleted and (optionally) a base stream
 * * Test:   <none>
 * * Output: IActorRdfCombineQuadsOutput: The resultant quad stream of the combine operation and (optionally)
 *                                        the insertions/deletions with respect to the base stream
 *
 * @see IActionRdfCombineQuads
 * @see IActorRdfCombineQuadsOutput
 */
export abstract class ActorRdfCombineQuads
  extends Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput> {
  public constructor(args: IActorArgs<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>) {
    super(args);
  }

  /**
   * If this actor can track and return changes
   * with respect to a primary stream
   */
  protected canTrackChanges: boolean;
  /**
   * If this actor can ensure that the order in
   * which insertions and deletions are applied
   * will be respected
   */
  protected canMaintainOrder: boolean;
  /**
   * If this actor ensures that insertions will
   * not cause duplicate
   */
  protected canAvoidDuplicates: boolean;
  /**
   * The max/min number of insertion/deletion
   * streams that an actor can handle.
   *
   * Note that the quads parameter - if defined
   * is considered an insert stream
   */
  protected limitInsertsMin = 0;
  protected limitInsertsMax = Infinity;
  protected limitDeletesMin = 0;
  protected limitDeletesMax = Infinity;

  /**
   * Counts the number of streams that insert quads and the number of streams that delete
   * quads. Note that base stream is counted as an *insertion* stream.
   */
  private counters(action: IActionRdfCombineQuads): { inserts: number; deletes: number } {
    let inserts = action.quads ? 1 : 0;
    let deletes = 0;
    for (const { type } of action.quadStreamUpdates) {
      if (type === 'insert') {
        inserts++;
      } else if (type === 'delete') {
        deletes++;
      }
    }
    return { inserts, deletes };
  }

  /**
   * Returns default input for 0 input entries, or 1 input entry with no deletions.
   * Calls the getOutput function otherwise
   * @param {IActionRdfCombineQuads} action
   * @returns {Promise<IActorRdfCombineQuadsOutput>}
   */
  public async run(action: IActionRdfCombineQuads): Promise<IActorRdfCombineQuadsOutput> {
    const { inserts, deletes } = this.counters(action);
    if (inserts === 0) {
      return { quads: new AsyncIterator<RDF.Quad>() };
    }
    if (deletes === 0 && inserts === 1) {
      if (action.quads) {
        return { quads: action.quads };
      }
      const quads: QuadStream = action.quadStreamUpdates.find(stream => stream.type === 'insert')?.quadStream ??
      new AsyncIterator<RDF.Quad>();
      // This ^^ is not strictly necessary since inserts === 1 - just here for type safety.
      return {
        quads,
        quadStreamInserted: quads,
      };
    }
    return this.getOutput(action.quads ?? new AsyncIterator<RDF.Quad>(), action.quadStreamUpdates);
  }

  /**
   * Returns the result of combining quad streams
   */
  protected abstract getOutput(quads: QuadStream, quadStreamUpdates: IQuadStreamUpdate[]):
  Promise<IActorRdfCombineQuadsOutput>;

  /**
   *
   * @param inserts The number of streams to be inserted
   * @param deletes The number of streams use for deletion
   * @param hasBase True if there is a base stream to compare to
   */
  abstract async getIterations(inserts: number, deletes: number, hasBase?: boolean): Promise<number>;

  /**
   * Default test function for combine actors.
   */
  public async test(action: IActionRdfCombineQuads): Promise<IMediatorTypeIterations> {
    const { inserts, deletes } = this.counters(action);
    /**
     * If there are no insertions we can just return an empty
     * stream - if there are no deletions and only one insertion
     * stream we can just return the insertion stream.
     */
    if (inserts === 0 || (deletes === 0 && inserts === 1)) {
      return { iterations: 0 };
    }
    if (inserts < this.limitInsertsMin) {
      throw new Error(`${this.name} requires at least ${this.limitInsertsMin} insert operations`);
    }
    if (inserts > this.limitInsertsMax) {
      throw new Error(`${this.name} handles at most ${this.limitInsertsMax} insert operations`);
    }
    if (deletes < this.limitDeletesMin) {
      throw new Error(`${this.name} requires at least ${this.limitDeletesMin} delete operations`);
    }
    if (deletes > this.limitDeletesMax) {
      throw new Error(`${this.name} handles at most ${this.limitDeletesMax} delete operations`);
    }
    if ((action.trackChanges ?? true) && !this.canTrackChanges) {
      throw new Error(`${this.name} cannot track changes`);
    }
    // Order doesn't matter if we only have insertions or only have deletions
    if (inserts > 0 && deletes > 0 && (action.maintainOrder ?? true) && !this.canMaintainOrder) {
      throw new Error(`${this.name} cannot maintain order of insertions/deletions`);
    }
    // Duplicates are only an issue if we have 1 or more insertion streams
    if (inserts > 1 && (action.avoidDuplicates ?? true) && !this.canAvoidDuplicates) {
      throw new Error(`${this.name} cannot avoid duplicates`);
    }
    return { iterations: await this.getIterations(inserts, deletes, Boolean(action.quads)) };
  }
}

export interface IActionRdfCombineQuads extends IAction {
  /**
   * Return changes with respect to a primary stream
   * Default: true
   */
  trackChanges?: boolean;
  /**
   * Ensure that having multiple insertion streams will
   * not cause duplication of quads
   * Default: true
   */
  maintainOrder?: boolean;
  /**
   * If this actor can ensure that the order in
   * which insertions and deletions are applied
   * is respected
   * Default: true
   */
  avoidDuplicates?: boolean;
  /**
   * Base quad stream (if applicable)
   */
  quads?: QuadStream;
  /**
   * Updates to apply to the base quad stream
   * or new stream if no base stream is supplied
   */
  quadStreamUpdates: IQuadStreamUpdate[];
}

export interface IActorRdfCombineQuadsOutput extends IActorOutput {
  /**
   * The resultant quad stream of the combine operation
   */
  quads: QuadStream;
  /**
   * The quads inserted with respect to the primary stream
   * (if applicable)
   */
  quadStreamInserted?: QuadStream;
  /**
   * The quads deleted with respect to the primary stream
   * (if applicable)
   */
  quadStreamDeleted?: QuadStream;
}
