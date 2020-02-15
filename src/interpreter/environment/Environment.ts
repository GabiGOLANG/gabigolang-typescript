import Token from "../../lexer/Token"
import UndefinedVariableException from "../exceptions/UndefinedVariable"
import IdentifierAlreadyDeclared from "../exceptions/IdentifierAlreadyDeclared"
import AssignmentToConstantVariableException from "../exceptions/AssignmentToConstantVariable"

export default class Environment {
  private parentEnvironment: Environment
  private values: Map<string, any> = new Map<string, any>()
  private constValues: Map<string, any> = new Map<string, any>()

  public setParentEnvironment(environment: Environment): this {
    this.parentEnvironment = environment
    return this
  }

  public define(name: string, value: any, __const: boolean = false): this {
    if (this.values.has(name) || this.constValues.has(name)) {
      throw new IdentifierAlreadyDeclared(name)
    }

    if (__const) {
      this.constValues.set(name, value)
    } else {
      this.values.set(name, value)
    }

    return this
  }

  public assign(token: Token, value: any): this {
    if (this.values.has(token.lexeme as string)) {
      this.values.set(token.lexeme as string, value)
      return this
    }

    if (this.constValues.has(token.lexeme as string)) {
      throw new AssignmentToConstantVariableException(token.lexeme as string)
    }

    if (this.parentEnvironment) {
      this.parentEnvironment.assign(token, value)
      return this
    }

    throw new UndefinedVariableException(
      `Assignment on undefined variable "${token.lexeme}"`
    )
  }

  public get(name: Token): any {
    const variableName = name.lexeme as string

    if (this.values.has(variableName)) {
      return this.values.get(variableName)
    }
    if (this.constValues.has(variableName)) {
      return this.constValues.get(variableName)
    }
    if (this.parentEnvironment) {
      return this.parentEnvironment.get(name)
    }

    throw new UndefinedVariableException(variableName)
  }

  private getEnvironmentAt(scopeDistance: number): Environment {
    let currentEnvironment: Environment = this

    for (let i = 0; i < scopeDistance; ++i) {
      currentEnvironment = currentEnvironment.parentEnvironment
    }

    return currentEnvironment
  }

  public getAtScope = (scopeDistance: number, token: Token) =>
    this.getEnvironmentAt(scopeDistance).get(token)

  public assignAtScope(
    scopeDistance: number,
    token: Token,
    value: any
  ): Environment {
    this.getEnvironmentAt(scopeDistance).assign(token, value)
    return this
  }
}
