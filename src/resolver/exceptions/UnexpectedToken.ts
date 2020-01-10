export default class UnexpectedTokenException extends Error {
  constructor(tokenName: string) {
    super(`unexpected <${tokenName}>`);
  }
}
