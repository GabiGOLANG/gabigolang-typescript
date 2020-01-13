export default class InvalidNumberOfArgumentsException extends Error {
  constructor(functionName: string, expected: number, got: number) {
    super(`<${functionName}> expected ${expected} arguments , got ${got}`);
  }
}
