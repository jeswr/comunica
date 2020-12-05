import type { QuadStream } from '@comunica/bus-query-operation';
import { ActorRdfCombineQuads, IActorRdfCombineQuadsOutput, IActionRdfCombineQuads, IQuadStreamUpdate } from '@comunica/bus-rdf-combine-quads';
import { IActionRdfJoinQuads, IActorRdfJoinQuadsOutput } from '@comunica/bus-rdf-join-quads';
import type { ActionContext, IAction, IActorArgs, IActorOutput, IActorTest, MediatedActor } from '@comunica/core';
import { Actor } from '@comunica/core';

/**
 * A comunica actor for rdf-update-quads events.
 *
 * Actor types:
 * * Input:  IActionRdfUpdateQuads:      Primary quad stream and streams of quads to be inserted and deleted.
 * * Test:   <none>
 * * Output: IActorRdfUpdateQuadsOutput: Streams of quads that were inserted and deleted.
 *
 * @see IActionRdfUpdateQuads
 * @see IActorRdfUpdateQuadsOutput
 */
export abstract class ActorRdfUpdateQuads extends Actor<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput> {
  mediatorRdfCombineQuads: MediatedActor<IActionRdfCombineQuads, IAction, IActorRdfCombineQuadsOutput>
  public constructor(args: IActorArgs<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>) {
    super(args);
  }

  /**
   * Updates the stream with insertions and deletions and retuns streams of quads
   * that were inserted and quads of streams that were deleted.
   */
  async updateStreams(action: IActionRdfUpdateQuads): Promise<IActionRdfUpdatedQuads> {
    let updates: IQuadStreamUpdate[] = [];
    if (action.quadStreamInserted) {
      updates.push({ type: 'insert', quadStream: action.quadStreamInserted });
    }
    if (action.quadStreamDeleted) {
      updates.push({ type: 'delete', quadStream: action.quadStreamDeleted });
    }
    let result: IActionRdfUpdatedQuads = await this.mediatorRdfCombineQuads.mediate({
      avoidDuplicates: true,
      maintainOrder: true,
      trackChanges: true,
      quads: action.quads,
      quadStreamUpdates: updates,
      context: action.context
    });
    result.context = action.context;
    return result;
  }

  abstract testOperation(updated: IActionRdfUpdatedQuads): IActorRdfUpdateQuadsOutput;

  /**
   * 
   * Note that if the source file is writable and handle all quad formats then the
   * i
   * The delete stream *should not* change
   * The insert stream *may* change if a quad that is not supported by the given format
   * is being inserted.
   * @param updated 
   */
  abstract runOperation(updated: IActionRdfUpdatedQuads): IActorRdfUpdateQuadsOutput;

  // TODO: Work out how to do this properly, atm it is *really* inefficient because it has to
  // recompute the streams each time (probably create bus-rdf-update-quad-streams which contains)
  // what is currently the update streams function
  /**
   *
   */
  async test(action: IActionRdfUpdateQuads) {
    return this.testOperation(await this.updateStreams(action))
  }

  async run(action: IActionRdfUpdateQuads) {
    return this.runOperation(await this.updateStreams(action));
  }
}

export interface IActionRdfUpdatedQuads extends IAction {
  /**
   * The resultant stream of quads after performing the update operation
   */
  quads: QuadStream;
  /**
   * The stream of quads that have been inserted into the main stream
   */
  quadStreamInserted?: QuadStream;
  /**
   * The stream of quads that have been deleted from the main stream
   */
  quadStreamDeleted?: QuadStream;
  /**
   * A convenience constructor for {@link ActionContext} based on a given hash.
   * @param {{[p: string]: any}} hash A hash that maps keys to values.
   * @return {ActionContext} The immutable action context from the hash.
   * @constructor
   */
  context?: ActionContext;
}

export interface IActionRdfUpdateQuads extends IAction {
  /**
   * The stream of quads that are to be updated
   */
  quads: QuadStream;
  /**
   * An optional field indicating if the given quad stream originates from a triple-based serialization,
   * in which everything is serialized in the default graph.
   * If falsy, the quad stream contain actual quads, otherwise they should be interpreted as triples.
   */
  triples?: boolean; // TODO: See if this is needed, we are not using it atm
  /**
   * The stream of quads to be inserted.
   * Undefined if the if no quads are to be inserted.
   */
  quadStreamInserted?: QuadStream;
  /**
   * The stream of quads to be deleted.
   * Undefined if the if no quads are to be deleted.
   */
  quadStreamDeleted?: QuadStream;
  /**
   * A convenience constructor for {@link ActionContext} based on a given hash.
   * @param {{[p: string]: any}} hash A hash that maps keys to values.
   * @return {ActionContext} The immutable action context from the hash.
   * @constructor
  */
  context?: ActionContext;
}

export interface IActorRdfUpdateQuadsOutput extends IActorOutput {
  /**
   * The stream of quads that were inserted.
   * Undefined if the operation did not have to insert anything.
   */
  quadStreamInserted?: QuadStream;
  /**
   * The stream of quads that were deleted.
   * Undefined if the operation did not have to delete anything.
   */
  quadStreamDeleted?: QuadStream;
  /**
   * A convenience constructor for {@link ActionContext} based on a given hash.
   * @param {{[p: string]: any}} hash A hash that maps keys to values.
   * @return {ActionContext} The immutable action context from the hash.
   * @constructor
  */
  context?: ActionContext;
}
