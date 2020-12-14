import { QuadStream } from '@comunica/bus-query-operation';
import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';

/**
 * A comunica actor for rdf-join-quads events.
 * 
 * Actor types:
 * * Input:  IActionRdfJoinQuads:      A list of Quadstreams to Join
 * * Test:   <none>
 * * Output: IActorRdfJoinQuadsOutput: The resultant stream of joined quads
 *
 * @see IActionRdfJoinQuads
 * @see IActorRdfJoinQuadsOutput
 */
export abstract class ActorRdfJoinQuads extends Actor<IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput> {
  public constructor(args: IActorArgs<IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput>) {
    super(args);
  }

  /**
   * Test function for join quads actors.
   */
  public abstract test(action: IActionRdfJoinQuads): Promise<IActorTest>;

  /**
   * Run function for join quads actors.
   */
  public abstract run(action: IActionRdfJoinQuads): Promise<IActorRdfJoinQuadsOutput>;
}

export interface IActionRdfJoinQuads extends IAction {
  /**
   * A list of quad streams to be joined
   */
  quadStreams: (QuadStream | undefined)[]
}

export interface IActorRdfJoinQuadsOutput extends IActorOutput {
  /**
   * The resultant stream of joined Quads
   */
  quads?: QuadStream;
}
