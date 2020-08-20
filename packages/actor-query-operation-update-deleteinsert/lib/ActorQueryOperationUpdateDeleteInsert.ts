import { BindingsToQuadsIterator } from '@comunica/actor-query-operation-construct';
import {
  ActorQueryOperation, ActorQueryOperationTypedMediated, Bindings, BindingsStream, IActorQueryOperationOutput,
  IActorQueryOperationTypedMediatedArgs,
} from '@comunica/bus-query-operation';
import { ActionContext, IActorTest } from '@comunica/core';
import { AsyncIterator, SingletonIterator } from 'asynciterator';
import * as RDF from 'rdf-js';
import { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Update DeleteInsert Query Operation Actor.
 */
export class ActorQueryOperationUpdateDeleteInsert extends ActorQueryOperationTypedMediated<Algebra.DeleteInsert> {
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

    // Construct triples using the result based on the pattern.
    let quadStreamInsert: AsyncIterator<RDF.Quad> | undefined;
    let quadStreamDelete: AsyncIterator<RDF.Quad> | undefined;
    if (pattern.insert) {
      quadStreamInsert = new BindingsToQuadsIterator(pattern.insert, whereBindings.clone());
    }
    if (pattern.delete) {
      quadStreamDelete = new BindingsToQuadsIterator(pattern.delete, whereBindings.clone());
    }

    // Evaluate the required modifications
    const { quadStreamInserted, quadStreamDeleted } = this.mediatorUpdateQuads.mediate({
      quadStreamInsert,
      quadStreamDelete,
      context,
    });

    return {
      type: 'update',
      quadStreamInserted,
      quadStreamDeleted,
    };
  }
}
