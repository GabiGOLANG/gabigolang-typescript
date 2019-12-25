import ExpressionVisitor from "../interfaces/ExpressionVisitor";
import * as Expr from "../parser/expressions";
import * as Stmt from "../parser/statements";
import { TokenType } from "../lexer/Token";
import {
  equal,
  not,
  greaterThanOrEqual,
  lessThanOrEqual,
  plus,
  minus,
  divide,
  times,
  greaterThan,
  lessThan,
  negate,
  isTruthy,
  mod
} from "../lib/Std";
import StatementVisitor from "../interfaces/StatementVisitor";
import Environment from "./environment/Environment";
import ObjectIsNotCallableException from "./exceptions/ObjectIsNotCallable";
import InvalidNumberOfArguments from "./exceptions/InvalidNumberOfArguments";
import { Statement } from "../parser/statements";
import BuiltinFunction from "./callable/BuiltinFunction";

export default class Interpreter
  implements ExpressionVisitor<any>, StatementVisitor<void> {
  private environment: Environment = new Environment();
  public globals: Environment = new Environment();

  public visitBinaryExpression(expression: Expr.Binary): any {
    const left = expression.left.accept(this);
    const right = expression.right.accept(this);

    switch (expression.operation.type) {
      case TokenType.PLUS:
        return plus(left, right);
      case TokenType.MINUS:
        return minus(left, right);
      case TokenType.SLASH:
        return divide(left, right);
      case TokenType.STAR:
        return times(left, right);
      case TokenType.GREATER:
        return greaterThan(left, right);
      case TokenType.GREATER_EQUAL:
        return greaterThanOrEqual(left, right);
      case TokenType.LESS:
        return lessThan(left, right);
      case TokenType.LESS_EQUAL:
        return lessThanOrEqual(left, right);
      case TokenType.BANG_EQUAL:
        return not(equal(left, right));
      case TokenType.EQUAL_EQUAL:
        return equal(left, right);
      case TokenType.MOD:
        return mod(left, right);
      default:
        return null;
    }
  }

  public visitUnaryExpression(expression: Expr.Unary): any {
    const right = expression.right.accept(this);

    switch (expression.operation.type) {
      case TokenType.BANG:
        return not(isTruthy(right));
      case TokenType.MINUS:
        return negate(right);
      default:
        return null;
    }
  }

  public visitGroupingExpression = (expression: Expr.Grouping): any =>
    expression.expression.accept(this);

  public visitLiteralExpression = (expression: Expr.Literal): any =>
    expression.value;

  public visitVariableExpression = (expression: Expr.Variable) =>
    this.environment.get(expression.name);

  public visitAssignExpression(expression: Expr.Assign) {
    const value = expression.value.accept(this);
    this.environment.assign(expression.name, value);
    return value;
  }

  public visitLogicalExpression(expression: Expr.Logical) {
    const left = expression.left.accept(this);

    if (expression.operator.type === TokenType.OR) {
      if (isTruthy(left)) {
        return left;
      }
    } else {
      if (not(isTruthy(left))) {
        return left;
      }
    }

    return expression.right.accept(this);
  }

  public visitCallExpression(expression: Expr.Call) {
    const callee = expression.callee.accept(this);

    if (not("__call" in callee)) {
      throw new ObjectIsNotCallableException(
        `Object ${JSON.stringify(callee, null, 2)} can't be called`
      );
    }

    const args: any = [];
    expression.args.forEach(arg => args.push(arg.accept(this)));

    if (not(equal(args.length, callee.arity()))) {
      throw new InvalidNumberOfArguments(
        `function ${callee.name()} expects ${callee.arity()}, got ${
          args.length
        }`
      );
    }

    return callee.__call(this, args);
  }

  public visitExpressionStatement = (statement: Stmt.Expression) =>
    statement.expression.accept(this);

  public visitPrintStatement = (statement: Stmt.Print) =>
    console.log(JSON.stringify(statement.expression.accept(this), null, 2));

  public visitLetStatement(statement: Stmt.Let) {
    const value = statement.initializer
      ? statement.initializer.accept(this)
      : null;

    this.environment.define(statement.name.lexeme as string, value);
  }

  public visitBlockStatement(statement: Stmt.Block) {
    this.executeBlock(
      statement.statements,
      new Environment().setParentEnvironment(this.environment)
    );
  }

  public executeBlock(block: Statement[], environment: Environment) {
    let previousEnvironment = this.environment;

    try {
      this.environment = environment;

      block.forEach(stmt => stmt.accept(this));
    } finally {
      this.environment = previousEnvironment;
    }
  }

  public visitIfStatement(statement: Stmt.If) {
    if (isTruthy(statement.condition.accept(this))) {
      statement.thenBranch.accept(this);
    } else if (statement.elseBranch) {
      statement.elseBranch.accept(this);
    }
  }

  public visitWhileStatement(statement: Stmt.While) {
    while (isTruthy(statement.condition.accept(this))) {
      statement.body.accept(this);
    }
  }

  public visitFunctionStatement(statement: Stmt.Function) {
    const fn = new BuiltinFunction(statement);
    this.environment.define(statement.name.lexeme as string, fn);
  }

  public interpret(statements: Stmt.Statement[]) {
    console.log("statements", statements);

    try {
      statements.forEach(statement => statement.accept(this));
    } catch (exception) {
      console.error(exception);
    }
  }
}
