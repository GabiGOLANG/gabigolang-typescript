import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import Token from "../../lexer/Token";

export class Super implements Expression {
  constructor(public readonly name: Token) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitSuperExpression(this);
}
