import Token, { TokenType } from "../lexer/Token"
import { Maybe } from "../lib/Std"
import * as Expr from "./expressions"
import * as Stmt from "./statements"
import ParserException from "./exceptions/ParserException"

interface ParserResult {
  readonly ok: boolean
  readonly statements: Stmt.Statement[]
}

export default class Parser {
  private current: number = 0
  private hasError: boolean = false

  constructor(private tokens: Token[]) {}

  private previous = (): Token => this.tokens[this.current - 1]

  private peek = (offset: number = 0): Token =>
    this.tokens[this.current + offset]

  private endOfSource = () => this.peek().type === TokenType.END_OF_FILE

  private synchronize(): void {
    this.advance()

    while (!this.endOfSource()) {
      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNCTION:
        case TokenType.LET:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return
      }

      this.advance()
    }
  }

  private advance(): Token {
    if (!this.endOfSource()) {
      ++this.current
    }
    return this.previous()
  }

  private check = (type: TokenType): boolean =>
    this.endOfSource() ? false : this.peek().type === type

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  private error(token: Token, message: string): void {
    if (token.type === TokenType.END_OF_FILE) {
      console.error(token.line, " at end", message)
    } else {
      console.error(token.line, ` at "${token.lexeme}"`, message)
    }

    this.hasError = true
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance()
    }

    this.error(this.peek(), message)
    throw new ParserException()
  }

  private primary(): Expr.Expression {
    if (this.match(TokenType.FALSE)) {
      return new Expr.Literal(false)
    }
    if (this.match(TokenType.TRUE)) {
      return new Expr.Literal(true)
    }
    if (this.match(TokenType.NULL)) {
      return new Expr.Literal(null)
    }
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous().literal)
    }
    if (this.match(TokenType.THIS)) {
      return new Expr.This(this.previous())
    }
    if (this.match(TokenType.SUPER)) {
      return new Expr.Super(this.previous())
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Expr.Variable(this.previous())
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression()
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
      return new Expr.Grouping(expr)
    }

    this.error(this.peek(), "Expression Expected")
    throw new ParserException()
  }

  private finishCall(callee: Expr.Expression): Expr.Expression {
    const args: Expr.Expression[] = []

    if (!this.check(TokenType.RIGHT_PAREN)) {
      while (true) {
        args.push(this.expression())

        if (arguments.length > 254) {
          this.error(
            this.peek(),
            "A function can't take more than 254 arguments"
          )
        }

        if (!this.match(TokenType.COMMA)) {
          break
        }
      }
    }

    const parenteses = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after function arguments"
    )

    return new Expr.Call(callee, parenteses, args)
  }

  private call(): Expr.Expression {
    let expr = this.primary()

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr)
      } else if (this.match(TokenType.DOT)) {
        const propertyName = this.consume(
          TokenType.IDENTIFIER,
          "Expect property name after object access operator"
        )

        const isSuperClassProperty =
          this.tokens[this.current - 3].type === TokenType.SUPER

        expr = new Expr.AccessObjectProperty(
          expr,
          propertyName,
          isSuperClassProperty
        )
      } else {
        break
      }
    }

    return expr
  }

  private unary(): Expr.Expression {
    if (this.match(TokenType.BANG, TokenType.DOUBLE_BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new Expr.Unary(operator, right)
    }

    return this.call()
  }

  private nullCoalescing(): Expr.Expression {
    let expr = this.unary()

    while (this.match(TokenType.NULL_COALESCING)) {
      const operator = this.previous()
      const right = this.expression()
      expr = new Expr.Binary(expr, operator, new Expr.Literal(right))
    }

    return expr
  }

  private multiplication(): Expr.Expression {
    let expr = this.nullCoalescing()

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous()
      const right = this.unary()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private mod(): Expr.Expression {
    let expr = this.multiplication()

    while (this.match(TokenType.MOD)) {
      const operator = this.previous()
      const right = this.multiplication()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private addition(): Expr.Expression {
    let expr = this.mod()

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous()
      const right = this.mod()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private comparison(): Expr.Expression {
    let expr = this.addition()

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LEFT_BRACE,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous()
      const right = this.addition()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private equality(): Expr.Expression {
    let expr = this.comparison()

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private expressionStatement(): Stmt.Statement {
    const expr = this.expression()

    return new Stmt.Expression(expr)
  }

  private printStatement(): Stmt.Statement {
    const value = this.expression()

    return new Stmt.Print(value)
  }

  private block(): Stmt.Statement[] {
    const statements: Stmt.Statement[] = []

    while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfSource()) {
      statements.push(this.declaration()!)
    }

    this.consume(TokenType.RIGHT_BRACE, " Expect '}' after block.")
    return statements
  }

  private ifStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'")
    const condition = this.expression()

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if")

    const thenBranch = this.statement()
    const elseBranch = this.match(TokenType.ELSE) ? this.statement() : null

    return new Stmt.If(condition, thenBranch, elseBranch)
  }

  private whileStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after while statement")
    const condition = this.expression()

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while condition")
    const body = this.statement()

    return new Stmt.While(condition, body)
  }

  private forStatement(): Stmt.Statement {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after for keyword")

    const initializer: Maybe<Stmt.Statement> = this.match(TokenType.LET)
      ? this.letDeclaration()
      : this.expressionStatement()

    this.consume(TokenType.SEMI_COLON, "Expect ';' after for loop initializer")

    let condition: Maybe<Expr.Expression> = !this.check(TokenType.SEMI_COLON)
      ? this.expression()
      : null

    this.consume(TokenType.SEMI_COLON, "Expect ';' after for loop condition")

    const increment = !this.check(TokenType.RIGHT_PAREN)
      ? this.expression()
      : null

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for loop statement")

    let body: Maybe<Stmt.Statement> = this.statement()

    body = increment
      ? new Stmt.Block([body, new Stmt.Expression(increment)])
      : null

    if (!condition) {
      condition = new Expr.Literal(true)
    }

    body = new Stmt.While(condition!, body!)

    if (initializer) {
      body = new Stmt.Block([initializer, body])
    }

    return body
  }

  private returnStatement(): Stmt.Statement {
    const keyword = this.previous()

    const value = this.check(TokenType.RIGHT_BRACE) ? null : this.expression()

    return new Stmt.Return(keyword, value)
  }

  private statement(): Stmt.Statement {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement()
    }
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement()
    }
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement()
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return new Stmt.Block(this.block())
    }
    if (this.match(TokenType.FOR)) {
      return this.forStatement()
    }
    if (this.match(TokenType.IF)) {
      return this.ifStatement()
    }

    return this.expressionStatement()
  }

  private and(): Expr.Expression {
    let expr = this.equality()

    while (this.match(TokenType.AND)) {
      const operator = this.previous()
      const right = this.equality()
      expr = new Expr.Logical(expr, operator, right)
    }

    return expr
  }

  private or(): Expr.Expression {
    let expr = this.and()

    while (this.match(TokenType.OR)) {
      const operator = this.previous()
      const right = this.and()
      expr = new Expr.Logical(expr, operator, right)
    }

    return expr
  }

  private assignment(): Expr.Expression {
    const expr = this.or()

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous()
      const value = this.assignment()

      if (expr instanceof Expr.Variable) {
        return new Expr.Assign(expr.name, value)
      } else if (expr instanceof Expr.AccessObjectProperty) {
        return new Expr.SetObjectProperty(expr.object, expr.token, value)
      }

      this.error(equals, "Invalid assignment target")
    }

    return expr
  }

  private expression = (): Expr.Expression => this.assignment()

  private functionDeclaration(kind: string): Stmt.Function {
    const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name`)
    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name`)

    const parameters: Token[] = []

    if (!this.check(TokenType.RIGHT_PAREN)) {
      while (true) {
        if (parameters.length > 254) {
          this.error(this.peek(), `${kind} can't have more than 254 parameters`)
        }

        parameters.push(
          this.consume(TokenType.IDENTIFIER, `Expect ${kind} parameter name`)
        )

        if (!this.match(TokenType.COMMA)) {
          break
        }
      }
    }

    this.consume(TokenType.RIGHT_PAREN, `Expect ')' after ${kind} parameters`)
    this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind}} body`)

    const body: Stmt.Statement[] = this.block()
    return new Stmt.Function(name, parameters, body)
  }

  private letDeclaration(): Stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name")
    const initializer = this.match(TokenType.EQUAL) ? this.expression() : null

    return new Stmt.Let(name, initializer)
  }

  private constDeclaration(): Stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name")
    this.consume(
      TokenType.EQUAL,
      `Expect initializer for const variable '${name.lexeme}'`
    )
    const initializer = this.expression()
    return new Stmt.Const(name, initializer)
  }

  private classDeclaration(): Stmt.Statement {
    const className = this.consume(
      TokenType.IDENTIFIER,
      "Expect identifier after class keyword"
    )

    let superclass: Maybe<Expr.Variable> = null
    if (this.match(TokenType.CLASS_EXTENDS)) {
      this.consume(TokenType.IDENTIFIER, "Expect superclass name")
      superclass = new Expr.Variable(this.previous())
    }

    this.consume(TokenType.LEFT_BRACE, "Expect { after class identifier")

    const classMethods: Stmt.Function[] = []
    const staticMethods: Stmt.Function[] = []

    while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfSource()) {
      if (this.check(TokenType.STATIC)) {
        this.advance()
        staticMethods.push(this.functionDeclaration("static method"))
      } else {
        classMethods.push(this.functionDeclaration("method"))
      }
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect } after class body")
    return new Stmt.Class(className, superclass, classMethods, staticMethods)
  }

  private declaration(): Maybe<Stmt.Statement> {
    try {
      if (this.match(TokenType.CLASS)) {
        return this.classDeclaration()
      }
      if (this.match(TokenType.FUNCTION)) {
        return this.functionDeclaration("function")
      }
      if (this.match(TokenType.LET)) {
        return this.letDeclaration()
      }
      if (this.match(TokenType.CONST)) {
        return this.constDeclaration()
      }

      return this.statement()
    } catch (exception) {
      this.synchronize()
      return null
    }
  }

  public parse(): ParserResult {
    const statements: any = []

    while (!this.endOfSource()) {
      statements.push(this.declaration())
    }

    return { ok: !this.hasError, statements }
  }
}
