export default class InvalidInitializerException extends Error {
  constructor(initializer: any) {
    super(`Invalid initializer <${initializer}>`);
  }
}
