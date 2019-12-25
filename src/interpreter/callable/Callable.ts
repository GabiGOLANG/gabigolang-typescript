import Interpreter from "../Interpreter";

export default interface Callable {
  arity(): number;
  name(): string;
  __call(interpreter: Interpreter, args: any[]);
}
