export default class InvalidNumberOfArguments extends Error {
  constructor(message: string) {
    super(message);
  }
}
