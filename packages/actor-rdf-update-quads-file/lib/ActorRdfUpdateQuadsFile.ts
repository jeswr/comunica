import { QuadStream } from '@comunica/bus-query-operation';
import { IActionRdfCombineQuads, IActorRdfCombineQuadsOutput, IQuadStreamUpdate } from '@comunica/bus-rdf-combine-quads';
import { IActionRdfDereference, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import { IActionRdfSerialize, IActorRdfSerializeOutput } from '@comunica/bus-rdf-serialize';
import { IActionRdfUpdateQuadStream, IActorRdfUpdateQuadStreamOutput } from '@comunica/bus-rdf-update-quad-stream';
import { ActorRdfUpdateQuads, IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput } from '@comunica/bus-rdf-update-quads';
import { IActionRdfWrite, IActorRdfWriteOutput } from '@comunica/bus-rdf-write';
import { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { DataSourceUtils } from '@comunica/utils-datasource';
import { AsyncIterator } from 'asynciterator';
import * as RDF from 'rdf-js';
const streamToArray = require('arrayify-stream')
import * as N3 from 'n3'
import { sha1 } from 'hash.js';
// import toQuad from 'rdf-quad';
import { quadToStringQuad } from 'rdf-string';
import { ActorRdfWriteFile } from '@comunica/actor-rdf-write-file'
import * as fs from 'fs'
/**
 * A comunica File RDF Update Quads Actor.
 */
export class ActorRdfUpdateQuadsFile extends ActorRdfUpdateQuads {
  mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>, 
  IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;
  mediatorRdfWrite: Mediator<Actor<IActionRdfWrite, IActorTest, IActorRdfWriteOutput>, 
  IActionRdfWrite, IActorTest, IActorRdfWriteOutput>;
  mediatorCombineQuads: Mediator<Actor<IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>, 
  IActionRdfCombineQuads, IActorTest, IActorRdfCombineQuadsOutput>;

  public constructor(args: IActorArgs<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>) {
    super(args);
  }

  public async testOperation(action: IActionRdfUpdateQuads): Promise<IActorTest> {
    // TODO: Forward test results
    console.log('test quads file')
    return true; // TODO implement
  }

  hash(quad: RDF.Quad): string {
    return sha1()
      .update(require('canonicalize')(quadToStringQuad(quad)))
      .digest('hex');
  }

  public async runOperation(action: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    // TODO: FIX
    console.log("run quads file");
    const source = await DataSourceUtils.getSingleSource(action.context);
    console.log(source)
    const dereferenced =  await this.mediatorRdfDereference.mediate({
      // @ts-ignore
      url: source?.value,
      context: action.context
    });
    console.log(dereferenced)
    const { quads: dereferencedQuads, url } = dereferenced;
    // const parser = new N3.StreamParser();
    // parser.write()
    // // @ts-ignore
    // const quadStream: QuadStream = new AsyncIterator<RDF.Quad>();
    // console.log('looking at derefffed', await streamToArray(dereferencedQuads))
    // console.log('looking at derefffed', await streamToArray(action.quadStreamInsert))
    
    let quads = [...await streamToArray(dereferencedQuads), ...(action.quadStreamInsert ? await streamToArray(action.quadStreamInsert) : [])]
    const hashes: Record<string, boolean> = {};

    if (action.quadStreamDelete) {
      const deleted = await streamToArray(action.quadStreamDelete);
      for (const x of deleted) {
        hashes[this.hash(x)] = true;
      }
    }

    quads = quads.filter(quad => {
      const hash = this.hash(quad);
      return !(hash in hashes) && (hashes[hash] = true);
    })
    
    
    // dereferencedQuads.on('data', (quad: RDF.Quad) => {
    //   console.log('quad', quad)
    //   // quadStream.append([ quad ]);
    // })
    // console.log('after dereffed')


    // dereferencedQuads.on('end', () => {
    //   quadStream.close();
    // })

    // let quadStreamUpdates: IQuadStreamUpdate[] = [];

    // if (action.quadStreamInsert) {
    //   quadStreamUpdates.push({
    //     type: 'insert', quadStream: action.quadStreamInsert
    //   })
    // }

    // if (action.quadStreamDelete) {
    //   quadStreamUpdates.push({
    //     type: 'insert', quadStream: action.quadStreamDelete
    //   })
    // }
    // console.log(this.mediatorCombineQuads, 'combine')
    // console.log('before combine')
    // const { quads, quadStreamInserted, quadStreamDeleted } = await this.mediatorCombineQuads.mediate({
    //   quads: quadStream,
    //   quadStreamUpdates
    //   // quadStreamInsert: action.quadStreamInsert,
    //   // quadStreamDelete: action.quadStreamDelete,
    // });
    console.log('after combine')
    // console.log(quads)
    // quads.on('data', quad => {
    //   console.log(quad);
    // })
    // await new Promise((res, rej) => {
    //   quads.on('end', () => {
    //     res(undefined);
    //   })
    // });
    console.log('after promise')
    // new Promise((res, rej) => {
    //   setTimeout(() => {
    //     res(void);
    //   }, 10000);
    // })

    // const myTestQuads = new AsyncIterator<RDF.Quad>();
    // myTestQuads.append([
    //   // toQuad('http://example,org/1','http://example,org/2','http://example,org/3')
    //   // {
    //   //   subject: new namedNode(''),
    //   //   predicate: new namedNode(''),
    //   //   object: new namedNode('')
    //   // }
    // ])

    // TODO: Handle rejection of this operation and
    // remove quads that could not be serialized from quadStreamInserted
    // @ts-ignore
    // console.log(this)
    const writer = new N3.Writer();
    // writer.addQuads(quads);
    await new Promise((res, rej) => {
      const s = writer.quadsToString(quads);
      console.log('file string')
      fs.writeFile(url, s, () => {res(undefined)});
    })
    console.log('after writer')
    // writer.quadsToString(quads)


    // const writeStream = new StreamWriter({ format: mediaType }).import(new AsyncIterator<RDF.Quad>().append(quads));
    // fs.wr(writeStream)

    // await this.mediatorRdfWrite.mediate({
    //   url,
    //   quads: new AsyncIterator<RDF.Quad>().append(quads),
    // })
    
    
    // await (new ActorRdfWriteFile).run({
    //   url,
    //   quads
    // });

    // TODO: Fix based on above ammendments
    return {
      quadStreamInserted: new AsyncIterator<RDF.Quad>(),
      quadStreamDeleted: new AsyncIterator<RDF.Quad>()
    }

    // this.mediatorParse.mediate({

    // })
    
    // return true; // TODO implement
  }
}
