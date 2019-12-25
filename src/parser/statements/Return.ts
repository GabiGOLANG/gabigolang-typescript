import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Expr from "../expressions";

export class Return implements Statement {
  constructor(keyword: Token, value: Expr.Expression) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitReturnStatement(this);
}
