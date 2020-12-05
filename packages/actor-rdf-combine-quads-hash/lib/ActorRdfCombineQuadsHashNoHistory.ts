import { transform } from '@babel/core';
import type { QuadStream } from '@comunica/bus-query-operation';
import type { IActionRdfCombineQuads, IActorRdfCombineQuadsOutput, IQuadStreamUpdate } from '@comunica/bus-rdf-combine-quads';
import { ActorRdfCombineQuads } from '@comunica/bus-rdf-combine-quads';
import type { IActorArgs, IActorTest } from '@comunica/core';
import { AsyncIterator, ArrayIterator, TransformIterator } from 'asynciterator';
import { sha1 } from 'hash.js';
import type * as RDF from 'rdf-js';
import { quadToStringQuad } from 'rdf-string';

// TODO: Add a reduce method to the async iterator library so that we can do this properly

// class Combiner extends AsyncIterator<RDF.Quad> {
//   private hash: Record<string, boolean> = {};

//   /**
//    * Create a string-based hash of the given object.
//    * @param quad The quad to hash
//    * @return {string} The object's hash.
//    */
//   public static hash(quad: RDF.Quad): string {
//     return sha1()
//       .update(require('canonicalize')(quadToStringQuad(quad)))
//       .digest('hex');
//   }
  
//   read() {
//     this.source
//   }
// }


export class ActorRdfCombineQuadsHashNoHistory extends ActorRdfCombineQuads {
  public constructor(args: IActorArgs<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>) {
    super(args);
  }

  protected canTrackChanges = false;
  protected canMaintainOrder = true;
  protected canAvoidDuplicates = true;
  protected limitInsertsMin = 0;
  protected limitInsertsMax = Infinity;
  protected limitDeletesMin = 0;
  protected limitDeletesMax = Infinity;

  /**
   * Create a string-based hash of the given object.
   * @param quad The quad to hash
   * @return {string} The object's hash.
   */
  public static hash(quad: RDF.Quad): string {
    return sha1()
      .update(require('canonicalize')(quadToStringQuad(quad)))
      .digest('hex');
  }

  /**
   * Gets the number of 'iterations' over streams required to complete
   * this operation.
   * @param inserts The number of insert operations
   * @param deletes The number of delete operations
   * @param hasBase Whether there is a base quad stream
   */
  public async getIterations(inserts: number, deletes: number, hasBase?: boolean): Promise<number> {
    return inserts + deletes;
  }

  /**
   *
   * @param action
   */
  public async getOutput(quads: QuadStream, updates: IQuadStreamUpdate[]): Promise<IActorRdfCombineQuadsOutput> {
    const hashes: Record<string, boolean> = {};
    const result: AsyncIterator<RDF.Quad> = new ArrayIterator([ ...updates.reverse(), { quadStream: quads, type: 'insert'} ])
    .transform({
      transform: (item, done, push) => {
        if (item.type === 'insert') {
          item.quadStream.forEach(quad => {
            const hash = ActorRdfCombineQuadsHashNoHistory.hash(quad);
            if (!(hash in hashes)) {
              push(quad);
              hashes[hash] = true;
            };
          })
        } else {
          item.quadStream.forEach(quad => {
            hashes[ActorRdfCombineQuadsHashNoHistory.hash(quad)] = true;
          })
        }
        done();
      }
    })
    // @ts-ignore
    return { quads: result };
  }
    
    
    
    
    
    // const result: AsyncIterator<RDF.Quad> = [ ...updates.reverse(), { quadStream: quads, type: 'insert'} ].reduce((iterator, update) => {
    //   return iterator.append(update.quadStream.transform({
    //     map: quad => ({quad, insert: update.type === 'insert'})
    //   }))
    // }, new AsyncIterator<{quad: RDF.Quad, insert : boolean}>())
    // .transform({
    //   filter: ({ quad, insert }) => {
    //     const hash = ActorRdfCombineQuadsHash.hash(quad);
    //     if (insert) {
    //       return (hash in hashes) && (hashes[hash] = true)
    //     } else {
    //       hashes[hash] = true
    //       return false;
    //     }
    //   }
    //   transform
    // })

    // return { quads: result }
    



    
    // ;
    // const it = new MultiTransformIterator(iterator, {
      
    // })
    
    
    // iterator.transform({
    //   filter: 
    // })
  
  
  
  
  
    // quads.transform({

    // })
    
    
    
    
    // let quadStreamInserted = new AsyncIterator<RDF.Quad>();
    // const add: Record<string, boolean> | null = {};
    // const hashes: Record<string, boolean> = {};
    // // let quad: RDF.Quad | null = null;
    // // First we create a hash map of deletions
    // for (const update of updates.reverse()) {
    //   if (update.type === 'delete') {
    //     update.quadStream.forEach(quad => {
    //       hashes[ActorRdfCombineQuadsHash.hash(quad)] = true;
    //     });
    //   } else {
    //     update.quadStream.forEach(quad => {
    //       const hash = ActorRdfCombineQuadsHash.hash(quad);
    //       if (!(hash in add) &&  !(hash in hashes)) {
    //         add[hash] = true;
    //         quadStreamInserted.append([ quad ]);
    //       }
    //     })
    //   }
    // }
    
    // // A good algorithm when we dont need to record inserted and deleted
    // let quadStreamInserted = new AsyncIterator<RDF.Quad>();
    // const hashes: Record<string, boolean> = {};
    // // let quad: RDF.Quad | null = null;
    // // First we create a hash map of deletions
    
    // quadStreamInserted.append()
    
    
    // for (const update of updates.reverse()) {
    //   if (update.type === 'delete') {
    //     update.quadStream.forEach(quad => {
    //       hashes[ActorRdfCombineQuadsHash.hash(quad)] = true;
    //     });
    //   } else {
    //     quadStreamInserted = quadStreamInserted.append(update.quadStream.filter(quad => {
    //       const hash = ActorRdfCombineQuadsHash.hash(quad);
    //       return !(hash in hashes) && (hashes[hash] = true);
    //     }))
    //   }
    // }
    // quadStreamInserted = quadStreamInserted.append(quads.filter(quad => !(ActorRdfCombineQuadsHash.hash(quad) in hashes)))



    // for (const update of updates) {
    //   if (update.type === 'delete') {
    //     update.quadStream.forEach(quad => {
    //       hashes[ActorRdfCombineQuadsHash.hash(quad)] = true;
    //     });
    //   } else {
    //     update.quadStream.forEach(quad => {
    //       delete hashes[ActorRdfCombineQuadsHash.hash(quad)];
    //     });
        
    //     .forEach(quad => {

    //     })
        
        
    //     // eslint-disable-next-line no-cond-assign
    //     while ((quad = update.quadStream.read()) !== null) {
    //       const hash = ActorRdfCombineQuadsHash.hash(quad);
    //       if (hashes[hash]) {
    //         delete hashes[hash];
    //         delSize--;
    //       }
    //       if (!(hash in add)) {
    //         add[hash] = true;
    //         quadStreamInserted.append([quad]);
    //       }
    //     }
    //   }
    // }


    // const quadStreamDeleted = new AsyncIterator<RDF.Quad>();
    // // Note that here are assuming there are no duplicate quads in the
    // // quads stream
    // quads = quads.filter((quad: RDF.Quad) => {
    //   const hash = ActorRdfCombineQuadsHash.hash(quad);
    //   if (hash in hashes) {
    //     quadStreamDeleted.append([quad]);
    //     return false;
    //   }
    //   hashes[hash] = true;
    //   return true;
    // });

    // quadStreamInserted = quadStreamInserted.filter(quad => !(ActorRdfCombineQuadsHash.hash(quad) in hashes));
    // quads.append(quadStreamInserted);

    // return {
    //   quadStreamInserted,
    //   quadStreamDeleted,
    //   quads,
    // };

    // TODO: RECOVER OTHER ALG BELOW

    // // While ((quad = quads.read()) !== null) {
    // //   quads.
    // // }

    // // const hashes: Record<string, boolean> = {};

    // // const quadStreamInserted = new AsyncIterator<RDF.Quad>();
    // // const quadStreamDeleted = new AsyncIterator<RDF.Quad>();
    // const quadStream = new AsyncIterator<RDF.Quad>();

    // // eslint-disable-next-line no-cond-assign
    // while ((quad = quads.read()) !== null) {
    //   const hash = ActorRdfCombineQuadsHash.hash(quad);
    // }

    // // Let quadStreamInserted = new AsyncIterator<RDF.Quad>();
    // // const quadStreamDeleted: QuadStream = new AsyncIterator<RDF.Quad>();
    // // let quad;
    // // // eslint-disable-next-line no-cond-assign
    // // while ((quad = quads.read()) !== null) {
    // //   hashes[ActorRdfCombineQuadsHash.hash(quad)] = true;
    // // }

    // // for (const update of updates) {
    // //   if (update.type === 'insert') {
    // //     // eslint-disable-next-line no-cond-assign
    // //     while ((quad = quads.read()) !== null) {
    // //       const hash = ActorRdfCombineQuadsHash.hash(quad);
    // //       if (!(hash in hashes)) {
    // //         hashes[hash] = true;
    // //         quadStreamInserted.append([ quad ]);
    // //         quads.append([ quad ]);
    // //       }
    // //     }
    // //   } else {
    // //     // eslint-disable-next-line no-cond-assign
    // //     while ((quad = quads.read()) !== null) {
    // //       const hash = ActorRdfCombineQuadsHash.hash(quad);
    // //       hashs[hash]
    // //     }
    // //   }
    // // }

    // return true; // TODO implement

}
