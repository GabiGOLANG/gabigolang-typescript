export default class InvalidNumberOfArgumentsException extends Error {
  constructor(functionName: string, expected: number, got: number) {
    super(`<${functionName}> expected ${arguments} arguments , got ${got}`);
  }
}
