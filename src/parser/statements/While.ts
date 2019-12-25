import { Statement } from "./Statement";
import * as Expr from "../expressions";
import StatementVisitor from "../../interfaces/StatementVisitor";

export class While implements Statement {
  constructor(public condition: Expr.Expression, public body: Statement) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitWhileStatement(this);
}
