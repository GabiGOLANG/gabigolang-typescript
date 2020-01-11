import Callable from "./Callable";
import * as Stmt from "../../../parser/statements";
import Environment from "../../environment/Environment";
import Interpreter from "../../Interpreter";
import { Maybe } from "../../../lib/Std";
import BuiltinClassInstance from "../class/BuiltinClassInstance";

export default class BuiltinFunction implements Callable {
  constructor(
    public readonly declaration: Stmt.Function,
    private readonly closure: Environment
  ) {}

  public __bind(instance: BuiltinClassInstance): BuiltinFunction {
    const environment = new Environment()
      .setParentEnvironment(this.closure)
      .define("this", instance);
    return new BuiltinFunction(this.declaration, environment);
  }

  public __arity = (): number => this.declaration.params.length;

  public __name = (): string => this.declaration.name.lexeme as string;

  public __call<T>(interpreter: Interpreter, args: any[]): Maybe<T> {
    const environment = new Environment().setParentEnvironment(this.closure);

    for (let i = 0; i < this.declaration.params.length; ++i) {
      environment.define(this.declaration.params[i].lexeme as string, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnException) {
      return returnException.value;
    }

    return null;
  }
}
