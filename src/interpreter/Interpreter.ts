import ExpressionVisitor from "../interfaces/ExpressionVisitor"
import * as Expr from "../parser/expressions"
import * as Stmt from "../parser/statements"
import { TokenType } from "../lexer/Token"
import StatementVisitor from "../interfaces/StatementVisitor"
import Environment from "./environment/Environment"
import ObjectIsNotCallableException from "./exceptions/ObjectIsNotCallable"
import InvalidNumberOfArgumentsException from "./exceptions/InvalidNumberOfArguments"
import { Statement } from "../parser/statements"
import BuiltinFunction from "./builtins/callable/BuiltinFunction"
import ReturnException from "./exceptions/Return"
import { Expression } from "../parser/expressions"
import BuiltinClass from "./builtins/class/BuiltinClass"
import RuntimeException from "./exceptions/Runtime"

export default class Interpreter
  implements ExpressionVisitor<any>, StatementVisitor<void> {
  public globals: Environment = new Environment()
  private locals: Map<Expression, number> = new Map<Expression, number>()
  private environment: Environment = new Environment().setParentEnvironment(
    this.globals
  )

  public getEnvironment = (): Environment => this.environment

  public visitBinaryExpression(expression: Expr.Binary): any {
    const left = expression.left.accept(this)
    const right = expression.right.accept(this)

    switch (expression.operation.type) {
      case TokenType.PLUS:
        return left + right
      case TokenType.MINUS:
        return left - right
      case TokenType.SLASH:
        return left / right
      case TokenType.STAR:
        return left * right
      case TokenType.GREATER:
        return left > right
      case TokenType.GREATER_EQUAL:
        return left >= right
      case TokenType.LESS:
        return left < right
      case TokenType.LESS_EQUAL:
        return left <= right
      case TokenType.BANG_EQUAL:
        return left !== right
      case TokenType.EQUAL_EQUAL:
        return left === right
      case TokenType.MOD:
        return left % right
      case TokenType.NULL_COALESCING:
        return this.visitNullCoalescingExpression(left, right)
      default:
        return null
    }
  }

  private visitNullCoalescingExpression(left: Expression, right: Expression) {
    if (left !== null) {
      const result = left.accept(this)
      return result !== null ? result : right.accept(this)
    }
    return right.accept(this)
  }

  private lookUpVariable(expression: Expr.Variable) {
    const scopeDistance = this.locals.get(expression)

    return scopeDistance
      ? this.environment.getAtScope(scopeDistance, expression.name)
      : this.environment.get(expression.name)
  }

  public visitUnaryExpression(expression: Expr.Unary): any {
    const right = expression.right.accept(this)

    switch (expression.operation.type) {
      case TokenType.BANG:
        return !right
      case TokenType.DOUBLE_BANG:
        return !!right
      case TokenType.MINUS:
        return -right
      default:
        return null
    }
  }

  public visitGroupingExpression = (expression: Expr.Grouping): any =>
    expression.expression.accept(this)

  public visitLiteralExpression = (expression: Expr.Literal): any =>
    expression.value

  public visitVariableExpression = (expression: Expr.Variable) =>
    this.lookUpVariable(expression)

  public visitAssignExpression(expression: Expr.Assign) {
    const scopeDistance = this.locals.get(expression)

    const value = expression.value.accept(this)

    if (scopeDistance) {
      this.environment.assignAtScope(scopeDistance, expression.name, value)
    } else {
      this.environment.assign(expression.name, value)
    }

    return value
  }

  public visitLogicalExpression(expression: Expr.Logical) {
    const left = expression.left.accept(this)

    if (expression.operator.type === TokenType.OR) {
      if (left) {
        return left
      }
    } else {
      if (left) {
        return left
      }
    }

    return expression.right.accept(this)
  }

  public visitSetObjectPropertyExpression(expression: Expr.SetObjectProperty) {
    const object = expression.object.accept(this)

    if (!(object instanceof BuiltinClass)) {
      throw new RuntimeException(`Object <${object}> is not a class instance`)
    }

    const value = expression.value.accept(this)
    const propertyName = expression.token.lexeme as string
    object.setProperty(propertyName, value)
  }

  public visitThisExpression = (expression: Expr.This) =>
    this.lookUpVariable(expression)

  public visitSuperExpression = (expression: Expr.Super) =>
    this.lookUpVariable(expression)

  public visitCallExpression(expression: Expr.Call) {
    const callee = expression.callee.accept(this)

    if (!("__call" in callee)) {
      throw new ObjectIsNotCallableException(callee)
    }

    const args: any = []
    expression.args.forEach(arg => args.push(arg.accept(this)))

    if (args.length !== callee.__arity()) {
      throw new InvalidNumberOfArgumentsException(
        callee.__name(),
        callee.__arity(),
        args.length
      )
    }

    return callee.__call(this, args)
  }

  public visitAccessObjectPropertyExpression(
    expression: Expr.AccessObjectProperty
  ) {
    const object = expression.object.accept(this)
    const propertyName = expression.token.lexeme as string

    if (object instanceof BuiltinClass) {
      if (expression.isSuperClassProperty) {
        const method = object.isClassInstance()
          ? object.getSuperClassProperty(propertyName)
          : object.getSuperClassStaticMethod(propertyName)

        if (method) {
          return method
        }
      }

      const method = object.isClassInstance()
        ? object.getProperty(propertyName)
        : object.getStaticMethod(propertyName)

      if (method) {
        return method
      }
    }

    throw new RuntimeException(
      `Object <${object.toString()}> has no property called <${propertyName}>`
    )
  }

  public visitExpressionStatement = (statement: Stmt.Expression) =>
    statement.expression.accept(this)

  public visitPrintStatement = (statement: Stmt.Print) =>
    console.log(JSON.stringify(statement.expression.accept(this), null, 2))

  public visitLetStatement(statement: Stmt.Let) {
    const value = statement.initializer
      ? statement.initializer.accept(this)
      : null

    this.environment.define(statement.name.lexeme as string, value)
  }

  public visitConstStatement(statement: Stmt.Const) {
    const value = statement.initializer.accept(this)
    this.environment.define(statement.name.lexeme as string, value, true)
  }

  public visitBlockStatement(statement: Stmt.Block) {
    const environment = new Environment()
    environment.setParentEnvironment(this.environment)

    this.executeBlock(statement.statements, environment)
  }

  public visitClassStatement(statement: Stmt.Class): void {
    const className = statement.name.lexeme as string
    const superclass = statement.superclass
      ? statement.superclass.accept(this)
      : null

    if (superclass && !(superclass instanceof BuiltinClass)) {
      throw new RuntimeException(`<${superclass}> is not a class`)
    }

    this.environment.define(className, null)

    const classMethods = new Map<string, BuiltinFunction>()
    for (const method of statement.methods) {
      classMethods.set(
        method.name.lexeme as string,
        new BuiltinFunction(method, this.environment)
      )
    }

    const staticMethods = new Map<string, BuiltinFunction>()
    for (const method of statement.staticMethods) {
      staticMethods.set(
        method.name.lexeme as string,
        new BuiltinFunction(method, this.environment)
      )
    }

    const builtinClass = new BuiltinClass(
      className,
      superclass,
      classMethods,
      staticMethods
    )
    this.environment.assign(statement.name, builtinClass)
  }

  public executeBlock(block: Statement[], environment: Environment) {
    let previousEnvironment = this.environment

    //try {
    this.environment = environment

    block.forEach(stmt => stmt.accept(this))
    //} catch (exception) {
    //console.error(exception);
    //} finally {
    this.environment = previousEnvironment
    //}
  }

  public visitIfStatement(statement: Stmt.If) {
    if (statement.condition.accept(this)) {
      statement.thenBranch.accept(this)
    } else if (statement.elseBranch) {
      statement.elseBranch.accept(this)
    }
  }

  public visitWhileStatement(statement: Stmt.While) {
    while (statement.condition.accept(this)) {
      statement.body.accept(this)
    }
  }

  public visitFunctionStatement(statement: Stmt.Function) {
    const fn = new BuiltinFunction(statement, this.environment)
    this.environment.define(statement.name.lexeme as string, fn)
  }

  public visitReturnStatement(statement: Stmt.Return) {
    const value = statement.value ? statement.value.accept(this) : null
    throw new ReturnException(value)
  }

  public resolve(expression: Expression, depth: number): Interpreter {
    this.locals.set(expression, depth)
    return this
  }

  public interpret(statements: Stmt.Statement[]) {
    try {
      statements.forEach(statement => statement.accept(this))
    } catch (exception) {
      console.error(exception)
    }
  }
}
