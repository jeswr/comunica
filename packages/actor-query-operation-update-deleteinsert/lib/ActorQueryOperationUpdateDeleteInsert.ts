import { BindingsToQuadsIterator } from '@comunica/actor-query-operation-construct';
import {
  ActorQueryOperation, ActorQueryOperationTypedMediated, Bindings, BindingsStream, IActorQueryOperationOutput,
  IActorQueryOperationTypedMediatedArgs,
} from '@comunica/bus-query-operation';
import { IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput } from '@comunica/bus-rdf-update-quads';
import { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import { AsyncIterator, SingletonIterator } from 'asynciterator';
import * as RDF from 'rdf-js';
import { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Update DeleteInsert Query Operation Actor.
 */
export class ActorQueryOperationUpdateDeleteInsert extends ActorQueryOperationTypedMediated<Algebra.DeleteInsert> {
  public readonly mediatorRdfUpdateQuads: Mediator<Actor<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>,
  IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>;
  
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
    
    // quadStreamInsert?.on('data', quad => {
    //   console.log("Quad found in on")
    //   console.log(quad)
    // })
    console.log("HO")
    // console.log("quadStreamInsert is ", quadStreamInsert)
    // const q = quadStreamInsert?.read();
    // console.log(q)
    // Evaluate the required modifications
    const { quadStreamInserted, quadStreamDeleted } = await this.mediatorRdfUpdateQuads.mediate({
      quadStreamInsert,
      quadStreamDelete,
      context,
    });
    console.log("HI")
    quadStreamInserted?.on('data', quad => {
      console.log(quad)
    })
    // console.log(quadStreamInserted);

    return {
      type: 'update',
      quadStreamInserted,
      quadStreamDeleted,
    };
  }
}
