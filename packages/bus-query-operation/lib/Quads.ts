import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';

/**
 * A stream of Quads.
 */
export type QuadStream = RDF.Stream & AsyncIterator<RDF.Quad>;
