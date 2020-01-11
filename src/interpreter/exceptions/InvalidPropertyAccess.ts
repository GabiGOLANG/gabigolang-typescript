export default class InvalidPropertyAccessException extends Error {
  constructor(propertyName: string) {
    super(`Tried to access property <${propertyName}> not on object`);
  }
}
