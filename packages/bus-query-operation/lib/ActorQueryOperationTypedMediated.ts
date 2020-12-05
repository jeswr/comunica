import type { Actor, IActorArgs, IActorTest, MediatedActor, Mediator } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
import type { IActionQueryOperation, IActorQueryOperationOutput } from './ActorQueryOperation';
import { ActorQueryOperationTyped } from './ActorQueryOperationTyped';

/**
 * A base implementation for query operation actors for a specific operation type that have a query operation mediator.
 */
export abstract class ActorQueryOperationTypedMediated<O extends Algebra.Operation> extends ActorQueryOperationTyped<O>
  implements IActorQueryOperationTypedMediatedArgs {
  public readonly mediatorQueryOperation: MediatedActor<IActionQueryOperation, IActorTest, IActorQueryOperationOutput>;

  public constructor(args: IActorQueryOperationTypedMediatedArgs, operationName: string) {
    super(args, operationName);
  }
}

export interface IActorQueryOperationTypedMediatedArgs
  extends IActorArgs<IActionQueryOperation, IActorTest, IActorQueryOperationOutput> {
  mediatorQueryOperation: MediatedActor<IActionQueryOperation, IActorTest, IActorQueryOperationOutput>;
}
