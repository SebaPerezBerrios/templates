import { Cursor } from 'mongoose';
import { from, Observable } from 'rxjs';
import { PassThrough, Readable } from 'stream';
import * as m from 'monet';
import { iterateToObservable } from './observableStream';

export async function iterateSeedAccum<T extends NonNullable<unknown>, K>(
  seed: () => Promise<m.Maybe<T>>,
  process: (input: T) => Promise<K>
): Promise<K[]> {
  const resultBuffer: K[] = [];

  await iterateSeed<T>(seed, async (input) => {
    resultBuffer.push(await process(input));
  });

  return resultBuffer;
}

export async function iterateSeed<T extends NonNullable<unknown>>(
  seed: () => Promise<m.Maybe<T>>,
  process: (input: T) => Promise<void>
): Promise<void> {
  return seed().then(async (res) => {
    if (res.isJust()) {
      return await process(res.just()).then(() => iterateSeed(seed, process));
    }
    return;
  });
}

export const batchStream = (stream: Readable, size: number): PassThrough => {
  let buffer: unknown[] = [];
  const output = new PassThrough();
  stream.on('data', (data) => {
    if (buffer.length === size) {
      output.emit('data', buffer);
      buffer = [];
    }
    buffer.push(data);
  });
  stream.on('end', () => {
    if (buffer.length) {
      output.emit('data', buffer);
    }
    output.emit('end');
  });
  return output;
};

export async function iterateCursor<T, K>(
  cursor: Cursor<T>,
  batchSize: number,
  processDocs: (docs: T[]) => Promise<K>
) {
  const seed = makeSeed<T>(batchSize, cursor);

  return await iterateSeedAccum(seed, processDocs);
}

export function iterateCursorObservable<T, K>(
  cursor: Cursor<T>,
  batchSize: number,
  processDocs: (docs: T[]) => Observable<K>
) {
  const seed = makeSeed<T>(batchSize, cursor);

  return iterateToObservable(() => from(seed()), processDocs);
}

function makeSeed<T>(batchSize: number, cursor: Cursor<T>) {
  return async () => {
    const buffer: T[] = [];
    try {
      for (let index = 0; index < batchSize; index++) {
        const doc = await cursor.next();
        if (doc) {
          buffer.push(doc);
        } else {
          break;
        }
      }
    } catch {
      return m.Nothing<T[]>();
    }
    if (buffer.length) {
      return m.Just<T[]>(buffer);
    }
    return m.Nothing<T[]>();
  };
}

export function streamToObservable<T>(stream: Readable): Observable<T> {
  return new Observable((subscriber) => {
    stream.on('data', (data) => {
      subscriber.next(data);
    });
    stream.on('error', (err) => {
      subscriber.error(err);
    });
    stream.on('end', () => {
      subscriber.complete();
    });
  });
}
