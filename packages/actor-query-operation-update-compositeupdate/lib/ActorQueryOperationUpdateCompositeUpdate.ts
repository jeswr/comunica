import {
  ActorQueryOperationTyped,
  IActorQueryOperationOutput,
  IActorQueryOperationOutputUpdate,
  IActorQueryOperationTypedMediatedArgs,
  QuadStream,
} from '@comunica/bus-query-operation';
import {
  ActorQueryOperation, ActorQueryOperationTypedMediated,
} from '@comunica/bus-query-operation';
import type {
  ActorRdfCombineQuads,
  IActionRdfCombineQuads,
  IActorRdfCombineQuadsOutput
} from '@comunica/bus-rdf-combine-quads';
import type {
  ActorRdfJoinQuads,
  IActionRdfJoinQuads,
  IActorRdfJoinQuadsOutput
} from '@comunica/bus-rdf-join-quads';
import type { ActionContext, IActorArgs, IActorTest, MediatedActor } from '@comunica/core';
import { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import type { Algebra } from 'sparqlalgebrajs';
// TODO: FIX NAMING
export abstract class ActorRDFCombineOperationTypedMediated extends ActorQueryOperationTypedMediated<Algebra.CompositeUpdate> implements IMediatedCombineQuads {
  public readonly mediatorJoinQuads: MediatedActor<IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput>;
  public readonly mediatorCombineQuads: MediatedActor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;

  public constructor(args: IActorQueryOperationTypedMediatedArgs, operationName: string) {
    super(args, operationName);
  }
}

interface IMediatedCombineQuads extends ActorQueryOperationTypedMediated<Algebra.CompositeUpdate> {
  // TODO: CHECK IActorTest
  mediatorCombineQuads: MediatedActor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;
}

/**
 * A comunica Update CompositeUpdate Query Operation Actor.
 */
export class ActorQueryOperationUpdateCompositeUpdate
  extends ActorRDFCombineOperationTypedMediated implements IMediatedCombineQuads {
  mediatorCombineQuads: MediatedActor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;

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

    const quadStreamsInserted: QuadStream[] = updateResultsSafe.map(
      update => update.quadStreamInserted
    );
    const quadStreamsDeleted: QuadStream[] = updateResultsSafe.map(
      update => update.quadStreamDeleted
    );

    // TOOO: FIX Cancelleation of update and insert streams - probably just hook directly into update delete
    return {
      type: 'update',
      quadStreamInserted: (await this.mediatorJoinQuads.mediate({
        quadStreams: quadStreamsInserted,
      })).quads,
      quadStreamDeleted: (await this.mediatorJoinQuads.mediate({
        quadStreams: quadStreamsDeleted,
      })).quads,
    };
  }
}
