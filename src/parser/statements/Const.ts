import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Expr from "../expressions";

export class Const implements Statement {
  constructor(public name: Token, public initializer: Expr.Expression) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitConstStatement(this);
}
