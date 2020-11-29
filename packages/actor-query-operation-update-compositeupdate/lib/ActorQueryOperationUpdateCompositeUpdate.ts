import { ActorQueryOperationTypedMediated, IActorQueryOperationOutput,
  IActorQueryOperationOutputUpdate,
  IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActionContext, IActorTest } from '@comunica/core';
import { Algebra } from 'sparqlalgebrajs';
import * as RDF from 'rdf-js';

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
    const updateResults: IActorQueryOperationOutputUpdate[] = await Promise.all(pattern.updates
      .map(operation => this.mediatorQueryOperation.mediate({ operation, context })));
    
    const quadStreamInserted: AsyncIterator<RDF.Quad> | undefined = updateResults.map(update => update.)
    
    return {
      type: 'update',
      quadStreamInserted, // TODO: join input streams
      quadStreamDeleted, // TODO: join input streams
    };
  }
}
