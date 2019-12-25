import Token from "../../lexer/Token";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import { Expression } from "./Expression";

export class Binary implements Expression {
  constructor(
    public readonly left: Expression,
    public readonly operation: Token,
    public readonly right: Expression
  ) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitBinaryExpression(this);
}
