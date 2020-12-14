import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';
import * as RDF from 'rdf-js';

// TODO: Steal other necessary components from the dereference module.
/**
 * A comunica actor for rdf-write events.
 *
 * Actor types:
 * * Input:  IActionRdfWrite:      TODO: fill in.
 * * Test:   <none>
 * * Output: IActorRdfWriteOutput: TODO: fill in.
 *
 * @see IActionRdfWrite
 * @see IActorRdfWriteOutput
 */
export abstract class ActorRdfWrite extends Actor<IActionRdfWrite, IActorTest, IActorRdfWriteOutput> {
  public readonly mediaMappings: Record<string, string>;

  public constructor(args: IActorArgs<IActionRdfWrite, IActorTest, IActorRdfWriteOutput>) {
    super(args);
  }
  
  // TODO: This is taken from the dereference bus - refactor so they can just share the same function
  /**
   * Get the media type based on the extension of the given path,
   * which can be an URL or file path.
   * @param {string} path A path.
   * @return {string} A media type or the empty string.
   */
  public getMediaTypeFromExtension(path: string): string {
    const dotIndex = path.lastIndexOf('.');
    if (dotIndex >= 0) {
      const ext = path.slice(dotIndex);
      // Ignore dot
      console.log(this.mediaMappings)
      return (this.mediaMappings ?? { ttl: 'text/turtle' })[ext.slice(1)] || '';
    }
    return '';
  }
}
// TODO: Again - this is stolen from the dereference bus.
export interface IActorRdfDereferenceMediaMappingsArgs
  extends IActorArgs<IActionRdfWrite, IActorTest, IActorRdfWriteOutput> {
  /**
   * A collection of mappings, mapping file extensions to their corresponding media type.
   */
  mediaMappings: Record<string, string>;
}

export interface IActionRdfWrite extends IAction {
  /**
   * The URL to dereference
   */
  url: string;

  /**
   * The mediatype of the source (if it can't be inferred from the source)
   */
  mediaType?: string;
  /**
   * Optional HTTP method to use.
   * Defaults to GET.
   */
  method?: string;
  /**
   * Optional HTTP headers to pass.
   */
  headers?: Record<string, string>;
  /**
   * The stream of quads to write to the source
   */
  quads: RDF.Stream;
}

export interface IActorRdfWriteOutput extends IActorOutput {
  /**
   * The page on which the output was written to.
   *
   * This is not necessarily the same as the original input url,
   * as this may have changed due to redirects.
   */
  url: string;
  /**
   * An optional field indicating if the given quad stream originates from a triple-based serialization,
   * in which everything is serialized in the default graph.
   * If falsy, the quad stream contains actual quads, otherwise they should be interpreted as triples.
   */
  triples?: boolean;
  /**
   * The returned headers of the final URL.
   */
  headers?: Record<string, string>;
  /**
   * The stream of quads that were not written to the source.
   */
  rejectedQuads?: RDF.Stream;
}
