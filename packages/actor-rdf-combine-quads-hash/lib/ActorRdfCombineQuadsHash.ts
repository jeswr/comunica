import { ActorRdfCombineQuads, IActionRdfCombineQuads, IActorRdfCombineQuadsOutput } from '@comunica/bus-rdf-combine-quads';
import { IActorArgs, IActorTest } from '@comunica/core';

/**
 * A comunica Hash RDF Combine Quads Actor.
 */
export class ActorRdfCombineQuadsHash extends ActorRdfCombineQuads {
  public constructor(args: IActorArgs<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>) {
    super(args);
  }

  public async test(action: IActionRdfCombineQuads): Promise<IActorTest> {
    return true; // TODO implement
  }

  public async run(action: IActionRdfCombineQuads): Promise<IActorRdfCombineQuadsOutput> {
    return true; // TODO implement
  }
}
