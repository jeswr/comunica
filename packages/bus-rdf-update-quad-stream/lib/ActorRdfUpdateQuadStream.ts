import { QuadStream } from '@comunica/bus-query-operation';
import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';

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
export abstract class ActorRdfUpdateQuadStream extends Actor<IActionRdfUpdateQuadStream, IActorTest, IActorRdfUpdateQuadStreamOutput> {
  public constructor(args: IActorArgs<IActionRdfUpdateQuadStream, IActorTest, IActorRdfUpdateQuadStreamOutput>) {
    super(args);
  }

  /**
   * Test function for update quad stream actors.
   */
  public abstract test(action: IActionRdfUpdateQuadStream): Promise<IActorTest>;

  /**
   * Run function for update quad stream actors.
   */
  public abstract run(action: IActionRdfUpdateQuadStream): Promise<IActorRdfUpdateQuadStreamOutput>;
}

export interface IActionRdfUpdateQuadStream extends IAction {
  /**
   * The stream of quads that are to be updated
   */
  quads: QuadStream;
  /**
   * The stream of quads to be inserted.
   * Undefined if the if no quads are to be inserted.
   */
  quadStreamInsert?: QuadStream;
  /**
   * The stream of quads to be deleted.
   * Undefined if the if no quads are to be deleted.
   */
  quadStreamDelete?: QuadStream;
}

export interface IActorRdfUpdateQuadStreamOutput extends IActorOutput {
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
}
