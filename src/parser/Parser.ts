import Token, { TokenType } from "../lexer/Token";
import { not, equal, and, Maybe } from "../lib/Std";
import * as Expr from "./expressions";
import * as Stmt from "./statements";
import ParserException from "./exceptions/ParserException";

interface ParserResult {
  readonly ok: boolean;
  readonly statements: Stmt.Statement[];
}

export default class Parser {
  private current: number = 0;
  private hasError: boolean = false;

  constructor(private tokens: Token[]) {}

  private previous = (): Token => this.tokens[this.current - 1];

  private peek = (offset: number = 0): Token =>
    this.tokens[this.current + offset];

  private endOfSource = () => equal(this.peek().type, TokenType.END_OF_FILE);

  private synchronize(): void {
    this.advance();

    while (not(this.endOfSource())) {
      if (equal(this.previous().type, TokenType.SEMICOLON)) {
        return;
      }

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNCTION:
        case TokenType.LET:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private advance(): Token {
    if (not(this.endOfSource())) {
      ++this.current;
    }
    return this.previous();
  }

  private check = (type: TokenType): boolean =>
    this.endOfSource() ? false : equal(this.peek().type, type);

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private error(token: Token, message: string): void {
    if (equal(token.type, TokenType.END_OF_FILE)) {
      console.error(token.line, " at end", message);
    } else {
      console.error(token.line, ` at "${token.lexeme}"`, message);
    }

    this.hasError = true;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    this.error(this.peek(), message);
    throw new ParserException();
  }

  private primary(): Expr.Expression {
    if (this.match(TokenType.FALSE)) {
      return new Expr.Literal(false);
    }
    if (this.match(TokenType.TRUE)) {
      return new Expr.Literal(true);
    }
    if (this.match(TokenType.NULL)) {
      return new Expr.Literal(null);
    }
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    this.error(this.peek(), "Expression Expected");
    throw new ParserException();
  }

  private finishCall(callee: Expr.Expression): Expr.Expression {
    const args: Expr.Expression[] = [];

    if (not(this.check(TokenType.RIGHT_PAREN))) {
      while (true) {
        args.push(this.expression());

        if (arguments.length > 254) {
          this.error(
            this.peek(),
            "A function can't take more than 254 arguments"
          );
        }

        if (not(this.match(TokenType.COMMA))) {
          break;
        }
      }
    }

    const parenteses = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after function arguments"
    );

    return new Expr.Call(callee, parenteses, args);
  }

  private call(): Expr.Expression {
    let expr = this.primary();

    while (this.match(TokenType.LEFT_PAREN)) {
      expr = this.finishCall(expr);
    }

    return expr;
  }

  private unary(): Expr.Expression {
    if (this.match(TokenType.BANG, TokenType.DOUBLE_BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.call();
  }

  private nullCoalescing(): Expr.Expression {
    let expr = this.unary();

    while (this.match(TokenType.NULL_COALESCING)) {
      const operator = this.previous();
      const right = this.expression();
      expr = new Expr.Binary(expr, operator, new Expr.Literal(right));
    }

    return expr;
  }

  private multiplication(): Expr.Expression {
    let expr = this.nullCoalescing();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private mod(): Expr.Expression {
    let expr = this.multiplication();

    while (this.match(TokenType.MOD)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private addition(): Expr.Expression {
    let expr = this.mod();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.mod();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr.Expression {
    let expr = this.addition();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LEFT_BRACE,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr.Expression {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private expressionStatement(): Stmt.Statement {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression");
    return new Stmt.Expression(expr);
  }

  private printStatement(): Stmt.Statement {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private block(): Stmt.Statement[] {
    const statements: Stmt.Statement[] = [];

    while (
      and(not(this.check(TokenType.RIGHT_BRACE)), not(this.endOfSource()))
    ) {
      statements.push(this.declaration()!);
    }

    this.consume(TokenType.RIGHT_BRACE, " Expect '}' after block.");
    return statements;
  }

  private ifStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if");

    const thenBranch = this.statement();
    const elseBranch = this.match(TokenType.ELSE) ? this.statement() : null;

    return new Stmt.If(condition, thenBranch, elseBranch);
  }

  private whileStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after while statement");
    const condition = this.expression();

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while condition");
    const body = this.statement();

    return new Stmt.While(condition, body);
  }

  private forStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after for keyword");

    const initializer: Maybe<Stmt.Statement> = this.match(TokenType.LET)
      ? this.letDeclaration()
      : this.expressionStatement();

    let condition: Maybe<Expr.Expression> = not(this.check(TokenType.SEMICOLON))
      ? this.expression()
      : null;

    this.consume(TokenType.SEMICOLON, "Expect ';' after for loop condition");

    const increment = not(this.check(TokenType.RIGHT_PAREN))
      ? this.expression()
      : null;

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for loop statement");

    let body: Maybe<Stmt.Statement> = this.statement();

    body = increment
      ? new Stmt.Block([body, new Stmt.Expression(increment)])
      : null;

    if (not(condition)) {
      condition = new Expr.Literal(true);
    }

    body = new Stmt.While(condition!, body!);

    if (initializer) {
      body = new Stmt.Block([initializer, body]);
    }

    return body;
  }

  private returnStatement(): Stmt.Statement {
    const keyword = this.previous();

    const value = not(this.check(TokenType.SEMICOLON))
      ? this.expression()
      : null;

    this.consume(TokenType.SEMICOLON, "Expect ';' after return statement");
    return new Stmt.Return(keyword, value);
  }

  private statement(): Stmt.Statement {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return new Stmt.Block(this.block());
    }
    if (this.match(TokenType.FOR)) {
      return this.forStatement();
    }
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }

    return this.expressionStatement();
  }

  private and(): Expr.Expression {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private or(): Expr.Expression {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private assignment(): Expr.Expression {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Expr.Variable)
        return new Expr.Assign(expr.name, value);

      this.error(equals, "Invalid assignment target");
    }

    return expr;
  }

  private expression = (): Expr.Expression => this.assignment();

  private function(kind: string): Stmt.Function {
    const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name`);
    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name`);

    const parameters: Token[] = [];

    if (not(this.check(TokenType.RIGHT_PAREN))) {
      while (true) {
        if (parameters.length > 254) {
          this.error(
            this.peek(),
            `${kind} can't have more than 254 parameters`
          );
        }

        parameters.push(
          this.consume(TokenType.IDENTIFIER, `Expect ${kind} parameter name`)
        );

        if (not(this.match(TokenType.COMMA))) {
          break;
        }
      }
    }

    this.consume(TokenType.RIGHT_PAREN, `Expect ')' after ${kind} parameters`);
    this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind}} body`);

    const body: Stmt.Statement[] = this.block();
    return new Stmt.Function(name, parameters, body);
  }

  private letDeclaration(): Stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");
    const initializer = this.match(TokenType.EQUAL) ? this.expression() : null;

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return new Stmt.Let(name, initializer);
  }

  private constDeclaration(): Stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");
    this.consume(
      TokenType.EQUAL,
      `Expect initializer for const variable '${name.lexeme}'`
    );
    const initializer = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return new Stmt.Const(name, initializer);
  }

  private declaration(): Maybe<Stmt.Statement> {
    try {
      if (this.match(TokenType.FUNCTION)) {
        return this.function("function");
      }
      if (this.match(TokenType.LET)) {
        return this.letDeclaration();
      }
      if (this.match(TokenType.CONST)) {
        return this.constDeclaration();
      }

      return this.statement();
    } catch (exception) {
      this.synchronize();
      return null;
    }
  }

  public parse(): ParserResult {
    const statements: any = [];

    while (not(this.endOfSource())) {
      statements.push(this.declaration());
    }

    return { ok: not(this.hasError), statements };
  }
}
