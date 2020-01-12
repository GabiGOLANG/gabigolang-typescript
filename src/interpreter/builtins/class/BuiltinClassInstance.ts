import BuiltinClass from "./BuiltinClass";

export default class BuiltinClassInstance {
  //private fields: Map<string, any> = new Map<string, any>();

  constructor(private readonly builtinClass: BuiltinClass) {}

  public toString = (): string => `<${this.builtinClass.toString()}>`;

  /*   public getProperty(name: string) {
    if (this.fields.has(name)) {
      return this.fields.get(name);
    }

    const method = this.builtinClass.getMethod(name);
      if (method) {
      return method.__bind(this);
    }

    if(this.superclass) 
  }

  public setProperty(name: string, value: any): BuiltinClassInstance {
    this.fields.set(name, value);
    return this;
  } */
}
