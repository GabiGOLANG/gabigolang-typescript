import Token, { TokenType } from "./Token";

const keywords = new Map<string, TokenType>([
  ["and", TokenType.AND],
  ["or", TokenType.OR],
  ["mod", TokenType.MOD],
  ["class", TokenType.CLASS],
  ["else", TokenType.ELSE],
  ["false", TokenType.FALSE],
  ["for", TokenType.FOR],
  ["function", TokenType.FUNCTION],
  ["if", TokenType.IF],
  ["null", TokenType.NULL],
  ["print", TokenType.PRINT],
  ["return", TokenType.RETURN],
  ["super", TokenType.SUPER],
  ["this", TokenType.THIS],
  ["true", TokenType.TRUE],
  ["let", TokenType.LET],
  ["const", TokenType.CONST],
  ["while", TokenType.WHILE],
  ["class", TokenType.CLASS],
  ["extends", TokenType.CLASS_EXTENDS],
  ["static", TokenType.STATIC]
]);

const tokens = new Map<string, TokenType>([
  ["(", TokenType.LEFT_PAREN],
  [")", TokenType.RIGHT_PAREN],
  ["{", TokenType.LEFT_BRACE],
  ["}", TokenType.RIGHT_BRACE],
  [",", TokenType.COMMA],
  [";", TokenType.SEMI_COLON],
  [".", TokenType.DOT],
  ["-", TokenType.MINUS],
  ["+", TokenType.PLUS],
  ["*", TokenType.STAR]
]);

export default class Lexer {
  private tokens: Token[] = [];

  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(private readonly source: string) {}

  private nextToken = (): string => this.source[this.current++];

  private endOfSource = (): boolean => this.current >= this.source.length;

  private isDigit = (character: string): boolean =>
    character >= "0" && character <= "9";

  private isAlpha = (character: string): boolean =>
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    character === "_";

  private peek = (offset: number = 0): string =>
    this.endOfSource() ? "\0" : this.source[this.current + offset];

  private match(expected: string): boolean {
    if (this.endOfSource() || this.source[this.current] !== expected) {
      return false;
    }

    ++this.current;
    return true;
  }

  private string(): void {
    while (this.peek() !== '"' && !this.endOfSource()) {
      if (this.peek() === "\n") {
        ++this.line;
      }
      this.nextToken();
    }

    if (this.endOfSource()) {
      return console.error(`Unterminated string on line <${this.line}>`);
    }

    this.nextToken();

    const expr = this.source.substring(this.start, this.current);
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.tokens.push(new Token(TokenType.STRING, expr, value, this.line));
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.nextToken();
    }

    if (this.peek() === "." && this.isDigit(this.peek(1))) {
      //if (and(equal(this.peek(), "."), this.isDigit(this.peek(1)))) {
      this.nextToken();

      while (this.isDigit(this.peek())) {
        this.nextToken();
      }
    }

    const value = this.source.substring(this.start, this.current);
    this.addToken(TokenType.NUMBER, parseInt(value));
  }

  private identifier(): void {
    while (this.isAlpha(this.peek())) {
      this.nextToken();
    }

    const expr = this.source.substring(this.start, this.current);
    const token_type = keywords.get(expr);
    this.addToken(token_type ?? TokenType.IDENTIFIER);
  }

  private addToken(type: TokenType, literal: any = null): void {
    const expr = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, expr, literal, this.line));
  }

  private scanToken(character: string): void {
    if (tokens.has(character)) {
      return this.addToken(tokens.get(character)!);
    }

    switch (character) {
      case "!":
        if (this.match("!")) {
          this.addToken(TokenType.DOUBLE_BANG);
        } else if (this.match("=")) {
          this.addToken(TokenType.BANG_EQUAL);
        } else {
          this.addToken(TokenType.BANG);
        }
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "?":
        if (this.match("?")) {
          this.addToken(TokenType.NULL_COALESCING);
        } else {
          console.error(
            `Unexpected character <${character}> on line <${this.line}>`
          );
        }

        break;
      case "/":
        if (this.match("/")) {
          while (this.peek() !== "\n" && !this.endOfSource()) {
            this.nextToken();
          }
        } else if (this.match("*")) {
          const blockCommentStart = this.line;

          while (
            this.peek() !== "*" &&
            this.peek(1) !== "/" &&
            !this.endOfSource()
          ) {
            if (this.nextToken() === "\n") {
              ++this.line;
            }
          }

          if (this.endOfSource()) {
            console.error(
              `Unterminated block comment starting at line <${blockCommentStart}>`
            );
          }

          this.nextToken(); // consume *
          this.nextToken(); // consume /
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        ++this.line;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(character)) {
          this.number();
        } else if (this.isAlpha(character)) {
          this.identifier();
        } else {
          console.error(
            `Unexpected character <${character}> on line <${this.line}>`
          );
        }
        break;
    }
  }

  public lex(): Token[] {
    while (!this.endOfSource()) {
      this.start = this.current;
      this.scanToken(this.nextToken());
    }

    this.tokens.push(new Token(TokenType.END_OF_FILE, "", null, this.line));
    return this.tokens;
  }
}
