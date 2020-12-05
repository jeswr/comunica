import { BindingsToQuadsIterator } from '@comunica/actor-query-operation-construct';
import {
  ActorQueryOperation, ActorQueryOperationTypedMediated, Bindings, BindingsStream, IActorQueryOperationOutput,
  IActorQueryOperationTypedMediatedArgs, IActionQueryOperation,
  IActorQueryOperationOutputUpdate,
} from '@comunica/bus-query-operation';
import { ActionContext, IActorTest, MediatedActor } from '@comunica/core';
import { AsyncIterator, SingletonIterator } from 'asynciterator';
import * as RDF from 'rdf-js';
import { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Update DeleteInsert Query Operation Actor.
 */
export class ActorQueryOperationUpdateDeleteInsert extends ActorQueryOperationTypedMediated<Algebra.DeleteInsert> {
  public readonly mediatorUpdateQuads: MediatedActor<IActorQueryOperationOutputUpdate, IActorTest, IActorQueryOperationOutputUpdate>;
  
  public constructor(args: IActorQueryOperationTypedMediatedArgs) {
    super(args, 'deleteinsert');
  }

  public async testOperation(pattern: Algebra.DeleteInsert, context: ActionContext): Promise<IActorTest> {
    return true;
  }

  public async runOperation(pattern: Algebra.DeleteInsert, context: ActionContext):
  Promise<IActorQueryOperationOutput> {
    // Evaluate the where clause
    const whereBindings: BindingsStream = pattern.where ?
      ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation
        .mediate({ operation: pattern.where, context })).bindingsStream :
      new SingletonIterator(Bindings({}));

    // Evaluate the required modifications
    const { quadStreamInserted, quadStreamDeleted } = await this.mediatorUpdateQuads.mediate({
      type: 'update', // TODO: see if this can be removed
      // @ts-ignore
      quadStreamInserted: pattern.insert && new BindingsToQuadsIterator(pattern.insert, whereBindings.clone()),
      // @ts-ignore
      quadStreamDeleted: pattern.delete && new BindingsToQuadsIterator(pattern.delete, whereBindings.clone()),
      context,
    });

    return {
      type: 'update',
      quadStreamInserted,
      quadStreamDeleted,
    };
  }
}
