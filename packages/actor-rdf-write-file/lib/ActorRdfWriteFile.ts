import * as fs from 'fs';
import { URL } from 'url';
import { IActionRdfSerialize, IActorRdfSerializeOutput } from '@comunica/bus-rdf-serialize';
import { ActorRdfWrite, IActionRdfWrite, IActorRdfWriteOutput } from '@comunica/bus-rdf-write';
import { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { promisify } from 'util';
import { StreamWriter } from 'n3';

/**
 * A comunica File RDF Write Actor.
 */
export class ActorRdfWriteFile extends ActorRdfWrite {
  public readonly mediatorRdfSerialize: Mediator<
  Actor<IActionRdfSerialize, IActorTest, IActorRdfSerializeOutput>,
  IActionRdfSerialize, IActorTest, IActorRdfSerializeOutput>;
  
  public constructor(args: IActorArgs<IActionRdfWrite, IActorTest, IActorRdfWriteOutput>) {
    super(args);
  }

  public async test(action: IActionRdfWrite): Promise<IActorTest> {
    console.log("Test file write")
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
    console.log("run file write", action.url)
    let { mediaType } = action;
    console.log(1)
    // Deduce media type from file extension if possible
    if (!mediaType) {
      mediaType = this.getMediaTypeFromExtension(action.url);
    }
    console.log(2)
    // TODO: Emit quads that were not serialized.
    console.log(this);
    const serializedStream = await this.mediatorRdfSerialize.mediate({
      quadStream: action.quads,
      context: action.context,
      mediaType,
      // @ts-ignore
      mediaTypes: ['text/turtle'],
      ...action
      // @ts-ignore
      // mediaType: 'text/turtle'
    });
    console.log(3)
    // TODO: Handle this promise properly.
    console.log(serializedStream)
    console.log(3.5)
    const writer: NodeJS.ReadableStream = <any> new StreamWriter({ format: 'text/turtle' }).import(action.quads);
    
    
    
    const file = fs.createWriteStream(action.url.startsWith('file://') ? new URL(action.url) : action.url)

    writer.on('data', data => {
      file.write(data);
    });

    await new Promise((res, rej) => {
      writer.on('end', data => {
        file.end();
        res(undefined);
      });
    })
  
    
    
    
    // await promisify(fs.writeFile)(action.url.startsWith('file://') ? new URL(action.url) : action.url, writer);
    // console.log(4)
    // TODO: Add the correct parameters here.
    return {
      url: action.url
    }
  }

  //   const parseAction: IActionHandleRdfParse = {
  //     context: action.context,
  //     handle: {
  //       baseIRI: action.url,
  //       input: fs.createWriteStream(action.url.startsWith('file://') ? new URL(action.url) : action.url),
  //     },
  //   };
  //   if (mediaType) {
  //     parseAction.handleMediaType = mediaType;
  //   }

  //   let parseOutput: IActorRdfParseOutput;
  //   try {
  //     parseOutput = (await this.mediatorRdfParse.mediate(parseAction)).handle;
  //   } catch (error: unknown) {
  //     return this.handleDereferenceError(action, error);
  //   }

  //   return {
  //     headers: {},
  //     quads: this.handleDereferenceStreamErrors(action, parseOutput.quads),
  //     triples: parseOutput.triples,
  //     url: action.url,
  //   };
  // }
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
