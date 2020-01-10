export default class ObjectIsNotCallableException extends Error {
  constructor(object: any) {
    super(`object <${object.toString()}> is not callable`);
  }
}
