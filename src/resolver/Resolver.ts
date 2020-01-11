import ExpressionVisitor from "../interfaces/ExpressionVisitor";
import StatementVisitor from "../interfaces/StatementVisitor";
import * as Stmt from "../parser/statements";
import * as Expr from "../parser/expressions";
import Token from "../lexer/Token";
import InvalidInitializerException from "./exceptions/InvalidInitializer";
import Interpreter from "../interpreter/Interpreter";
import UnexpectedTokenException from "./exceptions/UnexpectedToken";
import { equal, not } from "../lib/Std";

enum ScopeTypes {
  NONE,
  FUNCTION,
  METHOD,
  CLASS_CONSTRUCTOR
}

export default class Resolver
  implements ExpressionVisitor<void>, StatementVisitor<void> {
  private currentScopeType: ScopeTypes = ScopeTypes.NONE;

  private scopes: Map<string, boolean>[] = [];

  constructor(private interpreter: Interpreter) {}

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private getCurrentScope = (): Map<string, boolean> =>
    this.scopes[this.scopes.length - 1];

  private declare(token: Token): void {
    if (equal(this.scopes.length, 0)) {
      return;
    }

    const variableName = token.lexeme as string;

    const currentScope = this.getCurrentScope();
    if (currentScope.has(variableName)) {
      console.error(`Redeclaring variable <${variableName}>`);
    } else {
      currentScope.set(variableName, false);
    }
  }

  private define(token: Token): void {
    if (equal(this.scopes.length, 0)) {
      return;
    }

    const currentScope = this.getCurrentScope();
    currentScope.set(token.lexeme as string, true);
  }

  private resolveLocal(expression: Expr.Expression, token: Token): void {
    const scopesCount = this.scopes.length - 1;

    for (let i = scopesCount; i > -1; --i) {
      if (this.scopes[i].has(token.lexeme as string)) {
        this.interpreter.resolve(expression, scopesCount - i);
        return;
      }
    }
  }

  private resolveFunction(
    statement: Stmt.Function,
    scopeType: ScopeTypes
  ): void {
    const parentScopeType = this.currentScopeType;
    this.currentScopeType = scopeType;

    this.beginScope();

    for (const param of statement.params) {
      this.declare(param);
      this.define(param);
    }
    for (const stmt of statement.body) {
      stmt.accept(this);
    }

    this.endScope();

    this.currentScopeType = parentScopeType;
  }

  public visitBlockStatement(statement: Stmt.Block): void {
    this.beginScope();

    for (const stmt of statement.statements) {
      stmt.accept(this);
    }

    this.endScope();
  }

  public visitLetStatement(statement: Stmt.Let): void {
    this.declare(statement.name);

    if (statement.initializer) {
      statement.initializer.accept(this);
    }

    this.define(statement.name);
  }

  public visitConstStatement(statement: Stmt.Const): void {
    this.declare(statement.name);
    statement.initializer.accept(this);
    this.define(statement.name);
  }

  public visitVariableExpression(expression: Expr.Variable): void {
    if (
      this.scopes.length > 0 &&
      this.getCurrentScope().get(expression.name.lexeme as string) === false
    ) {
      throw new InvalidInitializerException(expression.name.lexeme as string);
    }

    this.resolveLocal(expression, expression.name);
  }

  public visitAssignExpression(expression: Expr.Assign): void {
    expression.value.accept(this);
    this.resolveLocal(expression, expression.name);
  }

  public visitFunctionStatement(statement: Stmt.Function): void {
    this.declare(statement.name);
    this.define(statement.name);
    this.resolveFunction(statement, ScopeTypes.FUNCTION);
  }

  public visitExpressionStatement(statement: Stmt.Expression): void {
    statement.expression.accept(this);
  }

  public visitIfStatement(statement: Stmt.If): void {
    statement.condition.accept(this);
    statement.thenBranch.accept(this);
    if (statement.elseBranch) {
      statement.elseBranch.accept(this);
    }
  }

  public visitPrintStatement(statement: Stmt.Print): void {
    statement.expression.accept(this);
  }

  public visitReturnStatement(statement: Stmt.Return): void {
    if (equal(this.currentScopeType, ScopeTypes.NONE)) {
      throw new UnexpectedTokenException(statement.keyword.lexeme as string);
    }

    if (equal(this.currentScopeType, ScopeTypes.CLASS_CONSTRUCTOR)) {
      console.error("Invalid <return> statement from class constructor");
    }

    if (statement.value) {
      statement.value.accept(this);
    }
  }

  public visitWhileStatement(statement: Stmt.While): void {
    statement.condition.accept(this);
    statement.body.accept(this);
  }

  public visitClassStatement(statement: Stmt.Class): void {
    const parentScopeType = this.currentScopeType;
    this.currentScopeType = ScopeTypes.METHOD;

    if (equal(statement.name.lexeme as string, "constructor")) {
      this.currentScopeType = ScopeTypes.CLASS_CONSTRUCTOR;
    }

    this.define(statement.name);
    this.declare(statement.name);

    this.beginScope();
    this.getCurrentScope().set("this", true);

    for (const method of statement.methods) {
      this.resolveFunction(method, ScopeTypes.METHOD);
    }

    this.endScope();

    this.currentScopeType = parentScopeType;
  }

  public visitBinaryExpression(expression: Expr.Binary): void {
    expression.left.accept(this);
    expression.right.accept(this);
  }

  public visitCallExpression(expression: Expr.Call): void {
    expression.callee.accept(this);

    for (const argument of expression.args) {
      argument.accept(this);
    }
  }

  public visitAccessObjectPropertyExpression(
    expression: Expr.AccessObjectProperty
  ): void {
    expression.object.accept(this);
  }

  public visitGroupingExpression(expression: Expr.Grouping): void {
    expression.expression.accept(this);
  }

  public visitLiteralExpression(expression: Expr.Literal): void {
    /** no-op */
  }

  public visitLogicalExpression(expression: Expr.Logical): void {
    expression.left.accept(this);
    expression.right.accept(this);
  }

  public visitSetObjectPropertyExpression(
    expression: Expr.SetObjectProperty
  ): void {
    expression.value.accept(this);
    expression.object.accept(this);
  }

  public visitThisExpression(expression: Expr.This): void {
    if (not(equal(this.currentScopeType, ScopeTypes.METHOD))) {
      console.error("Invalid use of <this> outside of class instance");
      return;
    }
    this.resolveLocal(expression, expression.name);
  }

  public visitUnaryExpression(expression: Expr.Unary): void {
    expression.right.accept(this);
  }

  public resolve(statements: Stmt.Statement[]): this {
    for (const statement of statements) {
      statement.accept(this);
    }

    return this;
  }
}
