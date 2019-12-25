import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Expr from "./../expressions";
import { Statement } from "./Statement";

export class Expression implements Statement {
  constructor(public expression: Expr.Expression) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitExpressionStatement(this);
}
