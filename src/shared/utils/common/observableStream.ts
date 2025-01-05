import { concat, mergeMap, Observable, of } from 'rxjs';
import * as m from 'monet';

export function intercalateProcess<T, K, P>(
  seed: P,
  gen: (seed: P) => Observable<{ seed: P; data: T }>,
  process: (input: T) => Observable<K>
): Observable<K> {
  return gen(seed).pipe(mergeMap((input) => concat(process(input.data), intercalateProcess(input.seed, gen, process))));
}

export function iterateToObservable<T extends NonNullable<unknown>, K>(
  iterable: () => Observable<m.Maybe<T>>,
  process: (input: T) => Observable<K>
): Observable<K> {
  return iterable().pipe(
    mergeMap((maybeData) => {
      if (maybeData.isJust()) return concat(process(maybeData.just()), iterateToObservable(iterable, process));
      return of();
    })
  );
}
