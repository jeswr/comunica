import * as fs from 'fs';
import { ActorRdfDereferenceMediaMappings, IActionRdfDereference, IActorRdfDereferenceOutput, IActorRdfDereferenceMediaMappingsArgs } from '@comunica/bus-rdf-dereference';
import { IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse, IActorRdfParseOutput } from '@comunica/bus-rdf-parse';
import { ActorRdfWrite, IActionRdfWrite, IActorRdfWriteOutput } from '@comunica/bus-rdf-write';
import { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { promisify } from 'util';

/**
 * A comunica File RDF Write Actor.
 */
export class ActorRdfWriteFile extends ActorRdfWrite {
  public constructor(args: IActorArgs<IActionRdfWrite, IActorTest, IActorRdfWriteOutput>) {
    super(args);
  }

  public async test(action: IActionRdfWrite): Promise<IActorTest> {
    try {
      await promisify(fs.access)(
        action.url.startsWith('file://') ? new URL(action.url) : action.url, fs.constants.W_OK
      );
    } catch (error: unknown) {
      throw new Error(
        `This actor only works on existing local files. (${error})`,
      );
    }
    return true;
  }

  public async run(action: IActionRdfWrite): Promise<IActorRdfWriteOutput> {
    let { mediaType } = action;

    // Deduce media type from file extension if possible
    if (!mediaType) {
      mediaType = this.getMediaTypeFromExtension(action.url);
    }

    const parseAction: IActionHandleRdfParse = {
      context: action.context,
      handle: {
        baseIRI: action.url,
        input: fs.createReadStream(action.url.startsWith('file://') ? new URL(action.url) : action.url),
      },
    };
    if (mediaType) {
      parseAction.handleMediaType = mediaType;
    }

    let parseOutput: IActorRdfParseOutput;
    try {
      parseOutput = (await this.mediatorRdfParse.mediate(parseAction)).handle;
    } catch (error: unknown) {
      return this.handleDereferenceError(action, error);
    }

    return {
      headers: {},
      quads: this.handleDereferenceStreamErrors(action, parseOutput.quads),
      triples: parseOutput.triples,
      url: action.url,
    };
  }
}


// /**
//  * A comunica File RDF Dereference Actor.
//  */
// export class ActorRdfDereferenceFile extends ActorRdfDereferenceMediaMappings {
//   public readonly mediatorRdfParse: Mediator<
//   Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>,
//   IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;

//   public constructor(args: IActorRdfDereferenceFileArgs) {
//     super(args);
//   }

//   public async test(action: IActionRdfDereference): Promise<IActorTest> {
//     try {
//       await promisify(fs.access)(
//         action.url.startsWith('file://') ? new URL(action.url) : action.url, fs.constants.F_OK,
//       );
//     } catch (error: unknown) {
//       throw new Error(
//         `This actor only works on existing local files. (${error})`,
//       );
//     }
//     return true;
//   }

//   public async run(action: IActionRdfDereference): Promise<IActorRdfDereferenceOutput> {
//     let { mediaType } = action;

//     // Deduce media type from file extension if possible
//     if (!mediaType) {
//       mediaType = this.getMediaTypeFromExtension(action.url);
//     }

//     const parseAction: IActionHandleRdfParse = {
//       context: action.context,
//       handle: {
//         baseIRI: action.url,
//         input: fs.createReadStream(action.url.startsWith('file://') ? new URL(action.url) : action.url),
//       },
//     };
//     if (mediaType) {
//       parseAction.handleMediaType = mediaType;
//     }

//     let parseOutput: IActorRdfParseOutput;
//     try {
//       parseOutput = (await this.mediatorRdfParse.mediate(parseAction)).handle;
//     } catch (error: unknown) {
//       return this.handleDereferenceError(action, error);
//     }

//     return {
//       headers: {},
//       quads: this.handleDereferenceStreamErrors(action, parseOutput.quads),
//       triples: parseOutput.triples,
//       url: action.url,
//     };
//   }
// }

// export interface IActorRdfDereferenceFileArgs extends IActorRdfDereferenceMediaMappingsArgs {
//   /**
//    * Mediator used for parsing the file contents.
//    */
//   mediatorRdfParse: Mediator<
//   Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>,
//   IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;
// }
