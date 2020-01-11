import Interpreter from "../../Interpreter";
import { Maybe } from "../../../lib/Std";

export default interface Callable {
  __arity(): number;
  __name(): string;
  __call<T>(interpreter: Interpreter, args: any[]): Maybe<T>;
}
