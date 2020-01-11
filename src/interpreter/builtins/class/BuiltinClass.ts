import Callable from "../callable/Callable";
import Interpreter from "../../Interpreter";
import BuiltinClassInstance from "./BuiltinClassInstance";
import BuiltinFunction from "../callable/BuiltinFunction";
import { Maybe } from "../../../lib/Std";

export default class BuiltinClass implements Callable {
  constructor(
    private readonly name: string,
    private methods: Map<string, BuiltinFunction>,
    private staticMethods: Map<string, BuiltinFunction>
  ) {}

  public toString = (): string => this.name;

  public __arity(): number {
    const constructor = this.getMethod("constructor");
    return constructor ? constructor.__arity() : 0;
  }

  public __name = (): string => this.name;

  public __call(interpreter: Interpreter, args: any[]): any {
    const instance = new BuiltinClassInstance(this);

    const constructor = this.getMethod("constructor");
    if (constructor) {
      constructor.__bind(instance).__call(interpreter, args);
    }
    return instance;
  }

  public getMethod = (name: string): Maybe<BuiltinFunction> =>
    this.methods.get(name);

  public getStaticMethod = (name: string) => this.staticMethods.get(name);
}
