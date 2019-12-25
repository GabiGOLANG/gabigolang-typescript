import { Statement } from "./Statement";
import * as Expr from "../expressions";
import StatementVisitor from "../../interfaces/StatementVisitor";

export class Print implements Statement {
  constructor(public expression: Expr.Expression) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitPrintStatement(this);
}
