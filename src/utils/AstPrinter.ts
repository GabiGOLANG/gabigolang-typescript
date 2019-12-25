import Visitor from "../interfaces/ExpressionVisitor";
import * as Expr from "../parser/expressions";

export default class AstPrinter implements Visitor<string> {
  public print = (expression: Expr.Expression): string =>
    expression.accept(this);

  private parenthesize = (name: string, ...expressions: any[]) =>
    `(${name} ${expressions.reduce(
      (result, expr) => `${result} ${expr.accept(this)}`,
      ""
    )})`.replace(/  /g, " ");

  public visitBinaryExpression = (expression: Expr.Binary): string =>
    this.parenthesize(
      expression.operation.lexeme as string,
      expression.left,
      expression.right
    );

  public visitUnaryExpression = (expression: Expr.Unary): string =>
    this.parenthesize(expression.operation.lexeme as string, expression.right);

  public visitGroupingExpression = (expression: Expr.Grouping): string =>
    this.parenthesize("group", expression.expression);

  public visitLiteralExpression = (expression: Expr.Literal): string =>
    expression.value === null || expression.value === undefined
      ? "nil"
      : expression.value.toString();
}
