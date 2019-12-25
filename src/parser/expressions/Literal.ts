import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";

export class Literal implements Expression {
  constructor(public readonly value) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitLiteralExpression(this);
}
