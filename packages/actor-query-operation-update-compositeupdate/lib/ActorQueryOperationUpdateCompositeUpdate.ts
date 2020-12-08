import { ActorQueryOperation, ActorQueryOperationTypedMediated, IActorQueryOperationOutput,
  IActorQueryOperationTypedMediatedArgs, 
  QuadStream} from '@comunica/bus-query-operation';
import { IActionRdfJoinQuads, IActorRdfJoinQuadsOutput } from '@comunica/bus-rdf-join-quads';
import { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Update CompositeUpdate Query Operation Actor.
 */
export class ActorQueryOperationUpdateCompositeUpdate
  extends ActorQueryOperationTypedMediated<Algebra.CompositeUpdate> {
    public readonly mediatorJoinQuads: Mediator<Actor<IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput>,
    IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput>;
  
    public constructor(args: IActorQueryOperationTypedMediatedArgs) {
    super(args, 'compositeupdate');
  }

  public async testOperation(pattern: Algebra.CompositeUpdate, context: ActionContext): Promise<IActorTest> {
    return true;
  }

  public async runOperation(pattern: Algebra.CompositeUpdate, context: ActionContext):
  Promise<IActorQueryOperationOutput> {
    // TODO: create transaction
    const updateResults = await Promise.all(pattern.updates
      .map(operation => this.mediatorQueryOperation.mediate({ operation, context })));
    
    const quadStreamsInserted: QuadStream[] = [];
    const quadStreamsDeleted: QuadStream[] = [];
    for (const update of updateResults) {
      const { quadStreamInserted, quadStreamDeleted } = ActorQueryOperation.getSafeUpdate(update);
      if (quadStreamInserted) {
        quadStreamsInserted.push(quadStreamInserted);
      }
      if (quadStreamDeleted) {
        quadStreamsDeleted.push(quadStreamDeleted);
      }
    }

    return {
      type: 'update',
      quadStreamInserted: (await this.mediatorJoinQuads.mediate({ quadStreams: quadStreamsInserted })).quads, // TODO: join input streams
      quadStreamDeleted: (await this.mediatorJoinQuads.mediate({ quadStreams: quadStreamsDeleted })).quads, // TODO: join input streams
    };
  }
}
