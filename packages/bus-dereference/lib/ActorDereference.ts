import { Readable } from 'stream';
import { KeysInitQuery } from '@comunica/context-entries';
import type { IAction, IActorArgs, IActorOutput, IActorTest, Mediate } from '@comunica/core';
import { Actor } from '@comunica/core';
import type { IActionContext } from '@comunica/types';

export function emptyReadable<S extends Readable>(): S {
  const data = new Readable();
  data.push(null);
  return <S> data;
}

/**
 * Check if hard errors should occur on HTTP or parse errors.
 * @param {IActionDereference} action A dereference action.
 * @return {boolean} If hard errors are enabled.
 */
export function isHardError(context: IActionContext): boolean {
  return !context.get(KeysInitQuery.lenient);
}

/**
 * A base actor for dereferencing URLs to (generic) streams.
 *
 * Actor types:
 * * Input:  IActionDereference:      A URL.
 * * Test:   <none>
 * * Output: IActorDereferenceOutput: A Readable stream
 *
 * @see IActionDereference
 * @see IActorDereferenceOutput
 */
export abstract class ActorDereference extends Actor<IActionDereference, IActorTest, IActorDereferenceOutput> {
  /**
   * @param args - @defaultNested {<default_bus> a <cc:components/Bus.jsonld#Bus>} bus
   */
  public constructor(args: IActorDereferenceArgs) {
    super(args);
  }

  /**
   * Handle the given error as a rejection or delegate it to the logger,
   * depending on whether or not hard errors are enabled.
   * @param {IActionDereference} action A dereference action.
   * @param {Error} error An error that has occurred.
   * @param headers Optional HTTP headers to pass.
   * @param {number} requestTime The time it took to request the page in milliseconds.
   * @return {Promise<IActorDereferenceOutput>} A promise that rejects or resolves to an empty output.
   */
  protected async handleDereferenceError(
    action: IActionDereference,
    error: unknown,
    headers: Headers | undefined,
    requestTime: number,
  ): Promise<IActorDereferenceOutput> {
    if (isHardError(action.context)) {
      throw error;
    } else {
      this.logError(action.context, (<Error> error).message);
      return { url: action.url, data: emptyReadable(), exists: false, headers, requestTime };
    }
  }
}

export interface IActionDereference extends IAction {
  /**
   * The URL to dereference
   */
  url: string;
  /**
   * By default, actors will reject upon receiving non-200 HTTP responses.
   * If this option is true, then all HTTP responses will cause the action to resolve,
   * but some outputs may therefore contain empty quad streams.
   */
  acceptErrors?: boolean;
  /**
   * Optional HTTP method to use.
   * Defaults to GET.
   */
  method?: string;
  /**
   * Optional HTTP headers to pass.
   */
  headers?: Headers;
  /**
   * An optional callback to retrieve the mediaType mappings
   */
  mediaTypes?: () => Promise<Record<string, number> | undefined>;
}

interface IReadableClose extends NodeJS.ReadableStream {
  close?: () => void | Promise<void>;
}

export interface IActorDereferenceOutput extends IActorOutput {
  /**
   * The page on which the output was found.
   *
   * This is not necessarily the same as the original input url,
   * as this may have changed due to redirects.
   */
  url: string;
  /**
   * The resulting stream.
   * TODO: Make readable again
   */
  data: IReadableClose;
  /**
   * This will always be true, unless `acceptErrors` was set to true in the action and the dereferencing failed.
   */
  exists: boolean;
  /**
   * The time it took to request the page in milliseconds.
   * This is the time until the first byte arrives.
   */
  requestTime: number;
  /**
   * The returned headers of the final URL.
   */
  headers?: Headers;
  /**
   * The mediatype of the source
   */
  mediaType?: string;
}

export type IActorDereferenceArgs = IActorArgs<IActionDereference, IActorTest, IActorDereferenceOutput>;

export type MediatorDereference = Mediate<IActionDereference, IActorDereferenceOutput>;
