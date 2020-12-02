import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { ActorHttp } from '@comunica/bus-http';
import type { IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { ActionContext } from '@comunica/core';

// https://github.com/mdn/dom-examples/blob/master/streams/png-transform-stream/png-transform-stream.js
// used as template
// class SparqlApplicationJsonUnpacker() {
//   constructor() {
//     this.data = new Uint8Array(0);
//     this.onChunk = null;
//     this.onClose = null;
//   }

//   /**
//    * Adds more binary data to unpack.
//    *
//    * @param {Uint8Array} uint8Array The data to add.
//    */
//   addBinaryData(uint8Array) {
//     const newData = new Uint8Array(this.data.length + uint8Array.length);
//     newData.set(this.data, 0);
//     newData.set(uint8Array, this.data.length);
//     this.data = newData;
//     this.checkForChunks();
//   }

//   /**
//    * Checks whether new chunks can be found within the binary data.
//    */
//   checkForChunks() {
//     if (!this.position) {
//       this.position = 8;
//     }

//     while (true) {
//       // Check if stream contains another PNG chunk
//       const dataView = new DataView(this.data.buffer, this.position);
//       const chunkLength = dataView.getUint32(0);
//       if (dataView.byteLength < chunkLength + 12) {
//         return;
//       }

//       // Create a PNG chunk instance out of data retrieved
//       const name = String.fromCharCode(dataView.getUint8(4), dataView.getUint8(5), dataView.getUint8(6), dataView.getUint8(7));
//       const data = this.data.buffer.slice(this.position + 8, this.position + chunkLength + 8);
//       const chunk = createChunk({ name, data });

//       // Inform consumer about the found chunk
//       if (typeof this.onChunk === 'function') {
//         this.onChunk(chunk);
//       }

//       // Check if found the last chunk within the PNG
//       if (name === 'IEND') {
//         if (typeof this.onClose === 'function') {
//           this.onClose();
//           return;
//         }
//       }

//       this.position += chunkLength + 12;
//     }
// };

// this.readable = new ReadableStream({
//   start(controller) {
//     // Unpacker.onChunk = (chunk: any) => controller.enqueue(chunk);
//     // unpacker.onClose = () => controller.close();
//   },
// });
// this.writable = new WritableStream({
//   write(unit8Array) {
//     // Unpacker.addBinaryData(unit8Array);
//   },
// });

const indicator = 'nodeID://';

class SkolemizeBnodeTransformStream {
  public readable: ReadableStream<string>;
  public writable: WritableStream<string>;
  public constructor() {
    let onChunk: (chunk: string) => void;
    // let counter = 0;
    this.readable = new ReadableStream({
      start(controller) {
        onChunk = (chunk: string) => {
          console.log(chunk);
          controller.enqueue(chunk);
        };
      },
    });
    this.writable = new WritableStream({
      write(string) {
        onChunk(string);
      },
    });
  }
}

/**
 * An actor that handles HTTP responses for vendors (e.g. Virtuoso) that Skolemize Blank Nodes
 */
export class ActorHttpSparqlSkolemizedBnodes extends ActorHttp {
  public readonly mediatorHttp: Mediator<ActorHttp, IActionHttp, IActorTest, IActorHttpOutput>;
  public constructor(args: IActorArgs<IActionHttp, IActorTest, IActorHttpOutput>) {
    super(args);
  }

  public async test(action: IActionHttp): Promise<IActorTest> {
    return action.context?.get('skolemized') ? false : { priority: 0 };
  }

  public async run(action: IActionHttp): Promise<IActorHttpOutput> {
    action.context = action.context ? action.context.set('skolemized', true) : ActionContext({ skolemized: true });
    return this.mediatorHttp.mediate(action).then(result => {
      result.body
        ?.pipeThrough(new TextDecoderStream())
        .pipeThrough(new SkolemizeBnodeTransformStream())
        .pipeThrough(new TextEncoderStream());
      return result;
    });
  }
}
