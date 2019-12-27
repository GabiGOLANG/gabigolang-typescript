export default class ReturnException<T> extends Error {
  constructor(public value: T) {
    super();
  }
}
