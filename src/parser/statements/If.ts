import { Statement } from "./Statement";
import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Expr from "../expressions";
import { Maybe } from "../../lib/Std";

export class If implements Statement {
  constructor(
    public condition: Expr.Expression,
    public thenBranch: Statement,
    public elseBranch: Maybe<Statement>
  ) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitIfStatement(this);
}
