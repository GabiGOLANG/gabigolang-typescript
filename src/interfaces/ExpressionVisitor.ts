import * as Expr from "../parser/expressions";

export default interface ExpressionVisitor<T> {
  visitBinaryExpression(expression: Expr.Binary): T;
  visitUnaryExpression(expression: Expr.Unary): T;
  visitGroupingExpression(expression: Expr.Grouping): T;
  visitLiteralExpression(expression: Expr.Literal): T;
  visitVariableExpression(expression: Expr.Variable): T;
  visitAssignExpression(expression: Expr.Assign): T;
  visitLogicalExpression(expression: Expr.Logical): T;
  visitCallExpression(expression: Expr.Call): T;
}
