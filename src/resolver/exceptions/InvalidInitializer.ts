export default class InvalidInitializerException extends Error {
  constructor(initializer: any) {
    super(`invalid initializer <${initializer.toString()}>`);
  }
}
