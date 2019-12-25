import ExpressionVisitor from "../../interfaces/ExpressionVisitor";

export interface Expression {
  accept<T>(visitor: ExpressionVisitor<T>): T;
}
