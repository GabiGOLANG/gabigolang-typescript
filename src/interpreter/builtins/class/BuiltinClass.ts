import Callable from "../callable/Callable";
import Interpreter from "../../Interpreter";
import BuiltinFunction from "../callable/BuiltinFunction";
import { Maybe } from "../../../lib/Std";
import RuntimeException from "../../exceptions/Runtime";

export default class BuiltinClass implements Callable {
  private properties = new Map<string, any>();

  constructor(
    private readonly name: string,
    private superclass: Maybe<BuiltinClass>,
    private methods: Map<string, BuiltinFunction>,
    private staticMethods: Map<string, BuiltinFunction>,
    private _isClassInstance: boolean = false
  ) {}

  public toString = (): string => this.name;

  public __arity(): number {
    const constructor = this.getMethod("constructor");
    return constructor ? constructor.__arity() : 0;
  }

  public __name = (): string => this.name;

  public __call(interpreter: Interpreter, args: any[]): any {
    const instance = new BuiltinClass(
      this.name,
      this.superclass?.__call(interpreter, []),
      this.methods,
      this.staticMethods,
      true
    );

    const constructor = this.getMethod("constructor");
    if (constructor) {
      constructor.__bind(instance, this.superclass).__call(interpreter, args);
    }

    return instance;
  }

  public getMethod(name: string): Maybe<BuiltinFunction> {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }
    if (this.superclass) {
      return this.superclass.getMethod(name);
    }
    return null;
  }

  public getStaticMethod(name: string): Maybe<BuiltinFunction> {
    if (this.staticMethods.has(name)) {
      return this.staticMethods.get(name);
    }
    if (this.superclass) {
      return this.superclass.getStaticMethod(name);
    }
    return null;
  }

  public getProperty(name: string) {
    if (this.properties.has(name)) {
      return this.properties.get(name);
    }

    const method = this.getMethod(name);
    if (method) {
      return method.__bind(this, this.superclass);
    }

    if (this.superclass) {
      const method = this.superclass.getMethod(name);
      if (method) {
        return method.__bind(this, this.superclass);
      }
    }

    throw new RuntimeException(
      `Object <${this.toString()}> has no property <${name}>`
    );
  }

  public setProperty(name: string, value: any): this {
    this.properties.set(name, value);
    return this;
  }

  public getSuperClassMethod(name: string): Maybe<BuiltinFunction> {
    if (this.superclass) {
      return this.superclass.getMethod(name);
    }
    return null;
  }

  public getSuperClassStaticMethod(name: string): Maybe<BuiltinFunction> {
    if (this.superclass) {
      return this.superclass.getStaticMethod(name);
    }
    return null;
  }

  public getSuperClassProperty(name: string) {
    if (this.superclass) {
      const method = this.superclass.getProperty(name);
      if (method) {
        return method.__bind(this, this.superclass);
      }
    }

    return null;
  }

  public isClassInstance = (): boolean => this._isClassInstance;
}
