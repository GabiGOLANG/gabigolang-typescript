import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";
import * as Expr from "../expressions";
import { Maybe } from "../../lib/Std";

export class Let implements Statement {
  constructor(public name: Token, public initializer: Maybe<Expr.Expression>) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitLetStatement(this);
}
