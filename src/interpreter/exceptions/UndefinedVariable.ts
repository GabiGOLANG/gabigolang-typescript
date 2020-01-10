export default class UndefinedVariableException extends Error {
  constructor(variableName: string) {
    super(`Undefined variable <${variableName}>`);
  }
}
