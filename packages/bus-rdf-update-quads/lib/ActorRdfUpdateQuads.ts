import type { QuadStream } from '@comunica/bus-query-operation';
import type { ActionContext, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';
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
  public constructor(args: IActorArgs<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>) {
    super(args);
  }
  /**
   * 
   */
  test
  /**
   * 
   */

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
  triples?: boolean;
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
