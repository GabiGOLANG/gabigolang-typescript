import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import Token from "../../lexer/Token";

export class SetObjectProperty implements Expression {
  constructor(
    public readonly object: Expression,
    public readonly token: Token,
    public readonly value: Expression
  ) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitSetObjectPropertyExpression(this);
}
