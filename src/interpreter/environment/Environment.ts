import Token from "../../lexer/Token";
import UndefinedVariableException from "../exceptions/UndefinedVariable";

export default class Environment {
  private parentEnvironment: Environment;
  private values: Map<string, any> = new Map<string, any>();

  public setParentEnvironment(environment: Environment): this {
    this.parentEnvironment = environment;
    return this;
  }

  public define(name: string, value: any): this {
    this.values.set(name, value);
    return this;
  }

  public assign(token: Token, value: any): this {
    if (this.values.has(token.lexeme as string)) {
      this.values.set(token.lexeme as string, value);
      return this;
    }

    if (this.parentEnvironment) {
      this.parentEnvironment.assign(token, value);
      return this;
    }

    throw new UndefinedVariableException(
      `Assignment on undefined variable "${token.lexeme}"`
    );
  }

  public get(name: Token): any {
    if (this.values.has(name.lexeme as string)) {
      return this.values.get(name.lexeme as string);
    }

    if (this.parentEnvironment) {
      return this.parentEnvironment.get(name);
    }

    throw new UndefinedVariableException(
      `Undefined variable "${name.lexeme}""`
    );
  }
}
