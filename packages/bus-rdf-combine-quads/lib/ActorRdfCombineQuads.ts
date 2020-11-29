import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';

/**
 * A comunica actor for rdf-combine-quads events including joining and diffing quad streams
 *
 * Actor types:
 * * Input:  IActionRdfCombineQuads:      TODO: fill in.
 * * Test:   <none>
 * * Output: IActorRdfCombineQuadsOutput: TODO: fill in.
 *
 * @see IActionRdfCombineQuads
 * @see IActorRdfCombineQuadsOutput
 */
export abstract class ActorRdfCombineQuads extends Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput> {
  public constructor(args: IActorArgs<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>) {
    super(args);
  }
}

export interface IActionRdfCombineQuads extends IAction {

}

export interface IActorRdfCombineQuadsOutput extends IActorOutput {

}
