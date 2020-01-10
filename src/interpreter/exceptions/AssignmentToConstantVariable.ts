export default class AssignmentToConstantVariableException extends Error {
  constructor(identifier: string) {
    super(`Assignment to constant variable <${identifier}>`);
  }
}
