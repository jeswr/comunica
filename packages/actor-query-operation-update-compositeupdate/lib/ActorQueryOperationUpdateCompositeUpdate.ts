import type { IActorQueryOperationOutput,
  IActorQueryOperationOutputUpdate,
  IActorQueryOperationTypedMediatedArgs,
  QuadStream } from '@comunica/bus-query-operation';
import {
  ActorQueryOperation, ActorQueryOperationTypedMediated,
} from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Update CompositeUpdate Query Operation Actor.
 */
export class ActorQueryOperationUpdateCompositeUpdate
  extends ActorQueryOperationTypedMediated<Algebra.CompositeUpdate> {
  public constructor(args: IActorQueryOperationTypedMediatedArgs) {
    super(args, 'compositeupdate');
  }

  public async testOperation(pattern: Algebra.CompositeUpdate, context: ActionContext): Promise<IActorTest> {
    return true;
  }

  public async runOperation(pattern: Algebra.CompositeUpdate, context: ActionContext):
  Promise<IActorQueryOperationOutput> {
    // TODO: create transaction
    const updateResults: IActorQueryOperationOutput[] = await Promise.all(pattern.updates
      .map(operation => this.mediatorQueryOperation.mediate({ operation, context })));

    const updateResultsSafe: IActorQueryOperationOutputUpdate[] = updateResults.map(ActorQueryOperation.getSafeUpdate);

    const quadStreamInserted: QuadStream[] = updateResultsSafe.flatMap(update => update.quadStreamInserted);

    return {
      type: 'update',
      quadStreamInserted, // TODO: join input streams
      quadStreamDeleted, // TODO: join input streams
    };
  }
}
