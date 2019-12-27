import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Expr from "../expressions";
import { Maybe } from "../../lib/Std";

export class Return implements Statement {
  constructor(public keyword: Token, public value: Maybe<Expr.Expression>) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitReturnStatement(this);
}
