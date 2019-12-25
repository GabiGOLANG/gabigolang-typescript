import { Expression } from "./Expression";
import Token from "../../lexer/Token";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";

export class Unary implements Expression {
  constructor(
    public readonly operation: Token,
    public readonly right: Expression
  ) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitUnaryExpression(this);
}
