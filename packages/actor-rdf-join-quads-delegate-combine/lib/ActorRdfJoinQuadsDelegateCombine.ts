import { ActorRdfJoinQuads, IActionRdfJoinQuads, IActorRdfJoinQuadsOutput } from '@comunica/bus-rdf-join-quads';
import { IActorRdfUpdateQuadStreamsOutput } from '@comunica/bus-rdf-update-quad-streams';
import { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { IActionRdfCombineQuads, IActorRdfCombineQuadsOutput, IQuadStreamUpdate } from '../../bus-rdf-combine-quads';

/**
 * A comunica Delegate Combine RDF Join Quads Actor.
 */
export class ActorRdfJoinQuadsDelegateCombine extends ActorRdfJoinQuads {
  public readonly mediatorCombineQuads: Mediator<Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>,
  IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;
  private delegatedActor: Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;

  public constructor(args: IActorArgs<IActionRdfJoinQuads, IActorTest, IActorRdfJoinQuadsOutput>) {
    super(args);
  }

  private async getCombineInput(action: IActionRdfJoinQuads): Promise<IActionRdfCombineQuads> {
    let quadStreamUpdates: IQuadStreamUpdate[] = []
    for (const quadStream of action.quadStreams) {
      if (quadStream) {
        quadStreamUpdates.push({ type : 'insert', quadStream })
      }
    }
    return {
      trackChanges: false,
      maintainOrder: false,
      avoidDuplicates: true,
      quadStreamUpdates
    }
  }

  public async test(action: IActionRdfJoinQuads): Promise<IActorTest> {
    const published = await this.mediatorCombineQuads.mediateResult(await this.getCombineInput(action));
    this.delegatedActor = published.actor;
    return published.reply;
  }

  public async run(action: IActionRdfJoinQuads): Promise<IActorRdfUpdateQuadStreamsOutput> {
    if (this.delegatedActor) {
      return this.delegatedActor.run(await this.getCombineInput(action));
    }
    return this.mediatorCombineQuads.mediate(await this.getCombineInput(action));
  }
}