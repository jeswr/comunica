import { IActionRdfDereference, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import { ActorRdfParse, IActionRdfParse, IActorRdfParseOutput } from '@comunica/bus-rdf-parse';
import { IActionRdfSerialize, IActorRdfSerializeOutput } from '@comunica/bus-rdf-serialize';
import { ActorRdfUpdateQuads, IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput } from '@comunica/bus-rdf-update-quads';
import { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';

/**
 * A comunica File RDF Update Quads Actor.
 */
export class ActorRdfUpdateQuadsFile extends ActorRdfUpdateQuads {
  mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>, 
  IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;
  mediatorSerialize: Mediator<Actor<IActionRdfSerialize, IActorTest, IActorRdfSerializeOutput>, 
  IActionRdfSerialize, IActorTest, IActorRdfSerializeOutput>;
  
  public constructor(args: IActorArgs<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>) {
    super(args);
  }

  public async testOperation(action: IActionRdfUpdateQuads): Promise<IActorTest> {
    medi
    return true; // TODO implement
  }

  public async runOperation(action: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    this.mediatorRdfDereference.mediate({
      url: action.context?.get('url'),
      media
    })
    
    
    this.mediatorParse.mediate({

    })
    
    return true; // TODO implement
  }
}
