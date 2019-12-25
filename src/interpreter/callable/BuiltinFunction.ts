import Callable from "./Callable";
import * as Stmt from "../../parser/statements";
import Environment from "../environment/Environment";
import Interpreter from "../Interpreter";

export default class BuiltinFunction implements Callable {
  constructor(public declaration: Stmt.Function) {}

  public arity = () => this.declaration.params.length;

  public name = () => this.declaration.name.lexeme as string;

  public __call(interpreter: Interpreter, args: any[]) {
    const environment = new Environment().setParentEnvironment(
      interpreter.globals
    );

    for (let i = 0; i < this.declaration.params.length; ++i) {
      environment.define(this.declaration.params[i].lexeme as string, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
  }
}
