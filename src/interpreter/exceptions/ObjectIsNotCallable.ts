export default class ObjectIsNotCallableException extends Error {
  constructor(object: any) {
    super(`Object <${object.toString()}> is not callable`);
  }
}
