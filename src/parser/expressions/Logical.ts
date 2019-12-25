import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import Token from "../../lexer/Token";

export class Logical implements Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression
  ) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitLogicalExpression(this);
}
