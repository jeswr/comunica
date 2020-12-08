import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';

/**
 * A comunica actor for rdf-write events.
 *
 * Actor types:
 * * Input:  IActionRdfWrite:      TODO: fill in.
 * * Test:   <none>
 * * Output: IActorRdfWriteOutput: TODO: fill in.
 *
 * @see IActionRdfWrite
 * @see IActorRdfWriteOutput
 */
export abstract class ActorRdfWrite extends Actor<IActionRdfWrite, IActorTest, IActorRdfWriteOutput> {
  public constructor(args: IActorArgs<IActionRdfWrite, IActorTest, IActorRdfWriteOutput>) {
    super(args);
  }
}

export interface IActionRdfWrite extends IAction {

}

export interface IActorRdfWriteOutput extends IActorOutput {

}
