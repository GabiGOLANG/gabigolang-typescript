export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  MOD,
  SEMICOLON,
  SLASH,
  STAR,
  NULL_COALESCING,

  // One or two character tokens.
  BANG,
  DOUBLE_BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals.
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords.
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUNCTION,
  FOR,
  IF,
  NULL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  LET,
  CONST,
  WHILE,
  END_OF_FILE
}

type Primitive = string | number | boolean;

export default class Token {
  constructor(
    public readonly type: TokenType,
    public readonly lexeme: Primitive,
    public readonly literal: any,
    public readonly line: number
  ) {}

  public toString = () => `${this.type} ${this.lexeme} ${this.literal}`;
}
