import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Stmt from ".";

export class Class implements Statement {
  constructor(
    public name: Token,
    //public superclass: Variable,
    public methods: Stmt.Function[],
    public staticMethods: Stmt.Function[]
  ) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitClassStatement(this);
}
