import { ActorRdfUpdateQuadStreams, IActionRdfUpdateQuadStreams, IActorRdfUpdateQuadStreamsOutput } from '@comunica/bus-rdf-update-quad-streams';
import { ActorRdfCombineQuads, IActionRdfCombineQuads, IActorRdfCombineQuadsOutput, IQuadStreamUpdate,  } from '@comunica/bus-rdf-combine-quads';
import { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';

// TODO: Make delegation a core functionality rather than requiring boilerplate as is the case here

/**
 * A comunica Delegate Combine RDF Update Quad Streams Actor.
 */
export class ActorRdfUpdateQuadStreamsDelegateCombine extends ActorRdfUpdateQuadStreams {
  public readonly mediatorCombineQuads: Mediator<Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>,
  IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;
  private delegatedActor: Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;

  public constructor(args: IActorArgs<IActionRdfUpdateQuadStreams, IActorTest, IActorRdfUpdateQuadStreamsOutput>) {
    super(args);
  }

  private async getCombineInput(action: IActionRdfUpdateQuadStreams): Promise<IActionRdfCombineQuads> {
    const updates: IQuadStreamUpdate[] = [];
    if (action.quadStreamInsert) {
      updates.push({ type: 'insert', quadStream: action.quadStreamInsert });
    }
    if (action.quadStreamDelete) {
      updates.push({ type: 'delete', quadStream: action.quadStreamDelete });
    }
    return {
      avoidDuplicates: true,
      maintainOrder: true,
      trackChanges: true,
      quads: action.quads,
      quadStreamUpdates: updates,
      context: action.context
    }
  }

  public async test(action: IActionRdfUpdateQuadStreams): Promise<IActorTest> {
    const published = await this.mediatorCombineQuads.mediateResult(await this.getCombineInput(action));
    this.delegatedActor = published.actor;
    return published.reply;
  }

  public async run(action: IActionRdfUpdateQuadStreams): Promise<IActorRdfUpdateQuadStreamsOutput> {
    if (this.delegatedActor) {
      return this.delegatedActor.run(await this.getCombineInput(action));
    }
    return this.mediatorCombineQuads.mediate(await this.getCombineInput(action));
  }
}
