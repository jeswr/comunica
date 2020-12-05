import { ActorRdfCombineQuads, IActionRdfCombineQuads, IActorRdfCombineQuadsOutput, IQuadStreamUpdate } from '@comunica/bus-rdf-combine-quads'
import type { QuadStream } from '@comunica/bus-query-operation';
import { Actor, IAction, IActorArgs, IActorOutput, IActorTest, MediatedActor } from '@comunica/core';
import { IMediatorTypeIterations } from '@comunica/mediatortype-iterations';

/**
 * A comunica actor for rdf-join-quads events.
 * This is a convenience bus that delegeates all operations
 * to rdf-combine-quads.
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
  // TODO: See if this is necessary
  mediatorRdfCombineQuads: MediatedActor<IActionRdfCombineQuads, IAction, IActorRdfCombineQuadsOutput>
  public constructor(args: IActorArgs<IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput>) {
    super(args);
  }
  
  /**
   * Converts the IRdfJoinQuads action into an
   * IRdCombineQuads action
   * @param action 
   */
  private toCombineInput(action: IActionRdfJoinQuads): IActionRdfCombineQuads {
    let quadStreamUpdates: IQuadStreamUpdate[] = []
    for (const quadStream of action.quadStreams) {
      if (quadStream) {
        quadStreamUpdates.push({ type : 'insert', quadStream })
      }
    }
    return {
      trackChanges: false,
      maintainOrder: false,
      avoidDuplicates: true,
      quadStreamUpdates
    }
  }
  
  /**
   * Default test function for join actors.
   */
  public test(action: IActionRdfJoinQuads): Promise<IMediatorTypeIterations> {
    // TODO: CHECK if it is it ok to use prototype here or should I
    // be accessing it in some other way (ie through combine quads mediator)
    return ActorRdfCombineQuads.prototype.test(this.toCombineInput(action));
  }

  /**
   * 
   */
  public async run(action: IActionRdfJoinQuads): Promise<IActorRdfJoinQuadsOutput> {
    return ActorRdfCombineQuads.prototype.run(this.toCombineInput(action))
  }
}

export interface IActionRdfJoinQuads extends IAction {
  /**
   * A list of quad streams to be joined
   */
  quadStreams: (QuadStream | undefined)[]
}

// TODO: Make it so that the output is undefined if the is an empty
// stream
export interface IActorRdfJoinQuadsOutput extends IActorOutput {
  /**
   * The resultant stream of joined Quads
   */
  quads?: QuadStream;
}
