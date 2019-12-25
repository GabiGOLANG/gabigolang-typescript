import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";

export class Grouping implements Expression {
  constructor(public readonly expression: Expression) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitGroupingExpression(this);
}
