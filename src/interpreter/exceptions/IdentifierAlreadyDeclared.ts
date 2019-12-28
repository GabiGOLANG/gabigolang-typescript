export default class IdentifierAlreadyDeclared extends Error {
  constructor(identifier: string) {
    super(`Identifier '${identifier}' has already been declared`);
  }
}
