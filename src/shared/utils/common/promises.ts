export function sequentialPromise<T>(arr: (() => Promise<T>)[]) {
  return arr.reduce(
    (accPromise, f) =>
      accPromise.then((arr) =>
        f().then((res) => {
          arr.push(res);
          return arr;
        })
      ),
    Promise.resolve([] as T[])
  );
}
